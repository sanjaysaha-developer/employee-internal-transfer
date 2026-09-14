# Deliverable 6 — What We Actually Built

Connects the to-do list (`tasks.md`) to the real code. Tools used: Node.js +
Express + `pg` (backend), React + Vite (frontend), PostgreSQL, all running in
Docker.

## Where each task ended up
| Task | Files |
|---|---|
| T01 | `backend/src/migrations/001_init.sql`, `002_seed.sql`, `backend/src/migrate.js` |
| T02 | `backend/src/routes/transferRequests.js`, `backend/src/services/transferService.js` |
| T03 | `transferService.js` — the "make a decision" logic + the who's-allowed-to-act check |
| T04 | `transferService.js` — what happens automatically once HR approves |
| T05 | `transferService.js` — confirm + cancel |
| T06 | `transferService.js` — "see my pending items" + its endpoint |
| T07 | `frontend/src/pages/NewTransferRequest.jsx` |
| T08 | `frontend/src/pages/MyTransferRequests.jsx` |
| T09 | `frontend/src/pages/StakeholderInbox.jsx` |
| T10 | `docker-compose.yml`, `.env.example`, both Dockerfiles |

## Spec problems found while building (written down, not quietly worked around)
1. **A status called "Manager Review" was never actually used.** Same kind of
   problem as one of the review findings above. Fixed the spec first (version
   1.2), then built against the fixed version.
2. **What if an employee has no manager on file?** Not covered by any rule —
   we found this while writing the "submit" code. Real-world question worth
   asking HR (who approves a transfer for someone at the very top of the org
   chart?), so we made it fail safely with a clear error (`NO_MANAGER_ASSIGNED`)
   instead of crashing or guessing, and wrote it down here instead of quietly
   deciding the business rule ourselves.
3. **Confirm/cancel now also check that you're the right person** (a 403
   error if not), even though this exact check wasn't written into the spec's
   error list. Added because our project rules say "check who's allowed, don't
   assume it" — and it matches the same check we already do elsewhere. Flagged
   here as something added beyond what the spec literally says, so a real
   reviewer can decide whether to add it to the spec officially.

## Real bugs the tests found (genuinely caught, not staged)
1. **AC4 test got a 500 error instead of the expected 409.** Cause: after the
   database blocked a duplicate request, our code tried to run one more query
   on the same, now-broken database connection, which failed. Fix: properly
   reset the connection first, then look up the existing request on a fresh
   one. See the comment in `createTransferRequest` in `transferService.js`.
2. **AC8 test crashed with an error about reading something that doesn't
   exist.** Turned out to be a mistake in the *test itself* — it checked the
   request details as the wrong employee, correctly got blocked (403, as it
   should), and then crashed trying to read data that wasn't there because it
   was blocked. Fixed by checking as the correct employee in the test. Worth
   being upfront about — the test had a bug too, not just the code.

## A real "test fails, then passes" demonstration (Task T04 / Rule AC7)
To prove the "write the test first" idea for real, rather than just claim it,
we put back the exact mistake already described in `assessment/07-ai-prompts.md`
("Payroll item gets created every time, even when it shouldn't") on purpose,
ran the tests (one failed, as expected), then took the mistake back out and
ran the tests again (all passed). The full output from both runs is saved in
`assessment/10-gate2-evidence.md`.

## Final result
All 20 tests pass (`backend/tests/transferRequests.test.js`), run against a
real database, not a fake one — matching our project rules. Checked for known
security issues in our dependencies: 0 found on the backend. Full details in
the final review file.
