# AGENTS.md — Auth Routes

> Extends [services/auth/AGENTS.md](../../AGENTS.md) and [root AGENTS.md](../../../../AGENTS.md).

## What Lives Here

Express route handlers for the auth service. Each file defines one logical group of endpoints (e.g., `login.js`, `register.js`, `logout.js`, `refresh.js`).

## File Naming

One file per resource or action, named for the action: `login.js`, `register.js`, `logout.js`, `forgot-password.js`, `refresh.js`. Do not create catch-all files like `auth.js` or `index.js` that register multiple unrelated routes.

## Route Handler Rules

- **No business logic in handlers.** Handlers parse the request, call a service function, and format the response. If you're writing an `if` that isn't about request validation, it belongs in `../services/`.
- **No direct database access.** Import from `../services/` or `../models/`, never from `pg`, `knex`, or the DAL directly.
- **No rate limiting logic.** Rate limits are applied in `../middleware/`. Handlers assume rate limiting has already happened.
- **Every handler returns the standard error envelope on failure.** Use `createError()` from `shared/lib/errors.js`. Do not construct `{ error, code }` objects manually.
- **Every new route file must have a corresponding test** in `../__tests__/routes/`.

## Frozen Files

`logout.js` is a frozen file. Do not modify it without explicit security team approval. See [auth AGENTS.md](../../AGENTS.md) for the full frozen files list and the reason.

## Response Format

All successful responses should follow a consistent shape per endpoint. Document the shape in the route's JSDoc header. All error responses must use the standard envelope.
