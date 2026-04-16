## Summary

<!-- What does this PR do? Keep it to 2-3 sentences. -->

## Related Spec

<!-- Link to the SPEC.md or ticket that defines this work. -->

## Changes

<!-- Bulleted list of what changed and why. -->

---

## Checklist

- [ ] Spec was written before work began (link to SPEC.md or ticket above)
- [ ] All acceptance criteria from the spec have passing tests
- [ ] Relevant AGENTS.md files were read before making changes (root + directory-level)
- [ ] No new dependencies added without approval (see [root AGENTS.md](../AGENTS.md))
- [ ] No frozen files or frozen interfaces modified without a security/architecture review
- [ ] AGENTS.md updated if a new convention was established during this work
- [ ] Golden rules in AGENTS.md reviewed — this PR does not violate any
- [ ] Error responses use the standard envelope (`{ error, code, fields? }`)
- [ ] New endpoints have unit tests with >= 80% coverage
- [ ] No secrets, API keys, or credentials in the diff — all loaded from Secrets Manager
- [ ] All log output is structured JSON (no `console.log` in production code)
