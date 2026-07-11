import "dotenv/config";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import { Command } from "@langchain/langgraph";
import { mainGraph } from "../agents/mainAgent/graph.js";
import type { MainState } from "../agents/shared/schema.js";

type ChatHistory = MainState["chatHistory"];

type TraceStep = { node: string; scope: string; detail: string };

type Session = {
  history: ChatHistory;
  awaiting: boolean;
};

const sessions = new Map<string, Session>();

function hasPending(snapshot: any): boolean {
  for (const task of snapshot?.tasks ?? []) {
    if (task?.interrupts?.length) return true;
    if (task?.state && hasPending(task.state)) return true;
  }
  return false;
}

function truncate(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

function summarize(delta: any): string[] {
  const lines: string[] = [];

  const intent = delta?.intent;
  if (intent) {
    if (intent.category) {
      const conf =
        typeof intent.confidence === "number"
          ? ` (confidence ${intent.confidence.toFixed(2)})`
          : "";
      lines.push(`intent = ${intent.category}${conf}`);
    }
    if (intent.reason) lines.push(`reason: ${truncate(intent.reason)}`);
    if (typeof intent.isReliable === "boolean") {
      lines.push(`reliable = ${intent.isReliable}`);
    }
  }

  const verdict = delta?.resolution?.validation?.verdict;
  if (verdict) {
    lines.push(`verdict = ${verdict.eligibility}`);
    if (verdict.internalAction) {
      lines.push(`internal: ${truncate(verdict.internalAction)}`);
    }
  }

  const remediation = delta?.resolution?.remediation;
  if (remediation && (remediation.toolName || "succeeded" in remediation)) {
    lines.push(
      `tool = ${remediation.toolName ?? "?"} → succeeded = ${remediation.succeeded}`,
    );
  }

  const nextMessage = delta?.util?.nextMessage;
  if (nextMessage) lines.push(`→ sends: "${truncate(nextMessage)}"`);

  return lines;
}

async function streamGraph(
  input: any,
  config: { configurable: { thread_id: string } },
  emit: (event: string, data: unknown) => void,
): Promise<void> {
  const seenLines = new Set<string>();
  const sentMessages = new Set<string>();
  const stream = await mainGraph.stream(input, {
    ...config,
    streamMode: "updates",
    subgraphs: !(input instanceof Command),
  });

  for await (const chunk of stream as any) {
    const isTuple = Array.isArray(chunk);
    const namespace: string[] = isTuple ? chunk[0] : [];
    const update: Record<string, any> = isTuple ? chunk[1] : chunk;
    const scope =
      namespace && namespace.length
        ? namespace.map((n) => n.split(":")[0]).join(" / ")
        : "main";
    for (const [node, delta] of Object.entries(update)) {
      if (node === "__interrupt__") continue;

      const fresh = summarize(delta).filter((line) => !seenLines.has(line));
      if (fresh.length) {
        for (const line of fresh) seenLines.add(line);
        const step: TraceStep = { node, scope, detail: fresh.join("\n") };
        emit("trace", step);
      }

      const message = delta?.util?.nextMessage;
      if (typeof message === "string" && message && !sentMessages.has(message)) {
        sentMessages.add(message);
        emit("message", { text: message });
      }
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../public");

const app = express();
app.use(express.json());
app.use(express.static(publicDir));

app.post("/api/chat", async (req, res) => {
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const incomingThreadId =
    typeof req.body?.threadId === "string" ? req.body.threadId : undefined;

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  if (incomingThreadId && !sessions.has(incomingThreadId)) {
    res.status(400).json({ error: "unknown threadId" });
    return;
  }

  const threadId = incomingThreadId ?? randomUUID();
  const config = { configurable: { thread_id: threadId } };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const emit = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    let input: any;

    if (!incomingThreadId) {
      const history: ChatHistory = [{ author: "user", message }];
      sessions.set(threadId, { history, awaiting: false });
      input = { chatHistory: history };
    } else {
      const session = sessions.get(threadId)!;
      if (session.awaiting) {
        input = new Command({ resume: message });
      } else {
        session.history = [...session.history, { author: "user", message }];
        input = { chatHistory: session.history };
      }
    }

    await streamGraph(input, config, emit);

    const snapshot = await mainGraph.getState(config, { subgraphs: true });
    const session = sessions.get(threadId)!;
    session.history = snapshot.values?.chatHistory ?? session.history;
    session.awaiting = hasPending(snapshot);

    emit("done", { threadId, awaiting: session.awaiting });
  } catch (err) {
    console.error("chat error:", err);
    emit("error", { error: "internal error" });
  } finally {
    res.end();
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});

const port = Number(process.env.WEB_PORT ?? 3000);
app.listen(port, () => {
  console.log(`Chat UI running at http://localhost:${port}`);
});
