# Copilot / Agent Instructions

> This file tells AI coding agents (GitHub Copilot, Claude Code, Cursor, and others) how to navigate this repository. Read this before making any changes.

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
