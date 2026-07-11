# Query Agent

The query agent answers **informational** customer messages — the ones that can
be satisfied by *reading* resources, with no change to any state. Anything whose
goal is to *change* something (refund, cancel, replace) is classified as a
`SERVICE_REQUEST` instead and never reaches here.

## Where it sits

```
intentClassifier → isReliable ─(reliable & QUERY)→ queryAgent → END
```

The main graph's `routeOnReliability` dispatches a reliable `QUERY`
classification into the query agent (`mainAgent/graph.ts`). Other reliable
categories currently fall through to `END` until their agents are built.

## Internal shape

```
                 ┌─→ faq ──────┐
START → plan ────┤              ├─→ compose → send → END
                 └─→ userInfo ──┘
```

| Node        | File                                   | Responsibility |
|-------------|----------------------------------------|----------------|
| `plan`      | `planner/nodes.ts`                     | Decides which resources are needed and writes a self-contained request for each. |
| `faq`       | `faqAgent/nodes.ts`                    | RAG retrieval over the FAQ knowledge base. |
| `userInfo`  | `userInfoFetcherAgent/nodes.ts`        | Reads selected fields from the customer's record. |
| `compose`   | `nodes.ts`                             | Single final LLM generation, grounded in the gathered context. |
| `send`      | `utilAgents/sendMessageToUser` (reused)| Delivers the answer to the user. |

### 1. Planner

The planner does **not** answer the question. It classifies the query into the
resources required and writes a **self-contained instruction** for each
(`{ needed, request }`), because that request is later fed to a sub-agent on its
own, out of conversational context.

Three cases fall out naturally:

- FAQ only — e.g. *"What is your cancellation policy?"*
- user info only — e.g. *"Where is my order?"*
- both — a general rule applied to the customer's facts, e.g. *"Do you deliver
  to my area?"* = coverage rules (FAQ) + saved address (user info).

`router/routeOnPlan.ts` fans out to only the requested sub-agents (returning an
array of targets so they run in parallel), or straight to `compose` if neither
is needed.

### 2. FAQ agent (RAG)

Retrieval-Augmented Generation, retrieval half only:

- `src/db/faq.json` (72 Swiggy FAQ entries) is embedded once with
  `text-embedding-3-small` into an **on-disk HNSWLib index**
  (`src/db/faqRetriever.ts` → `src/db/faqIndex/`, gitignored).
- Later runs `HNSWLib.load()` the index from disk instead of re-embedding.
- `retrieveFaq(query, k)` returns the top-k semantically relevant Q&As.

The retriever lives in `src/db/` (not inside the agent) so other agents can
reuse it. Generation is **not** done here — it happens once in `compose`.

### 3. User-info fetcher (schema-constrained read)

Rather than give an LLM raw DB access, we constrain it:

1. `listPaths(userProfile)` flattens the record into dot-paths (the "schema").
2. The LLM is shown that key list and returns **only the keys it needs**
   (structured output, `schema.ts` → `{ keys: string[] }`).
3. `pickPaths()` extracts those values in code; unknown keys are ignored.

So the model chooses *what* to read; deterministic code does the reading. Path
helpers live in `userInfoFetcherAgent/utils/paths.ts`.

### 4. Compose

Takes the original question plus whatever `faq.result` / `userInfo.result` were
gathered and produces the final, user-facing answer with one LLM call. Uses a
`StringOutputParser` (the output is prose, not structured fields). The answer is
staged into `util.nextMessage` and delivered by the reused send-message util
agent inside the query graph.

## State

Query state is one nested object on `MainState`, mirroring `intent` / `util`:

```ts
query: {
  faq?:      { needed, request, result? },
  userInfo?: { needed, request, result? },
  answer?:   string,
}
```

Because `faq` and `userInfo` run **in parallel** and both write `query`, the
channel has a shallow-merge **reducer** (`shared/schema.ts`,
`withLangGraph(..., { reducer })`) so their partial updates combine instead of
clobbering each other.

## Code-quality practices

- **One file, one responsibility.** Nodes (`nodes.ts`), prompts (`prompt.ts`),
  Zod schemas (`schema.ts`), routers (`router/`), and pure helpers (`utils/`)
  are each separated. A node file wires an LLM call; it does not also define its
  schema or hold reusable helpers.
- **Colocation by feature.** Everything a sub-agent needs lives in its own
  folder (`faqAgent/`, `userInfoFetcherAgent/`). Shared/reusable pieces are
  lifted out deliberately — the FAQ retriever sits in `src/db/` precisely
  because it is not query-agent-specific.
- **Typed end-to-end with Zod as the single source of truth.** State and LLM
  I/O are Zod schemas; TS types are `z.infer`'d from them, never hand-written in
  parallel. `MainState = z.infer<typeof MainStateZod>`.
- **Structured output is typed, prose is parsed.** LLM calls that feed code use
  `withStructuredOutput(zodSchema)` so the result is validated and typed
  (planner, classifier, key-selector). The one call whose output is prose uses
  `StringOutputParser` to get a clean `string` — no manual
  `typeof content === "string" ? ... : JSON.stringify(...)` narrowing.
- **Narrow function signatures.** Nodes accept `Pick<MainState, ...>` of only
  the keys they read, and return `Partial<MainState>` of only what they write.
  The signature documents the node's true input/output surface.
- **Pure, testable helpers.** Path logic (`listPaths` / `pickPaths`) is pure
  functions with no LLM or state dependency, isolated in `utils/paths.ts` so it
  can be reasoned about and tested independently.
- **Deterministic code does deterministic work.** The LLM only *chooses* keys;
  plain code does the actual extraction (`pickPaths`) and skips unknown keys.
  Retrieval ranking is delegated to the vector store, not reimplemented by hand.
- **No dead code.** Unused subgraph/prompt stubs were deleted rather than left
  "just in case." Files exist only if imported.
- **Comments explain *why*, not *what*.** Comments are reserved for non-obvious
  rationale (the merge reducer, the parallelism constraint). Self-evident code
  is left uncommented; deferred work is a `TODO`, not prose.
- **Reuse over reinvention.** Sending goes through the existing
  `sendMessageToUser` util agent; similarity search goes through LangChain's
  `HNSWLib`; embeddings/LLM clients are shared singletons in `src/llm/`.
- **Fail loud on invariant violations.** Helpers like `getLastUserMessage`
  throw on impossible states (empty history, wrong author) instead of returning
  a silent default.
- **`noUncheckedIndexedAccess` respected.** Array/object index access is
  explicitly guarded or asserted (`!`) with justification, matching the strict
  `tsconfig`.
- **Idempotent, cached side effects.** The embedding index is built once and
  persisted; subsequent loads are cheap and deterministic. The store instance is
  memoized per process behind a promise, so concurrent calls don't rebuild it.

## Known gaps / TODO

- The on-disk FAQ index is not auto-invalidated when `faq.json` changes — delete
  `src/db/faqIndex/` to force a rebuild.
- `compose` grounding relies on prompt discipline; it can still generalize
  slightly beyond retrieved context. Tighten via larger `k` or a stricter prompt
  if strict grounding is required.
- Complaint and service-request agents are not built; reliable non-QUERY
  intents fall through to `END`.
