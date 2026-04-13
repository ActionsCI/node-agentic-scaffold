# AGENTS.md — Payments Service

> This file extends the [root AGENTS.md](../../AGENTS.md). Root rules always take precedence.

## Purpose

The payments service handles payment processing, refunds, and ledger operations for the AcmeFintech platform. This service processes real money. Every write operation must be idempotent, every state transition must be auditable, and every integration must fail gracefully.

**Critical constraint:** This service does **not** access the database directly. All reads and writes go through the data access layer (DAL) in `shared/lib/`. Direct `pg`, `knex`, or any other database driver imports in this service's code will be rejected in review. This boundary exists to enforce audit logging, row-level access control, and schema migration safety.

## Frozen Interfaces

The following route signatures are consumed by external clients and must **not** change without a versioning plan. Modifying the request or response shape of these endpoints is a breaking change.

| Route | Method | Consumers |
|-------|--------|-----------|
| `/payments/intent` | POST | Client SDKs (v2, v3), mobile apps |
| `/payments/intent/:id` | GET | Client SDKs, partner dashboards |
| `/payments/intent/:id/confirm` | POST | Client SDKs |
| `/payments/refund` | POST | Admin dashboard, support tooling |
| `/payments/webhook/stripe` | POST | Stripe (inbound webhook) |
| `/payments/webhook/plaid` | POST | Plaid (inbound webhook) |

If your task requires changing a frozen interface, **stop and flag it to the human operator**. The correct path is: create a new versioned endpoint, update the migration doc, and deprecate the old endpoint with a sunset header.

## Third-Party Integrations

This service integrates with the following external providers:

| Provider | Purpose | Module |
|----------|---------|--------|
| Stripe | Card payments, payouts | `src/integrations/stripe.js` |
| Plaid | Bank account linking, ACH | `src/integrations/plaid.js` |

### Adding a New Integration

1. Open a SPEC.md describing the integration, acceptance criteria, and rollback plan.
2. Create a new module in `src/integrations/<provider>.js` following the existing pattern.
3. All API keys must be loaded from AWS Secrets Manager — never from environment variables or config files.
4. The integration must include circuit breaker logic (use the shared circuit breaker in `shared/lib/`).
5. The PR requires approval from both the payments team lead and COPE.
6. Add the provider to the table above in this AGENTS.md.

## Idempotency Requirements

**All payment write operations must be idempotent.** This is non-negotiable.

- Every mutating endpoint must accept an `Idempotency-Key` header.
- The idempotency key is stored in Redis with a TTL of 24 hours.
- If a duplicate request arrives with the same key, return the original response — do not re-execute the operation.
- The idempotency middleware lives in `src/middleware/idempotency.js`. Route handlers must not implement their own idempotency logic.
- Idempotency keys must be UUIDv4 format. Reject malformed keys with error code `PAYMENTS_INVALID_IDEMPOTENCY_KEY`.

## Error Codes

This service owns the following error codes:

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `PAYMENTS_INTENT_NOT_FOUND` | Payment intent ID does not exist | 404 |
| `PAYMENTS_INTENT_ALREADY_CONFIRMED` | Attempting to confirm an already-confirmed intent | 409 |
| `PAYMENTS_INSUFFICIENT_FUNDS` | Payment declined due to insufficient funds | 402 |
| `PAYMENTS_PROVIDER_ERROR` | Upstream provider (Stripe/Plaid) returned an error | 502 |
| `PAYMENTS_INVALID_IDEMPOTENCY_KEY` | Idempotency key is missing or malformed | 400 |
| `PAYMENTS_REFUND_EXCEEDS_ORIGINAL` | Refund amount exceeds the original payment | 422 |

All errors must use the standard envelope from `shared/lib/errors.js`.

---

## Local Golden Rules

1. **Never write to the database directly.** All database operations go through the DAL. If you need a new query, add it to the DAL — do not import a database driver in this service.

2. **Never process a payment without an idempotency key.** If the middleware doesn't enforce this for a new endpoint, add it. Duplicate charges are the fastest way to lose customer trust and trigger chargebacks.

3. **Never log full card numbers, bank account numbers, or other PCI-sensitive data.** Log only the last four digits and the payment intent ID. The shared logger's `redact` option must be used for all log calls in this service.

4. **Never catch and swallow errors from payment providers.** If Stripe or Plaid returns an error, it must be surfaced to the caller (wrapped in the standard envelope) and logged with full context. Silent failures in payment processing cause reconciliation nightmares.
