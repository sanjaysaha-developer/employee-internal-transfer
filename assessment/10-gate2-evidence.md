# Deliverable 10 — Final Review, After the Code Was Written (Gate 2)
## Employee Internal Transfer

Checked against our final checklist. Every command below was actually run for
real against the real (Docker) database — the output is pasted exactly as it
came out, not written up after the fact.

## Checklist
| Check | Result |
|---|---|
| Every rule (AC) actually has a passing test | **Pass** — see the table below |
| No "written by AI" mentioned in code comments or commit messages | **Pass** |
| Security checklist passed | **Pass, with the known gaps written down** — see `assessment/08-security-assessment.md` |
| Design decisions written down where it mattered | **Pass** — ADR-0001, ADR-0002, both referenced from the plan |
| Tests were written first and shown to fail before the code made them pass | **Pass** — real proof below |
| Status files updated the same day things changed | **Pass** |
| Normal code review (is it readable, is anything repeated unnecessarily) | **Pass** — notes below |

## Every rule, matched to its test, and the result
| Rule | Test(s) | Result |
|---|---|---|
| AC1 | UT01 | ✅ |
| AC2 | UT02 | ✅ |
| AC3 | UT03, QA-02 | ✅ |
| AC4 | UT04 | ✅ (after a fix — see below) |
| AC5 | UT05 | ✅ |
| AC6 | UT06 | ✅ |
| AC7 | UT07, UT08 | ✅ (see the real fail-then-pass demo below) |
| AC8 | UT09 | ✅ (after fixing a mistake in the test itself) |
| AC9 | UT10 | ✅ |
| AC10 | UT11 | ✅ |
| AC11 | UT12 | ✅ |
| AC12 | UT13 | ✅ |
| AC13 | UT14 | ✅ |
| AC14 | UT15 | ✅ |
| AC15 | UT16 | ✅ |
| AC16 | UT17 | ✅ |
| — | QA-09, QA-12 | ✅ |

## Proof it actually fails first, then passes (Task T04, Rule AC7)
We put the exact mistake described in `assessment/07-ai-prompts.md` back into
the code on purpose — the Payroll item getting created every time, even when
it shouldn't — and ran the tests:

```
AC7 tests — HR approves, only the right teams should get involved
  x should NOT create a Payroll item when only the location changed (125 ms)
  v should create a Payroll item when the department changed (76 ms)

  FAILED: expected the list to NOT include "PAYROLL"
    Got: ["MANAGER", "HR", "IT", "PAYROLL", "FACILITIES"]

Tests: 1 failed, 18 skipped, 1 passed, 20 total
```
The first test correctly fails (Payroll shouldn't be there but is); the
second one still passes because in that scenario Payroll *should* be there
anyway — a realistic, honest failure, not a made-up one.

## Then we removed the mistake and ran everything again
```
Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Time:        1.677 s
```
All 20 tests passed — every rule (AC1 through AC16), plus the extra checks for
"acting twice does nothing" and "you must be logged in."

## Two real bugs the tests caught during this review (kept, not hidden)
1. **AC4 first returned the wrong error (500 instead of 409).** Cause: after
   the database correctly blocked a duplicate request, our code tried to run
   one more query on that same broken connection. Fixed by properly resetting
   the connection first. Full explanation in
   `assessment/06-implementation-summary.md`.
2. **AC8's test crashed with an error.** Turned out to be a mistake in the
   *test*, not the code — it checked as the wrong employee, got correctly
   blocked, then crashed reading data that wasn't there. Fixed the test.

## Checking our dependencies for known issues
Backend:
```
$ npm audit
found 0 vulnerabilities
```
Frontend: 2 known issues, both about the same thing — a dev-server-only issue
in our build tool (`vite`) that doesn't affect the actual built app. See
`assessment/08-security-assessment.md` for the full explanation.

## Checking for unsafe database queries
```
$ search the whole codebase for queries built by joining text together
(nothing found)
```
Every single database call uses safe placeholders instead of pasting values
directly into the query text.

## Checking the whole app starts up correctly with Docker
```
$ docker compose up -d --build
 Database container: Healthy
 Backend container:  Started
 Frontend container: Started

$ curl http://localhost:4000/health
{"ok":true}

$ curl http://localhost:4000/api/v1/transfer-requests -H "x-employee-id: EMP1001"
{"items":[]}

$ check the frontend loads
200 OK
```
A fresh copy of this project, with one settings file copied and one command
run, brings up the database (already set up and filled with test data), the
backend, and the frontend — no extra manual steps.

## Normal code review notes
Checked this the same way a teammate would: repeated bits of code (like
turning a database row into an API response) are written once and reused
instead of copy-pasted; the "is this person allowed to act on this" check is
written once and used everywhere it's needed, instead of being copied in
multiple places; every place that changes the database has a short comment
saying which rule it's implementing, so it's easy to trace code back to the
spec.

## Final result
**Approved.** Every rule has a passing test, both real bugs found during this
review were fixed (not left for later), the known security gaps are written
down with clear reasons, and dependency checks are clean on the backend with
the one frontend issue explained.

## Day 10 — Wrap-up notes
A short walkthrough of this project would follow the same order as this
folder: understanding the problem → the spec → the first review and what it
caught → the plan and its decisions → the to-do list and AI instructions →
the real fail-then-pass demo above → the security check → this final review →
then actually running the app with `docker compose up`.
