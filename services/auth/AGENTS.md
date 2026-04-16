# AGENTS.md — Auth Service

> This file extends the [root AGENTS.md](../../AGENTS.md). Root rules always take precedence.

## Purpose

The auth service handles authentication, session management, and JWT issuance for the AcmeFintech platform. It is the single source of truth for user identity within the system. Every other service trusts tokens issued by this service — a bug here compromises the entire platform.

## Frozen Files

The following files must **not** be modified without explicit approval from the security team. Tag `@acmefintech/security` on any PR that touches these:

| File | Reason |
|------|--------|
| `src/routes/logout.js` | Session invalidation and token revocation. A regression here means users cannot securely log out. |
| `src/middleware/verify-token.js` | JWT verification logic. A bypass here means unauthenticated access to every service. |
| `src/middleware/session-hydrate.js` | Loads session data from Redis. Incorrect behavior leaks sessions across users. |

If you're an agent and your task requires modifying a frozen file, **stop and flag it to the human operator**. Do not proceed without explicit approval.

## Error Codes

This service owns the following error codes. Do not reuse these codes in other services.

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `AUTH_INVALID_CREDENTIALS` | Email/password combination is incorrect | 401 |
| `AUTH_TOKEN_EXPIRED` | JWT has passed its TTL | 401 |
| `AUTH_TOKEN_REVOKED` | JWT was explicitly revoked (logout, password change) | 401 |
| `AUTH_SESSION_NOT_FOUND` | Session ID in token does not exist in Redis | 401 |
| `AUTH_RATE_LIMITED` | Too many authentication attempts | 429 |
| `AUTH_ACCOUNT_LOCKED` | Account locked after repeated failed attempts | 403 |
| `AUTH_MFA_REQUIRED` | Valid credentials but MFA step not completed | 403 |

All errors must use the standard envelope from `shared/lib/errors.js`.

## JWT Configuration

- **Access token TTL:** 15 minutes
- **Refresh token TTL:** 7 days
- **Signing algorithm:** RS256
- **Signing key:** Loaded at startup from AWS Secrets Manager via `AUTH_JWT_PRIVATE_KEY_ARN`. Never hardcoded, never in environment variables as plaintext.
- **Key rotation:** Keys are rotated quarterly. The verification middleware accepts tokens signed by any key in the current JWKS — this supports overlap during rotation windows.
- **Claims:** `{ sub, iat, exp, jti, sessionId, roles }` — do not add custom claims without updating this document and the token verification middleware.

## Rate Limiting

Auth endpoints use stricter rate limits than the rest of the platform:

| Endpoint | Window | Max Requests |
|----------|--------|-------------|
| `POST /auth/login` | 15 min | 10 per IP |
| `POST /auth/register` | 1 hour | 5 per IP |
| `POST /auth/forgot-password` | 1 hour | 3 per email |
| `POST /auth/refresh` | 1 min | 5 per session |

Rate limit configuration lives in `src/middleware/rate-limit.js`. Per root AGENTS.md, rate limiting logic must stay in middleware — never in route handlers.

## Test Patterns

### Mocking the Database
Use the `createMockPool` helper from `shared/lib/test-helpers`:
```js
const { createMockPool } = require('../../../shared/lib/test-helpers');
const pool = createMockPool({
  'SELECT * FROM users WHERE email = $1': [{ id: 1, email: 'test@acme.com' }]
});
```

### Mocking Redis
Use `ioredis-mock` for unit tests. Integration tests use a real Redis instance (CI provides one).

### Testing JWT
Never use real signing keys in tests. Use the test keypair in `src/__tests__/fixtures/test-keys/`. These keys are committed to the repo intentionally — they are only valid in test environments.

### Testing Rate Limits
Set `AUTH_RATE_LIMIT_DISABLED=true` in test environment to bypass rate limits in non-rate-limit-specific tests. For rate limit tests, use the real middleware with a short window.

---

## Local Golden Rules

1. **Never store plaintext passwords.** All passwords are hashed with bcrypt (cost factor 12). If you see a comparison against a plaintext password, it's a critical bug.

2. **Never return user data in auth error responses.** Error messages must not reveal whether an email exists in the system. Use generic messages like "Invalid credentials" — never "User not found" or "Incorrect password".

3. **Never issue a token without validating the session exists in Redis.** The token issuance path must always check that the session was created successfully before returning the JWT to the client.

4. **Never log tokens, passwords, or session IDs.** Scrub these from all log output. The shared logger has a `redact` option — use it.
