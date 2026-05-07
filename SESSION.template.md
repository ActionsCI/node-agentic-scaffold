# Session Handoff

_Last updated: YYYY-MM-DDTHH:MM:SSZ_
_Session focus: [one-line summary of what this session was about]_

---

## 1. Current Goal

> One sentence. Not the sprint goal — the specific thing being worked on when the session ended.

_e.g._ "Implementing JWT validation in the auth middleware so the `/api/v1/orders` route can require authenticated requests."

---

## 2. Decisions Made This Session

> Decisions not yet stable enough to be ADRs but should not be relitigated next session.

- **Decision:** [what was decided]
  - **Rationale:** [why — the reasoning that makes this decision durable]
  - **Alternatives considered:** [optional, only if non-obvious]

---

## 3. State of the Work

- **Done:**
  - [files / functions / capabilities completed and verified]

- **In progress:**
  - [files / functions partially implemented; specify where]

- **Blocked:**
  - [items + the specific blocker]

- **Untested:**
  - [code that exists but has not been verified]

> Be specific about file paths and function names. Vague state descriptions are worse than no state descriptions.

---

## 4. Open Questions

- [ ] [question]
- [ ] [question]

---

## 5. Next Concrete Action

> Not a goal, an action. The first specific thing the next session should do — file to edit, command to run, question to answer.

_e.g._ "Wire `validateToken` into `services/api/src/middleware/auth.ts` and add the negative-path test in `auth.test.ts`."

---

## Graduation Candidates

> Content from this session that has stabilized and should be promoted to the durable layer. Surfaced for user review — do not promote automatically.

- **[Decision X]** → ADR candidate: `docs/adr/NNNN-x.md`
- **[Pattern Y]** → AGENTS.md rule candidate at `<path>/AGENTS.md`
- **[Architecture clarification Z]** → module summary update at `<module>/MODULE.md`

_If this is the first session, write: "First session — no graduation check yet."_
