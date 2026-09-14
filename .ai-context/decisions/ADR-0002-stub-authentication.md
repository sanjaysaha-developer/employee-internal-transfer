# ADR-0002: A simple stand-in for login, instead of real company login

## Why we needed to decide this
Our project rules say every endpoint should sit behind the company's real
login system. But nobody gave us a real login system to connect to in this
exercise — no test accounts, no login provider, nothing. Building a full fake
login system just for this exercise would take far more time than the
exercise is meant to take, and doesn't actually help judge the parts this
assessment is really about (writing a good spec, tracing rules to tests, and
so on).

## What we decided
The backend just trusts two things sent with every request: `x-employee-id`
(who you are — required on every call) and `x-actor-role` (which team you're
acting as, if any — HR/PAYROLL/IT/FACILITIES, only needed for the shared
team to-do items). The frontend has a simple "log in as" dropdown instead of
a real login screen.

## What this means
- Every rule that depends on "who's logged in" or "which team are they acting
  as" can be fully tested — the test just sets these two values directly, no
  fake login system needed.
- **This is the single biggest risk in this whole project if it were ever
  used for real.** Anyone who can reach the API at all could claim to be any
  employee, or any team, just by sending a different header. This is written
  down clearly in `assessment/08-security-assessment.md` as the #1 thing that
  must be fixed before any real use — and the fix is contained to one file
  (`backend/src/middleware/auth.js`); nothing else needs to change once real
  login is added.
- What this does **not** solve: actually checking who someone really is,
  keeping them logged in safely, requiring a second login step, or checking
  which teams someone is really part of. All of that comes with real login,
  later.
