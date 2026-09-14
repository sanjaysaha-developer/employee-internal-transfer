# Project Status Board
_This is a quick way to see what's going on without needing a meeting._

## Active work
| Feature | Title | Status | Owner | Last update | Notes |
|---|---|---|---|---|---|
| employee-internal-transfer | Employee Internal Transfer | v1.2 Built and tested; v1.3 & v1.4 deltas In Peer Review (Gate 1) | Candidate (assessment) | Day 12 | v1.2 unchanged/live. v1.3 proposes AC17 (Stakeholder Inbox fix). v1.4 closes the Gate 1 review's conditions (AC18 + doc gaps). Neither has been implemented yet. |

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
