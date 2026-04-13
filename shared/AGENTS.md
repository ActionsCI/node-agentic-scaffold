# AGENTS.md — Shared Modules

> This file extends the [root AGENTS.md](../AGENTS.md). Root rules always take precedence.

## Purpose

The `shared/` directory contains **cross-service utilities only**. Code in this directory must be genuinely useful to multiple services. It is not a dumping ground for code that doesn't have a home.

## What Belongs in Shared

- **Error envelope** (`lib/errors.js`) — the canonical error format used by all services
- **Logger** — structured JSON logging with redaction support
- **Test helpers** — mock factories for database pools, Redis clients, etc.
- **Circuit breaker** — shared fault tolerance wrapper for external integrations
- **Middleware factories** — generic middleware constructors (rate limiting base, request ID injection)
- **Constants** — truly universal constants (HTTP status codes, shared enum values)

## What Never Goes in Shared

- **Business logic.** If it references a specific domain concept (user, payment, session), it belongs in a service.
- **Service-specific models.** Data models live in the service that owns them.
- **Configuration.** Each service owns its config. Shared config is limited to the monorepo tooling (ESLint, Prettier, Jest base config).
- **Service-specific error codes.** Error codes are defined in each service's AGENTS.md. Only the error envelope constructor lives here.

## The Error Envelope

All API errors across the platform must use this format:

```json
{
  "error": "Human-readable error message",
  "code": "SERVICE_ERROR_CODE",
  "fields": ["optional", "array", "of", "field", "names"]
}
```

- `error` (string, required) — A message suitable for logging. Not necessarily shown to end users.
- `code` (string, required) — Machine-readable error code. Format: `SERVICE_ERROR_NAME` (e.g., `AUTH_TOKEN_EXPIRED`, `PAYMENTS_INTENT_NOT_FOUND`).
- `fields` (string[], optional) — Present only for validation errors. Lists the request fields that failed validation.

The canonical implementation is in `lib/errors.js`. Import and use the constructors — do not manually build error objects.

## How to Propose Additions

Adding code to `shared/` requires COPE review because every service depends on this directory. A bug here affects the entire platform.

1. **Check if it truly belongs here.** Ask: "Do at least two services need this today (not hypothetically)?" If not, keep it in the service that needs it and extract later.
2. **Open a SPEC.md** describing what you want to add, which services will consume it, and why it can't live in a service.
3. **Open a PR** with the `cope-review` label. COPE will review for API design, naming consistency, and test coverage.
4. **Update this AGENTS.md** to document the new module in the "What Belongs in Shared" list.

## Testing

- Every module in `shared/lib/` must have a corresponding test file in `shared/lib/__tests__/`.
- Shared modules are tested in isolation — they must not depend on any service being available.
- Coverage threshold: 90% (higher than the 80% service standard, because shared code has a larger blast radius).
