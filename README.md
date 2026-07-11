# Customer Support Assistant

An AI assistant for a food-delivery service (modelled on Swiggy). A customer
types a message in plain language; the assistant works out what they want,
gathers the facts it needs, decides what it is allowed to do, and either
resolves the issue or hands it to a human — while streaming every decision it
makes to a live dashboard so you can watch it think.

## How it works

Every message flows through one shared pipeline:

1. **Understand the message.** The assistant reads the customer's message and
   sorts it into one of a few types (see *Classification* below). It also
   reports how confident it is and how urgent the situation is.
2. **Check the assistant is sure enough.** If confidence is below a set bar,
   the assistant asks the customer a clarifying question and tries again. After
   a couple of failed attempts it stops guessing and winds the conversation
   down gracefully.
3. **Route to the right specialist.** Once confident, the message is sent to
   the handler built for that type of request.
4. **Reply.** Every branch ends by sending the customer a written response.

The whole conversation is remembered between messages, so multi-step exchanges
(clarifications, yes/no confirmations) pick up where they left off.

## Classification

The assistant labels each message as one of:

- **Query** — the customer just wants to *know* something (order status, a
  policy). The answer is the whole goal.
- **Complaint** — the customer is *unhappy* about their experience, whether or
  not they also ask for a fix. Dissatisfaction is the deciding signal.
- **Service request** — the customer wants something *changed* (cancel,
  reschedule, refund) and is *not* unhappy — a neutral, transactional ask.
- **Irrelevant / needs clarification** — not something support can act on, or
  too vague to act on yet.

Alongside the label, the assistant returns a **confidence score** (used to
decide whether to ask for clarification) and an **urgency level** — Low,
Medium, or High — judged by how much the customer is harmed if the reply is
delayed (a safety risk or something going wrong *right now* is High; a
finished, bounded problem is Medium; a general question is Low). Urgency is
based on consequences, not on how angry the wording sounds.

## What each branch does

### Query — answer the question

The query handler first works out what it needs to answer: general knowledge
(from a searchable knowledge base of policies and FAQs), the customer's own
account and order details, or both. It fetches only what's relevant, then
writes a natural-language answer grounded in those facts. No changes are made
to any order.

### Complaint & service request — validate, confirm, then act

Both of these can result in a real action (a refund, a cancellation), so they
share the same careful flow:

1. **Acknowledge** — tell the customer their request is being looked into.
2. **Validate eligibility** — gather the relevant policy and the customer's
   order data, then decide whether the request qualifies. The outcome is one
   of: *fully eligible*, *partially eligible*, *not eligible*, or *needs a
   human*. The customer is told the verdict and the reasoning.
3. **Confirm** — if some action is warranted, ask the customer to confirm
   before anything is done.
4. **Act (remediation)** — on confirmation, carry out the approved action by
   calling the appropriate back-office tool. If the customer declines, or the
   case needs judgement, or the tool call fails, the case is escalated to a
   human instead.

The only difference between the two branches is the entry point: complaints
begin from an expression of dissatisfaction, service requests from a neutral
ask. The safeguards — validate before acting, confirm before acting, escalate
on doubt or failure — are identical.

## Remediation actions (tools)

When an action is approved, the assistant picks the matching back-office tool:

| Situation | Tool |
|---|---|
| Money owed back | Issue a refund |
| Order should be stopped | Cancel the order |
| Item missing from an order | Send a replacement |
| Goodwill / partial compensation | Apply store credit |
| Delivery timing needs to change | Reschedule the delivery |

In this demo these tools are simulated and occasionally fail on purpose, so you
can see the assistant fall back to human escalation when an action doesn't go
through.

## End-to-end examples

**Query —** *"What is Swiggy One membership?"*
→ Classified as a query. The assistant recognises this needs general knowledge,
searches the policy/FAQ knowledge base, and writes a plain answer describing the
membership. No order is touched.

**Complaint —** *"My order arrived cold and an item was missing, I want a refund."*
→ Classified as a complaint (High-to-Medium urgency). The assistant
acknowledges it, pulls the refund policy and the customer's order, and decides
the request is eligible. It tells the customer the verdict and asks them to
confirm. On "yes", it issues the refund and confirms it's done. If the refund
tool fails, it escalates to a human instead.

**Service request —** *"Reschedule my delivery to tomorrow evening."*
→ Classified as a service request (neutral, Medium urgency). Same validate →
confirm → act flow: it checks whether rescheduling is allowed for this order,
confirms with the customer, then calls the reschedule tool and reports success.

**Clarification —** *"hmm"*
→ Too vague to classify confidently. The assistant asks the customer what they
need. If two attempts still don't clear it up, it closes out politely rather
than guessing.

## Live dashboard

A built-in web chat shows the conversation on the left and, on the right, a
running trace of every decision — the label and confidence, the urgency, the
eligibility verdict, which tool was called and whether it succeeded, and the
message sent back. Run it with `pnpm web` inside `ai-server` and open
`http://localhost:3000`.
