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

---

## Delta tasks — v1.3 (AC17) + v1.4 (AC18)
_Added 2026-09-14, from the Plan Delta in
`employee-internal-transfer.plan.md` ("Plan Delta — v1.3/v1.4"), after Gate 1
Approval — see `.ai-context/pr_reviews/GATE1-employee-internal-transfer-v1.4.md`.
No code has been touched yet. One task at a time, per policy._

- [x] **T11** — Add frontend test infrastructure: the frontend currently has
      no test runner or React Testing Library configured at all (`vite` +
      React only — see `frontend/package.json`), which the constitution
      requires for "anything with real logic." This is a one-time foundation
      task, not tied to a single AC — UT18 below depends on it existing.
      **Done:** Vitest 2.x (pinned to match the existing `vite@^5.4.8`, not
      the latest Vitest which needs Vite 6+ — no ADR to justify a Vite
      upgrade here) + React Testing Library + jest-dom + user-event added as
      devDependencies; `frontend/vitest.config.js` (jsdom environment,
      `frontend/tests/setup.js`) and an `npm test` script added. Verified
      with a throwaway smoke test (render + RTL query + jest-dom matcher),
      confirmed passing via `npm test`, then removed — not a real test case.
      `npm audit` flags known dev-only vulnerabilities in `esbuild`/`vitest`'s
      transitive deps that only resolve via a Vite/Vitest major upgrade;
      left as-is pending a decision on upgrading Vite (out of scope for this
      task).
- [x] **T12** — Write **UT19** (AC18) against
      `backend/src/services/transferService.js` / `backend/tests/`. Run it
      and confirm it's already **GREEN** — the Plan Delta found `notes` is
      already returned unconditionally in the `actions[]` mapping. This is a
      confirmation test, not a RED→GREEN cycle; note that explicitly in the
      test run evidence for Gate 2 so it isn't mistaken for retrofitting.
      **Done:** added to `backend/tests/transferRequests.test.js`
      (`employee-internal-transfer.AC18/UT19` block). Ran against a real
      Postgres (`docker compose up -d postgres` + migrate) — passed
      immediately as predicted, no code change.
- [x] **T13** — Write **UT20** (AC7, role-only fan-out) the same way, against
      the same file. Confirm it's already **GREEN** — the Plan Delta found
      `roleOrDeptChanged` already covers a role-only change correctly. Same
      confirmation-test note applies.
      **Done:** added as a third case in the existing
      `employee-internal-transfer.AC7/UT07/UT08` describe block (renamed to
      include UT20). Full suite run: **22/22 passing** (20 baseline + UT19 +
      UT20), no code change.
- [x] **T14** — Write **UT18** (AC17) against
      `frontend/src/pages/StakeholderInbox.jsx` (needs T11 done first). Run
      it and confirm it's **RED** — the "Acting as" selector does not yet
      reset when "Logged in as" changes. Then implement the `useEffect` fix
      described in the Plan Delta, and confirm UT18 goes **GREEN**.
      **Done:** `frontend/tests/pages/StakeholderInbox.test.jsx` (2 cases:
      selector resets to Myself; pending-items list reloads for the new
      identity). Confirmed RED first. The first implementation attempt (a
      plain second `useEffect` on `[employeeId]` calling `setActAsRole('')`)
      went GREEN but a debug check found it fired one avoidable API call
      with the *new* employeeId and the *stale* role first — the same
      stale-identity leak AC17 exists to prevent, just moved into the
      network call. Fixed with a `prevEmployeeIdRef` guard inside the single
      refresh effect so exactly one, correctly-scoped call happens. Both
      cases GREEN after the fix.
- [x] **T15** — Run the full backend + frontend test suite (UT01–UT20 plus
      T11's new frontend suite) and confirm 100% pass with no regressions on
      v1.2's existing behavior, before submitting for Gate 2.
      **Done:** backend 22/22 passing (real Postgres); frontend 2/2 passing.
      No regressions.
