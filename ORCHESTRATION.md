# ORCHESTRATION.md — Parallel Workstream Coordination (AcmeFintech Platform)

## Purpose

This document is the shared coordination state for parallel agent and engineer workstreams on this codebase. It tracks what is actively in motion, who owns it, which files are claimed, and where the integration points are.

This is the **transient** layer of agent context — short-lived, frequently updated, scoped to active work. The durable layer (`AGENTS.md`, ADRs, module summaries) does not change with each workstream.

Every agent session in this repo must read this document before starting work. See the **Multi-Agent Coordination** section of the root `AGENTS.md` for the session-start protocol.

---

## Active Workstreams

| Workstream ID | Owner | Branch | Started | Files / Modules Claimed | Status |
| --- | --- | --- | --- | --- | --- |
| `agent-a/payments-refactor` | @stephen.lester | `agent-a/payments-refactor` | 2026-05-14 | `services/payments/src/routes/`, `services/payments/src/services/` | In progress |
| `agent-b/payments-tests` | @stephen.lester | `agent-b/payments-tests` | 2026-05-15 | `services/payments/src/__tests__/` | In progress |
| `agent-c/openapi-update` | @stephen.lester | `agent-c/openapi-update` | 2026-05-15 | `services/payments/openapi.yaml`, `services/auth/openapi.yaml` | In progress |

**Workstream ID format:** `<agent-or-engineer-id>/<short-task-description>`. Use kebab-case. Match the branch name exactly so any commit can be traced back to its workstream entry.

**Owner:** One person, never a committee. The owner is the integrator — they review the agent's work, speak for the workstream in coordination conversations, and merge to main.

**Files / Modules Claimed:** As specific as possible. Directory-level when the whole subtree is in scope; file-level when only a few files are touched. Other workstreams must not modify these without coordinating with the owner.

---

## Integration Points

Scheduled points where active workstreams converge.

| Date | Type | Workstreams Involved | Owner |
| --- | --- | --- | --- |
| 2026-05-22 | Merge to main | `agent-a/payments-refactor`, `agent-b/payments-tests` | @stephen.lester |
| 2026-05-29 | Cross-program review | All payments workstreams | @stephen.lester |

**Rules:**

- All workstreams must close out or pause before their next scheduled integration point.
- If a workstream needs to extend beyond its integration point, the owner adds a note here and notifies the other workstream owners.
- Long-lived parallel branches diverge faster with agents than with humans. Default to short integration cycles.

---

## Cross-Cutting Decisions

Decisions made during parallel work that affect more than one workstream. These are lighter-weight than full ADRs but heavier than a Slack message — they live here until they stabilize and graduate to an ADR or are reversed.

| Date | Decision | Affects | Made By |
| --- | --- | --- | --- |
| 2026-05-14 | Payments service routes will use the new `withIdempotencyKey` middleware exclusively. Direct-DB idempotency checks removed. | `agent-a/payments-refactor`, `agent-b/payments-tests` | @stephen.lester |

**Lifecycle:**

- Decisions that stabilize across multiple integration cycles should be promoted to ADRs in `docs/adr/`.
- Decisions that are reversed should be removed, or noted as reversed and dated.
- Don't let this section grow unbounded. If it has more than ~10 active entries, several should have already graduated.

---

## How This Document Works

- **At session start:** every agent reads this file as part of context initialization, identifies its workstream, and checks for overlaps with other active workstreams.
- **At session end:** the agent updates the status, files claimed, and any new cross-cutting decisions. The Memento Method skill (`.claude/skills/memento-method/SKILL.md`) handles the session-end write as part of its handoff process.
- **On workstream completion:** the owner removes the entry from Active Workstreams. Long-lived integration history is preserved in git, not here.
- **On conflict:** if two workstreams need the same files, the second one to need them stops and escalates to the owners of both. No silent races.

---

## How to Update This File

This file is owned by the team running parallel work on this repo. It is intentionally lightweight — keep entries short, keep the workstream list current, prune completed workstreams aggressively.

For coordination patterns at the program level (multiple teams, multi-repo), this file is not enough. See the Center of Platform Excellence (COPE) operating model documentation for how parallel programs are coordinated at the platform layer.
