# Project Rules (Constitution)

_Written once, at the start of the project. These rules apply to everything we
build here, so we don't have to repeat them in every spec._

## Testing rules
- Every API endpoint and every action that changes something must have tests,
  written *before* the code — no skipping this, even for "simple" endpoints.
- Aim for at least 80% of the code covered by tests for anything touching
  transfer/payroll-related data; 60% elsewhere. This is a minimum, not a goal
  to write down to.
- Backend tests: Jest + Supertest, run against a real Postgres database (not a
  fake one) — this catches real problems, not just logic problems.
- Frontend tests: React Testing Library, for anything with real logic (forms,
  status screens). No "just take a screenshot and compare" tests.

## Security rules
- No personal details beyond employee id, name, department, location, and role
  ever get written to a log file, at any log level. No salary/pay information
  is stored in this feature's data at all.
- Every endpoint must check who's calling it. For this exercise, we use a
  simple stand-in for login (see ADR-0002) — not real security, and flagged as
  something to fix before real use.
- Every endpoint needs a clear decision about rate limiting — even if the
  decision is "we don't need one, here's why."
- Passwords/database credentials only go in environment variables — never
  written directly in code, never logged.

## Technical building-block rules
- Only PostgreSQL as a database for this feature. If we ever need a different
  kind of database, that needs a written reason (an ADR) first.
- No real connection to outside systems yet (see ADR-0001) — Payroll, IT, and
  Facilities each get a simple task/checklist item inside our own app instead.
- Frontend: plain React. No extra state-management library — not needed for a
  feature this size.
- Backend: plain SQL through the `pg` library — no database "ORM" tool added,
  since the database is small and simple enough that plain SQL stays easy to
  read.
- Everything runs in Docker via `docker-compose`. Database data is saved in a
  Docker volume so it isn't lost when containers restart.

## Performance and reliability targets
- API responses should be under 500ms (a generous target — this is an
  internal, low-traffic tool).
- Every action taken on a request is kept forever, so there's always a full
  history to look back on.

## Versioning rule
- The API starts at `/api/v1/`. If we ever need to make a breaking change,
  we add a `/api/v2/` instead of quietly changing what `/v1/` does.
