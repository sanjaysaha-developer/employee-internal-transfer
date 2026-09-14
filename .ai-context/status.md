# Project Status Board
_This is a quick way to see what's going on without needing a meeting._

## Active work
| Feature | Title | Status | Owner | Last update | Notes |
|---|---|---|---|---|---|
| employee-internal-transfer | Employee Internal Transfer | v1.2 Built and tested; v1.3 & v1.4 deltas Under Development (T11 done, T12-T15 pending) | Candidate (assessment) | Day 13 | v1.2 unchanged/live. T11 (frontend test infra) done. Next: T12/T13 (UT19/UT20 confirmation tests), then T14 (UT18 RED, StakeholderInbox.jsx fix, GREEN), then T15 (full regression) before Gate 2. |

## Day-by-day log

### Day 1–2 — Understanding the problem + writing the spec
- Read the assessment brief carefully. No real stakeholder to ask questions
  to, so we worked directly from the brief and clearly labelled our guesses as
  guesses.
- Wrote the BRD entry and the first version of the spec (rules, API details,
  test cases all included).

### Day 3 — More test cases
- Added extra test scenarios beyond the spec's own rules — odd data, error
  cases, full start-to-finish journeys.

### Day 4 — First review (Gate 1)
- Reviewed the spec like a second person checking it for holes. Found 3 real
  problems and 1 small wording issue. Fixed all of them, spec re-approved the
  same day.

### Day 5 — Technical plan
- Wrote the plan: database design, how things are built, what happens if
  something goes wrong or two things happen at once.
- Wrote down two important decisions clearly (ADR-0001 and ADR-0002).

### Day 6 — To-do list + AI instructions
- Broke the plan into 10 small tasks.
- Wrote down exactly what was asked of the AI for each task.

### Day 7–9 — Building it, checking security, getting ready for final review
- See `assessment/06-implementation-summary.md` and
  `assessment/10-gate2-evidence.md` for the full details and real test
  results.

### Day 10 — Final review + wrap-up
- See `assessment/10-gate2-evidence.md` for the final sign-off notes.

### Day 11 — Post-release observation → Spec delta v1.3 (Gate 1 pending)
- Screenshot-based observation on Stakeholder Inbox: switching "Logged in as"
  doesn't reset the "Acting as" team-role selector (correct per AC16, but
  confusing UX). No code changed — per policy, drafted a Spec delta first.
- Added proposed `AC17` + `UT18` to
  `.ai-context/specs/employee-internal-transfer.spec.md` (v1.3), status set
  to "In Peer Review". Awaiting Gate 1 approval before touching
  `frontend/src/pages/StakeholderInbox.jsx` or `App.jsx`.

### Day 12 — Gate 1 peer review received → Spec delta v1.4 (Gate 1 pending)
- Received `Gate1_Review_SanjaySaha.docx` (reviewer: Soumyadeep, INT Delivery
  Leadership, 08 Sep 2026). Verdict: **Approved With Conditions**. Full
  findings kept in the docx; not re-typed here, but every action item is now
  addressed in the spec/BRD (no code touched, per policy):
  - **RED (Finding 1)** — three business decisions (IT always triggers,
    mandatory employee confirmation, effective-date role) were embedded in
    the spec with no acknowledgement. Logged as `BRD.md` Open Questions
    OQ1–OQ3, cross-referenced from AC7/AC9/AC10 and a new "What the effective
    date does" note in the spec.
  - **AMBER (Finding 2)** — `assessment/01-discovery-analysis.md` wasn't in
    the reviewed package; flagged at the top of that file as a Gate 1
    artefact, and its own Open Questions table extended (Q8–Q10) to match.
  - **AMBER (Finding 3)** — added `AC18` + `UT19`: rejection reason is
    visible to the employee via API02 (already true in the implementation —
    this just makes it an explicit, tested rule).
  - **AMBER (Finding 4)** — added the missing 403 row to API02's error table
    (AC14 already required this; the contract just didn't list it).
  - **AMBER (Finding 5)** — added a spec-level rate-limiting statement
    (none in V1, documented reason) to close the constitution compliance gap.
  - **AMBER (Finding 6)** — added an explicit out-of-scope line: no
    timeout/escalation if a downstream team never completes its item.
  - **GREEN (Finding 7/8)** — added `UT20` for the untested role-only fan-out
    combination; moved API07 to sort after API06 with a numbering note.
  - Spec bumped to **v1.4**, status "In Peer Review"; Gate Approvals &
    History table updated with the review outcome. Nothing implemented yet —
    next step is closing v1.3 + v1.4 Gate 1 before touching any code.

### Day 13 — Gate 1 formally closed
- User supplied `Gate1_Review_SanjaySaha.docx` again and confirmed the
  Project Manager (Supratim Jetty, approver of record — see
  `project_context.md` Roles & Approvers) has approved the spec, with the
  review's conditions to be verified.
- Audited the full docx text line-by-line against the current repo (not just
  the earlier summary): all 8 findings (1 RED, 5 AMBER, 2 GREEN) were
  confirmed already closed in v1.4 — no spec content changed as part of this
  closeout, only the formal sign-off was missing.
- Recorded the closeout as
  `.ai-context/pr_reviews/GATE1-employee-internal-transfer-v1.4.md`, updated
  the spec's Gate Approvals & History table (v1.3 delta + v1.4
  conditions-closure row → **Approved**, 2026-09-14), and flipped the spec
  Status line from "In Peer Review" to "Approved (Gate 1 Passed)".
- Next step: generate/update the Plan and Tasks for the v1.3 (AC17) + v1.4
  (AC18) deltas — no code has been touched yet.
- **Plan Delta added** to `.ai-context/plans/employee-internal-transfer.plan.md`
  ("Plan Delta — v1.3/v1.4" section): AC17 needs a real frontend fix (reset
  `actAsRole` in `StakeholderInbox.jsx` when `employeeId` changes); AC18
  needs **no code change** — confirmed the backend (`transferService.js`)
  already returns rejection `notes` via API02 and already gates the response
  with the AC14 403 check, so it only needs new test case UT19 to make the
  existing behavior explicit and tested. Next step: Task breakdown, then TDD
  RED (UT18 should fail today, UT19 should already pass) before touching
  `StakeholderInbox.jsx`.
- **Tasks generated** (`employee-internal-transfer.tasks.md`, T11-T15):
  T11 adds missing frontend test infrastructure (no test runner/RTL exists
  yet — constitution gap, not previously needed since v1.2 had no frontend
  logic tests); T12/T13 write UT19/UT20 as confirmation tests (expected
  GREEN immediately); T14 writes UT18 (expected RED), then implements the
  `StakeholderInbox.jsx` fix; T15 runs the full suite before Gate 2. `test_cases.md`
  synced with UT18/UT19/UT20 rows. No code touched yet.
- **T11 done** — added Vitest 2.x (pinned for compatibility with the
  existing `vite@^5.4.8` — not upgrading Vite without an ADR) + React
  Testing Library + jest-dom + user-event to `frontend/`; added
  `vitest.config.js`, `tests/setup.js`, and an `npm test` script. Verified
  with a throwaway smoke test, then removed it. `npm audit` shows known
  dev-only vulnerabilities in transitive deps that only resolve via a
  Vite/Vitest major upgrade — flagged, not fixed, pending a decision.
