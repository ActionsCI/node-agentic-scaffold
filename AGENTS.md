# AGENTS.md — Root (AcmeFintech Platform)

## Project Overview

AcmeFintech is a B2B fintech API platform that provides payment processing, authentication, and account management services to enterprise clients. The platform is built as a Node.js monorepo with independently deployable services communicating over internal REST APIs and a shared message bus. Every service in this repo handles real money or PII — treat all code changes with that level of seriousness.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express | 4.x |
| Database | PostgreSQL | 15 |
| Cache / Sessions | Redis | 7.x |
| Testing | Jest | 29.x |
| Linting | ESLint + Prettier | Latest |
| CI | GitHub Actions | — |
| Secrets | AWS Secrets Manager | — |

## Repo Structure

```
node-agentic-scaffold/
├── AGENTS.md              # You are here. Org-wide rules and conventions.
├── SPEC.md                # Feature spec template — fill out before building.
├── services/
│   ├── auth/              # Authentication, session management, JWT issuance.
│   │   ├── AGENTS.md      # Auth-specific rules, frozen files, error codes.
│   │   └── src/
│   └── payments/          # Payment processing, ledger writes, 3P integrations.
│       ├── AGENTS.md      # Payments-specific rules, idempotency, DAL usage.
│       └── src/
└── shared/
    ├── AGENTS.md          # Rules for shared utilities.
    └── lib/               # Cross-service utilities only. No business logic.
```

Each service has its own `AGENTS.md` that extends (never overrides) the rules defined here. When a service-level rule conflicts with a root rule, **the root rule wins**.

---

## GOLDEN RULES

**These rules are non-negotiable. Every agent, contributor, and reviewer must follow them.**

1. **Never modify `/services/auth/src/routes/logout.js` without a security review.** This file handles session invalidation, token revocation, and audit logging. A bug here means users can't log out or sessions stay alive after revocation. Require explicit sign-off from the security team before any change merges.

2. **Never add a direct database dependency to the payments service.** The payments service communicates with PostgreSQL exclusively through the data access layer (DAL) in `shared/lib/`. Direct `pg` or `knex` imports in payments service code will be rejected in review.

3. **Never commit secrets, API keys, or credentials.** Use environment variables and AWS Secrets Manager references. If you see a hardcoded key in a diff, block the PR immediately — do not approve with a "fix later" comment.

4. **Always return errors in the standard envelope.** Every error response from every service must use the format: `{ error: string, code: string, fields?: string[] }`. The canonical implementation lives in `shared/lib/errors.js`. Do not invent new formats.

5. **Never break existing API contracts without a versioning plan.** If a public endpoint's request or response shape changes, you must: (a) create a new versioned endpoint, (b) write a migration doc, (c) update the affected SPEC.md. Removing or renaming fields in an existing version is always a breaking change.

6. **Rate limiting logic lives in middleware, never in route handlers.** Route handlers assume rate limiting has already been applied. If you need custom limits for a specific endpoint, configure it in the middleware layer — do not add `if (tooMany)` checks in handlers.

7. **All new endpoints require unit tests with a minimum 80% coverage before merge.** No exceptions. If you're adding a route, you're adding tests. Use `jest --coverage` to verify. PRs that drop below the threshold will be blocked by CI.

8. **Never use `any` type in TypeScript files or disable ESLint rules without a justifying comment.** If you must add `// eslint-disable-next-line`, include a one-line explanation of *why* the rule doesn't apply. Bare disables will be rejected in review.

9. **Every service must handle graceful shutdown.** When the process receives SIGTERM, it must stop accepting new requests, drain in-flight requests, close DB/Redis connections, and exit cleanly. Do not add `process.exit(0)` without cleanup.

10. **Log structured JSON, never plain strings.** All log output must be structured (`{ level, message, service, traceId, ...context }`). Use the shared logger — do not call `console.log` in production code.

---

## Conventions

### Naming
- **Files:** `kebab-case.js` (e.g., `token-refresh.js`, `payment-intent.js`)
- **Directories:** `kebab-case/`
- **Variables/functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Classes:** `PascalCase`
- **Database tables:** `snake_case`
- **Environment variables:** `UPPER_SNAKE_CASE`, prefixed with service name (e.g., `AUTH_JWT_SECRET`, `PAYMENTS_STRIPE_KEY`)

### File Structure (per service)
```
services/<name>/
├── AGENTS.md
├── package.json
└── src/
    ├── routes/          # Express route handlers
    ├── middleware/       # Request middleware (auth, rate limit, validation)
    ├── services/        # Business logic (no HTTP concerns)
    ├── models/          # Data models and DB queries
    ├── __tests__/       # Co-located tests
    └── index.js         # Entry point — server bootstrap only
```

### Import Order
Enforce this order in every file. Separate each group with a blank line.

1. Node.js built-ins (`node:fs`, `node:path`)
2. External packages (`express`, `pg`)
3. Shared modules (`../../shared/lib/errors`)
4. Internal modules (relative imports within the service)

## Testing Standards

- **Framework:** Jest 29.x, configured per service in `jest.config.js`
- **Test location:** Co-located in `src/__tests__/` mirroring the source tree
- **Naming:** `<module-name>.test.js`
- **What to mock:**
  - Always mock external HTTP calls (use `nock` or manual mocks)
  - Always mock database calls in unit tests (use the test helpers in `shared/lib/`)
  - Never mock the module under test
  - Redis: use `ioredis-mock` for unit tests, real Redis for integration tests
- **Coverage threshold:** 80% lines, 80% branches — enforced in CI
- **Integration tests:** Live in `src/__tests__/integration/`, run separately via `npm run test:integration`, require a running Postgres and Redis

## Common Mistakes Agents Make

These are patterns we've seen go wrong in agent-generated PRs. If you catch yourself doing any of these, stop and re-read the relevant rule.

1. **Hardcoding secrets "just for now."** There is no "just for now." Hardcoded keys get committed, leaked, and rotated under pressure. Use AWS Secrets Manager from the first commit.
2. **Inventing a new error response shape.** `res.status(400).json({ message: 'bad' })` is wrong. Every error must use `createError()` from `shared/lib/errors.js`.
3. **Putting business logic in route handlers.** Handlers parse requests and format responses. If you're writing an `if` that isn't about request shape, move it to `src/services/`.
4. **Adding rate limit checks in handlers.** Rate limits belong in middleware. Route handlers assume rate limiting already happened.
5. **Importing `pg` or `knex` from the payments service.** Payments service never touches the database directly. Go through the DAL in `shared/lib/`.
6. **Logging tokens, passwords, card numbers, or full webhook payloads.** Use the logger's `redact` option. If you're unsure whether something is sensitive, assume it is.
7. **Skipping tests because "the logic is obvious."** The 80% coverage threshold is enforced in CI. PRs that drop below will not merge.
8. **Silently catching errors from payment providers.** Swallowed provider errors cause reconciliation bugs. Surface the error, wrap in the envelope, and log with context.
9. **Adding something to `shared/` because it *might* be reused.** Shared is for code that at least two services use today, not tomorrow. Keep service-specific code in the service.
10. **Using `console.log`.** Use the structured logger. Always.

## Agent Escalation — When to Stop and Ask

Agents must pause and flag to the human operator when any of the following are true:

- The task requires modifying a file listed as **frozen** in any AGENTS.md
- The task requires changing a **frozen interface** (the signature of a public API route)
- The task requires breaking a **golden rule**
- The task requires adding a new **third-party integration** to the payments service
- The scope of the task has grown beyond what the spec describes
- An existing AGENTS.md rule appears to be wrong, outdated, or contradicts another rule

Escalation is not failure. It's how this team catches risky changes before they ship.

## How to Update This File

This file is maintained by the **Core Platform Engineering (COPE)** team.

- **Golden rules section:** Only COPE can add, modify, or remove golden rules. Submit a PR targeting this file with the `cope-review` label.
- **Conventions and testing sections:** COPE maintains these. Propose changes via RFC in the `#platform-eng` channel before opening a PR.
- **Service-level AGENTS.md files:** Owned by the respective service team. Service teams can add rules that are stricter than root rules, but never rules that relax them.
- **Adding a new service:** Copy an existing service's `AGENTS.md` as a starting point, then customize. The new `AGENTS.md` must be reviewed by COPE before the service ships to production.
