# AGENTS.md — Payments Routes

> Extends [services/payments/AGENTS.md](../../AGENTS.md) and [root AGENTS.md](../../../../AGENTS.md).

## What Lives Here

Express route handlers for the payments service. Each file defines one logical group of endpoints (e.g., `intent.js`, `refund.js`, `webhook.js`).

## File Naming

One file per resource or action: `intent.js`, `refund.js`, `webhook-stripe.js`, `webhook-plaid.js`. Do not create catch-all files.

## Route Handler Rules

- **No business logic in handlers.** Handlers parse the request, call a service function, and format the response. Business logic lives in `../services/`.
- **No direct database access — ever.** The payments service does not import database drivers. All persistence goes through the data access layer (DAL) in `shared/lib/`. This is a root golden rule. See [payments AGENTS.md](../../AGENTS.md).
- **Every mutating endpoint must enforce idempotency.** The `Idempotency-Key` header is required on all POST/PUT/PATCH routes. This is handled by the idempotency middleware, but new routes must be wired through it. See [payments AGENTS.md](../../AGENTS.md) for details.
- **Every handler returns the standard error envelope on failure.** Use `createError()` from `shared/lib/errors.js`.
- **Every new route file must have a corresponding test** in `../__tests__/routes/`.

## Frozen Interfaces

The following routes have frozen request/response signatures. Do not change their API contract without a versioning plan:

| Route | Method |
|-------|--------|
| `/payments/intent` | POST |
| `/payments/intent/:id` | GET |
| `/payments/intent/:id/confirm` | POST |
| `/payments/refund` | POST |
| `/payments/webhook/stripe` | POST |
| `/payments/webhook/plaid` | POST |

See [payments AGENTS.md](../../AGENTS.md) for the full frozen interfaces table and the process for versioned changes.

## Webhook Handlers

Webhook routes (`webhook-stripe.js`, `webhook-plaid.js`) have special requirements:
- They must verify the inbound signature before processing the payload.
- They must return `200` immediately and process asynchronously where possible.
- They must be idempotent — providers retry on failure and may send duplicates.
- Never log the full webhook payload — it may contain PCI-sensitive data.
