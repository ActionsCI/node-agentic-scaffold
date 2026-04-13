# AGENTS.md — Auth Middleware

> Extends [services/auth/AGENTS.md](../../AGENTS.md) and [root AGENTS.md](../../../../AGENTS.md).

## What Lives Here

Express middleware functions for the auth service. Middleware runs before route handlers and handles cross-cutting concerns: token verification, session hydration, rate limiting, and request validation.

## File Naming

One file per concern: `verify-token.js`, `session-hydrate.js`, `rate-limit.js`, `validate-body.js`. Do not combine unrelated middleware into a single file.

## Middleware Rules

- **Middleware must call `next()` or send a response — never both.** Double responses crash the server.
- **Middleware must not modify the request body.** It can read `req.body` for validation but must not mutate it. Attach computed values to `req.locals` or `req.auth` instead.
- **Rate limiting configuration lives here, not in route handlers.** See the rate limit table in [auth AGENTS.md](../../AGENTS.md) for per-endpoint limits.
- **Fail closed, not open.** If token verification encounters an unexpected error (Redis down, malformed token), reject the request with `UNAUTHORIZED`. Never fall through to the handler on error.
- **Every middleware must have a corresponding test** in `../__tests__/middleware/`.

## Frozen Files

The following middleware files are frozen. Do not modify without security team approval:

| File | Reason |
|------|--------|
| `verify-token.js` | JWT verification — a bypass here means unauthenticated access to every service |
| `session-hydrate.js` | Session loading from Redis — incorrect behavior leaks sessions across users |

See [auth AGENTS.md](../../AGENTS.md) for the complete frozen files list.

## Ordering

Middleware is registered in a specific order in `../index.js`. When adding new middleware, consider where it belongs in the chain:

1. Request ID injection
2. Rate limiting
3. Token verification
4. Session hydration
5. Request validation
6. Route handler
