# Copilot / Agent Instructions

> This file tells AI coding agents (GitHub Copilot, Claude Code, Cursor, and others) how to navigate this repository. Read this before making any changes.

## TL;DR — 30 Second Primer

If this is your first time working in this repo:

1. Read the root [AGENTS.md](../AGENTS.md) — it covers the golden rules, tech stack, and conventions.
2. Read the AGENTS.md in the directory you're editing (e.g., `services/auth/AGENTS.md`).
3. If your task requires modifying a **frozen file** or breaking a **golden rule**, **stop and ask the operator** — do not proceed.
4. Write the code. Write the tests (80% coverage minimum). Use the standard error envelope. Done.

The rest of this document expands on each of these points.

## Reading AGENTS.md Files

Before modifying any file, read the relevant AGENTS.md files in order:

1. **Start with the root [AGENTS.md](../AGENTS.md).** It contains golden rules, tech stack, and conventions that apply everywhere.
2. **Then read the AGENTS.md closest to the file you're changing:**
   - Working in `services/auth/`? → Read [`services/auth/AGENTS.md`](../services/auth/AGENTS.md)
   - Working in `services/auth/src/routes/`? → Also read [`services/auth/src/routes/AGENTS.md`](../services/auth/src/routes/AGENTS.md)
   - Working in `services/payments/`? → Read [`services/payments/AGENTS.md`](../services/payments/AGENTS.md)
   - Adding to `shared/`? → Read [`shared/AGENTS.md`](../shared/AGENTS.md)
3. **Rules cascade downward.** A directory-level AGENTS.md can add stricter rules, but never relaxes a parent rule. When in doubt, the parent wins.

## SPEC.md + AGENTS.md

- `SPEC.md` defines **what** to build — goals, acceptance criteria, definition of done.
- `AGENTS.md` defines **how** to build it — rules, conventions, and constraints.

Always read both before starting work. If a spec doesn't exist for the task you're being asked to do, ask the operator to create one before writing code.

## When to Stop and Ask

**Stop immediately and flag to the human operator** when:

- A task requires modifying a file listed as **frozen** in any AGENTS.md
- A task requires breaking a **golden rule** in the root AGENTS.md
- A task requires changing a **frozen interface** (signature of a public API route)
- A task requires adding a new **third-party integration** to the payments service
- You discover an **existing rule is wrong or outdated** — don't silently ignore it
- The scope of the task has grown beyond what the spec describes

This is not a judgment on your ability. It's how the engineering team here catches risky changes before they ship.

### Escalation — Examples

**Example 1 — Escalate.** Task: "Add account lockout after 5 failed login attempts."
The lockout logic lives in auth service code, but enforcing it requires changes to `src/middleware/verify-token.js`, which is frozen. Stop and ask — this needs security team review before proceeding.

**Example 2 — Proceed.** Task: "Add a new `POST /auth/validate-token` endpoint."
Not a frozen interface. Not a golden rule violation. Write the route in `src/routes/`, register it in the middleware chain, add tests that hit 80% coverage, and open the PR.

**Example 3 — Escalate.** Task: "Have the payments service query the database directly to reduce DAL latency."
This violates Golden Rule #2 and a local payments rule. Do not proceed. Reply to the operator explaining the rule and ask whether the latency concern should be addressed inside the DAL instead.

**Example 4 — Escalate.** Task: "Update the `POST /payments/intent` response to include a new `riskScore` field."
That route is a frozen interface. Adding fields to existing endpoints without a versioning plan breaks client contracts. Stop and ask for the versioning approach (new endpoint vs. additive change with compatibility review).

## Files Off-Limits Without Explicit Approval

Consolidated list of files that must not be modified without the appropriate review. Each is also documented in its service-level AGENTS.md with the reasoning.

| File | Approver |
|------|----------|
| `services/auth/src/routes/logout.js` | Security team |
| `services/auth/src/middleware/verify-token.js` | Security team |
| `services/auth/src/middleware/session-hydrate.js` | Security team |
| Any file in `services/payments/src/` that would add a direct database driver import | Architecture + payments lead |
| Any frozen interface listed in `services/payments/AGENTS.md` | Platform + payments lead |
| Golden rules section of the root `AGENTS.md` | COPE |
| `.github/workflows/` (when added) | Platform / deployment owner |

If your task touches any of these, pause and escalate before writing code.

## Core Constraints (Quick Reference)

These are the rules you'll most often need to apply when generating code. Full context is in the root AGENTS.md.

| Rule | What It Means |
|------|---------------|
| Error envelope | Every error response uses `{ error, code, fields? }` from `shared/lib/errors.js` |
| Secrets | Load from AWS Secrets Manager. Never hardcode keys or put them in plaintext env vars |
| Rate limits | Apply in middleware, never in route handlers |
| Test coverage | New endpoints require ≥80% unit test coverage |
| Logging | Structured JSON only. Never `console.log` in production code |
| DB access in payments | Always through the DAL in `shared/lib/`. Never import database drivers directly |
| Idempotency | Every mutating payments endpoint requires an `Idempotency-Key` header |
| TypeScript `any` | Do not use. If you must, include a comment justifying why |

## Suggesting Changes to AGENTS.md

You (the agent) **may suggest**:
- Typo fixes and broken link fixes
- New test patterns that align with existing conventions
- Clarifications when an existing rule is ambiguous

You **must not independently**:
- Add, remove, or weaken golden rules
- Add or remove frozen files or frozen interfaces
- Change naming conventions or the directory structure
- Add new services to the monorepo

Changes to those items require a human-owned RFC and COPE review.
