# node-agentic-scaffold

A template repository demonstrating how to use **layered AGENTS.md files** as institutional memory for AI coding agents in a real Node.js monorepo.

Fork this repo, replace the placeholder content with your actual stack, and give your agents a structured knowledge base that scales with your codebase.

---

## What This Demonstrates

Modern AI coding agents (Claude Code, Cursor, Copilot Workspace, etc.) work best when they have explicit context about your project's rules, conventions, and constraints. Dumping everything into a single file doesn't scale. This repo shows a **layered approach**:

```
AGENTS.md (root)           ← Org-wide golden rules, tech stack, conventions
├── services/auth/AGENTS.md    ← Auth-specific rules, frozen files, error codes
├── services/payments/AGENTS.md ← Payments-specific rules, idempotency, DAL
└── shared/AGENTS.md           ← Rules for shared utilities
```

### The Hierarchy

| Layer | Scope | Maintained By |
|-------|-------|---------------|
| **Root** | Org-wide golden rules, tech stack, naming conventions, testing standards | Core Platform Engineering (COPE) |
| **Service** | Service-specific constraints, frozen files, owned error codes, local rules | Service team |
| **Module** | Shared library rules, what belongs here, what doesn't | COPE |

**Rules cascade downward.** A service-level AGENTS.md can add stricter rules but can never relax a root-level rule. When there's a conflict, the root wins.

### SPEC.md + AGENTS.md

These two files serve different purposes and work together:

- **SPEC.md** defines *what* to build — the goal, acceptance criteria, and definition of done.
- **AGENTS.md** defines *how* to build it — the rules, conventions, and constraints the agent must follow.

Before starting any agent-assisted work, fill out `SPEC.md` for the feature. The agent reads the spec to understand what to build, then reads the relevant AGENTS.md files to understand how to build it correctly.

### COPE Ownership Model

**Core Platform Engineering (COPE)** maintains the root AGENTS.md and the shared module rules. Individual service teams own their service-level AGENTS.md files. This keeps ownership clear:

- Golden rules, naming conventions, testing standards → COPE
- Auth-specific frozen files, JWT configuration → Auth team
- Payments idempotency requirements, DAL rules → Payments team
- What belongs in shared/ → COPE

Service teams can propose changes to root rules via RFC. COPE reviews all new service-level AGENTS.md files before a service goes to production.

---

## Getting Started

1. **Fork this repo** into your organization.

2. **Replace placeholder content:**
   - Update the root `AGENTS.md` with your actual tech stack, golden rules, and conventions.
   - Rename `services/auth/` and `services/payments/` to match your actual services.
   - Update each service-level `AGENTS.md` with real constraints.
   - Replace "AcmeFintech" / "AcmeAPI" with your company and product names.

3. **Add your SPEC.md workflow:**
   - Before starting a feature, copy `SPEC.md` to a new file (e.g., `specs/feature-name.md`) and fill it out.
   - Reference the relevant AGENTS.md files in the spec.

4. **Point your agent at the root AGENTS.md:**
   - Most AI coding agents will automatically discover and read AGENTS.md files.
   - For agents that don't, include a system prompt like: *"Read AGENTS.md in the repo root and any AGENTS.md files in directories you're working in before making changes."*

5. **Iterate on your rules:**
   - After each major agent session, review what went wrong and encode the lesson as a new rule.
   - AGENTS.md is a living document — it gets better every time an agent makes a mistake you don't want repeated.

---

## Repo Structure

```
node-agentic-scaffold/
├── AGENTS.md                        # Root rules — golden rules, conventions, tech stack
├── SPEC.md                          # Feature spec template
├── README.md                        # You are here
├── package.json                     # Monorepo root config
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md     # PR checklist referencing AGENTS.md
├── services/
│   ├── auth/
│   │   ├── AGENTS.md                # Auth service rules
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js             # Entry point
│   │       ├── routes/
│   │       └── middleware/
│   └── payments/
│       ├── AGENTS.md                # Payments service rules
│       ├── package.json
│       └── src/
│           ├── index.js             # Entry point
│           └── routes/
└── shared/
    ├── AGENTS.md                    # Shared module rules
    └── lib/
        └── errors.js                # Standard error envelope
```

---

## Philosophy

> AGENTS.md is institutional memory for AI agents. It captures the lessons your team learned the hard way — the files that must not be touched without review, the patterns that must be followed, the mistakes that must not be repeated — and makes them available to every agent session automatically.

The goal isn't to constrain agents unnecessarily. It's to give them the same context a senior engineer on your team would have after six months of working in the codebase.

---

## Part of the Series

This repo is a companion to the **#EngineeringInTheAgentEra** LinkedIn series on building effective workflows with AI coding agents.

---

## License

MIT — fork it, use it, make it yours.
