# Tasks: Employee Internal Transfer

## Based on
`.ai-context/plans/employee-internal-transfer.plan.md`

## The to-do list, in order
- [x] **T01** — Set up the database (employees, transfer_requests,
      stakeholder_actions tables) + a small set of made-up test employees —
      nothing to check yet, this is the foundation everything else needs.
- [x] **T02** — Build submit / view-one / list-my-requests — covers rules AC1,
      AC2, AC3, AC4, AC13, AC14.
- [x] **T03** — Build "make a decision on a to-do item," including checking
      that only the right person can act on it (the fix from the review) —
      covers AC5, AC6, AC15.
- [x] **T04** — Build what happens automatically once HR approves: create the
      right to-do items for Payroll/IT/Facilities, and notice when they're
      all done — covers AC7, AC8, AC9.
- [x] **T05** — Build confirm + cancel — covers AC10, AC11, AC12.
- [x] **T06** — Build "see my pending items," added after the review —
      covers AC16.
- [x] **T07** — Build the New Transfer Request form (frontend) — covers AC1,
      AC2, AC3 on the screen side.
- [x] **T08** — Build the My Transfer Requests page — list, status/timeline
      view, confirm/cancel buttons — covers AC10, AC11, AC13.
- [x] **T09** — Build the small shared Stakeholder Inbox screen so
      Manager/HR/Payroll/IT/Facilities can act on their items — covers AC5,
      AC6, AC7, AC8, AC15, AC16 on the screen side.
- [x] **T10** — Wire up Docker: database + backend + frontend all start
      together with one command — no specific rule of its own, this is just
      the setup work.

Boxes are only checked once that piece is actually built and its tests pass.
See `assessment/06-implementation-summary.md` and
`assessment/10-gate2-evidence.md` for the real proof, not just this checklist.
