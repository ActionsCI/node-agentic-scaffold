---
name: memento-method
description: Externalize session state into SESSION.md before context loss, generating a 5-section handoff document and flagging content ready to promote to durable artifacts (ADRs, AGENTS.md rules, module summaries). Trigger on session-end language ("wrap up", "save state", "checkpoint", "pick this up tomorrow", "I need to step away", "handoff this"), before /clear or /compact, after substantive multi-step work that may span sessions, or whenever significant in-progress state risks being lost. Lean toward invoking even without an explicit ask — the cost of a redundant SESSION.md is low, the cost of losing state to compaction is high.
---

# Memento Method: Session Handoff for Coding Agents

## Why this exists

Coding agents have no memory across sessions. Whatever was learned, decided, or planned during a session is gone the moment the session ends — via `/clear`, auto-compaction, the user stepping away, or a fresh process.

The fix is the same one engineering teams use for handoffs between people: externalize state into a structured artifact the next session can read. `SESSION.md` is that artifact. It captures **transient state** — the work in motion right now — and stays distinct from the **durable layer** (`AGENTS.md`, ADRs, module summaries) where stable knowledge lives.

This skill does two things: generate and maintain `SESSION.md`, and run a **graduation check** that flags content stable enough to promote into the durable layer.

## What to do when invoked

### 1. Locate or create the handoff file

Check for an existing handoff at the repo root in this priority order, and update in place if found:

1. `SESSION.md`
2. `HANDOFF.md`
3. `.claude/SESSION.md`

If none exists, create `SESSION.md` at the repo root. If `AGENTS.md` or existing files indicate a different convention, match that instead.

### 2. Generate content from the actual session

Pull from what actually happened in the conversation. Do not invent state.

The five sections below mirror what the next session needs to bootstrap coherently — goal (what was being worked on), decisions (so they aren't relitigated), state (so progress isn't double-counted), open questions (so they get resolved before building further), and next action (so resumption is one step, not a search). The structure is recommended, not sacred — match a project's existing convention if it has one.

```markdown
# Session Handoff

_Last updated: [ISO-8601 timestamp]_
_Session focus: [one-line summary]_

## 1. Current Goal

One sentence. Not the sprint goal — the specific thing being worked on
when the session ended.

## 2. Decisions Made This Session

For each decision:
- **Decision:** [what was decided]
- **Rationale:** [why — the reasoning that makes this decision durable]
- **Alternatives considered:** [optional, only if non-obvious]

These are decisions not yet stable enough to be ADRs but should not be
relitigated next session.

## 3. State of the Work

- **Done:** [files / functions / capabilities completed and verified]
- **In progress:** [files / functions partially implemented; specify where]
- **Blocked:** [items + the specific blocker]
- **Untested:** [code that exists but has not been verified]

Be specific about file paths and function names. Vague state descriptions
are worse than no state descriptions.

## 4. Open Questions

Anything left uncertain — places the agent hedged, things deferred,
calls the user said they wanted to make later.

## 5. Next Concrete Action

Not a goal, an action. The first specific thing the next session should
do — file to edit, command to run, question to answer.
"Continue with auth flow" is too vague. "Wire `validateToken` into
`authMiddleware.ts` and add the negative-path test" is the right level.
```

A few things to keep in mind while filling it in:

- **Decisions need rationale.** A decision without rationale is a fact; a decision with rationale is durable knowledge. Capture the *why*, not just the verb.
- **Be honest about state.** Better to mark something "untested" than claim it's done. The next session reading a falsely-confident handoff is worse than reading no handoff at all.
- **Open questions belong here, not in the head of whoever picks it up next.** If the user hedged, write it down.

### 3. Run the graduation check

The graduation check is what keeps SESSION.md from rotting into a stale dump. Compare the new content against the prior version:

- If `SESSION.md` is tracked in git: `git log -p -- SESSION.md` shows recent versions; diff the latest against what you're about to write.
- Otherwise compare against the file currently in the working tree.
- If neither exists, this is the first session — skip the graduation check and say so explicitly: "First session — no graduation check yet."

Look for content that has stabilized:

- **Decision graduation → ADR candidate.** A decision that has appeared across 2+ recent sessions is no longer in flight. Suggest a filename like `docs/adr/NNNN-<slug>.md`.
- **Pattern graduation → AGENTS.md rule.** A recurring correction or convention the agent keeps re-deriving belongs in `AGENTS.md`. Suggest where in the AGENTS.md hierarchy it should live (root, service-level, module-level).
- **Architecture graduation → module summary update.** A clarified architectural detail that affects how a module should be understood belongs in that module's summary doc.

After listing graduation candidates, **prune them from the new SESSION.md.** The handoff stays focused on what is actively in motion. Bloat in SESSION.md is a failure mode — it turns into something nobody trusts.

Surface candidates as a separate section the user can act on:

```markdown
## Graduation Candidates

The following content has stabilized and should be promoted to the durable layer:

- **[Decision X]** → ADR: `docs/adr/NNNN-x.md`
- **[Pattern Y]** → AGENTS.md rule at `<path>/AGENTS.md`
- **[Architecture clarification Z]** → update `<module>/MODULE.md`
```

Do not promote candidates yourself. The user decides what graduates and when.

### 4. Hand off to the user

Show the user three things:

1. The updated `SESSION.md` content so they can correct anything wrong.
2. The graduation candidates so they can decide what to promote.
3. A bootstrap line for the next session, e.g.:

> Next session, start by reading `SESSION.md` before any other context. Then proceed with: [next concrete action].

Do not commit on the user's behalf unless they explicitly ask. The user is the editor; the skill produces the draft.

## Triggering on context fill

If the harness exposes context-window state (some clients do, most don't), treat ≥70% fill as a proactive trigger. If that visibility isn't available, rely on the language signals in the description and on work milestones — completing a substantive multi-step task is itself a good trigger, even if no one says "wrap up."

## Key principles

- **SESSION.md is transient.** It gets overwritten each session. Content that needs to persist graduates to AGENTS.md, ADRs, or module summaries.
- **Specificity beats brevity beats completeness.** A short, specific SESSION.md beats a long, vague one. If a section has nothing to report, write "None this session" — don't pad.
- **The user is the editor.** The skill drafts; the user corrects and commits.
- **Graduation is the engine.** Without it, either SESSION.md grows unbounded or important decisions stay trapped at the transient layer. Run the check every session except the first.

## What this skill does not do

- It does not replace AGENTS.md, ADRs, or module summaries — those are the durable layer this skill feeds into.
- It does not auto-commit.
- It does not promote graduation candidates automatically; it only surfaces them.
- It does not invent state. If invoked with nothing real to externalize, acknowledge and skip.

## Example invocation

**User:** "Let's wrap up for today, I need to step away."

**Agent:**

> I'll externalize the session state to `SESSION.md` so we can resume cleanly tomorrow.
>
> [generates the 5-section handoff]
>
> Graduation candidates from comparing against last session's `SESSION.md`:
> - Decision to use `pg-boss` for the job queue has now appeared in 3 consecutive sessions → ADR candidate at `docs/adr/0007-job-queue.md`
> - Pattern of always wrapping API errors in `ErrorEnvelope` is recurring → AGENTS.md rule candidate at `services/api/AGENTS.md`
>
> Review the draft above. When you're ready, commit `SESSION.md` and consider promoting the candidates.
>
> Next session, start by reading `SESSION.md`, then: wire `validateToken` into `authMiddleware.ts` and add the negative-path test.
