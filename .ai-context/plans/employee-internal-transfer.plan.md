# Plan: Employee Internal Transfer

## Based on
`.ai-context/specs/employee-internal-transfer.spec.md` (version 1.2, approved)

## How we're building it
- **Tools (as requested):** Node.js + Express for the backend, PostgreSQL for
  the database, React for the frontend, everything running in Docker.
- This is a brand-new app — there's nothing existing to plug into, since it's
  the only feature in this project so far.
- The backend has all 7 endpoints listed in the spec. We use the `pg` library
  to talk to the database directly with plain SQL — no extra database tool
  (ORM) on top, since the database is small enough that plain SQL stays easy
  to follow.
- The frontend has 3 simple screens: **New Transfer Request** (the submit
  form), **My Transfer Requests** (see your requests and their status,
  confirm/cancel them), and a small **Stakeholder Inbox** screen so Manager/HR/
  Payroll/IT/Facilities can see and act on what's waiting on them — just
  enough to demo and test the whole flow, not a full separate app for each
  team.
- **Login (a stand-in, see ADR-0002):** every request must say who it's from
  (`x-employee-id`), and team members acting on a shared to-do item also say
  which team they're acting as (`x-actor-role`, one of HR/PAYROLL/IT/
  FACILITIES). This is not real security — it must be replaced before real use.
- **How Payroll/IT/Facilities do their part (see ADR-0001):** since there's no
  real Payroll/IT/Facilities system to connect to, each one just gets a to-do
  item inside this same app, and someone on that team marks it done through
  the same screens. Swapping any of these for a real system later only means
  changing the code that creates/finishes that to-do item — not the database
  design or the API.

## The database

```sql
-- employees: a small made-up list standing in for a real company directory
-- (there's no real one to connect to — see ADR-0001).
CREATE TABLE employees (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  location      TEXT NOT NULL,
  role          TEXT NOT NULL,
  manager_id    TEXT REFERENCES employees(id)
);

CREATE TABLE transfer_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id          TEXT NOT NULL REFERENCES employees(id),
  current_department   TEXT NOT NULL,
  current_location     TEXT NOT NULL,
  current_role_title   TEXT NOT NULL,
  proposed_department  TEXT NOT NULL,
  proposed_location    TEXT NOT NULL,
  proposed_role        TEXT NOT NULL,
  effective_date       DATE NOT NULL,
  reason               TEXT,
  status               TEXT NOT NULL CHECK (status IN (
                         'Submitted','HR Review','In Progress',
                         'Ready For Confirmation','Completed','Rejected','Cancelled')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rule AC4: only one active request per employee. We enforce this right in
-- the database (not just in our code), so it still works correctly even if
-- two requests come in at almost the exact same moment.
CREATE UNIQUE INDEX one_active_request_per_employee
  ON transfer_requests (employee_id)
  WHERE status NOT IN ('Completed','Rejected','Cancelled');

CREATE TABLE stakeholder_actions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_request_id  UUID NOT NULL REFERENCES transfer_requests(id),
  type                 TEXT NOT NULL CHECK (type IN (
                         'MANAGER','HR','PAYROLL','IT','FACILITIES','EMPLOYEE_CONFIRMATION')),
  status               TEXT NOT NULL CHECK (status IN (
                         'Pending','Completed','Rejected','Skipped')),
  -- MANAGER / EMPLOYEE_CONFIRMATION: assignee is one specific employee's id.
  -- HR / PAYROLL / IT / FACILITIES: assignee is a team name, matched against
  -- whichever team the caller says they're acting as (see ADR-0002).
  assignee             TEXT NOT NULL,
  notes                TEXT,
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Checking this plan against our project rules
- [x] No new type of database added without writing down why — we're only
      using PostgreSQL, as agreed.
- [x] Testing matches our rules — Jest + Supertest, against a real database,
      tests written before the code, for every endpoint.
- [x] Security matches our rules — no salary/pay info anywhere in this
      database; every endpoint needs someone logged in; only the right person
      can act on a to-do item (this closes the hole found in the Gate 1
      review).
- [x] No personal info beyond employee id/name/department/location/role is
      stored — matches our rules exactly.
- [x] "No real outside connections yet" — followed, using the to-do-item
      approach, written down clearly as ADR-0001, not just quietly assumed.

## What we're deliberately not building yet
- Real connections to HR/Payroll/IT/Facilities systems (ADR-0001) — a later
  project.
- Real login (ADR-0002) — **must** happen before this goes anywhere near real
  use, not just a nice-to-have.
- Email/notifications, new-manager approval, cross-country transfer rules,
  automatic eligibility checks, reopening rejected requests, cancelling after
  work has started — all listed as out-of-scope in the spec, same here.
- A full separate screen for each team — we built one small shared "Inbox"
  screen instead, just enough to show and test the whole flow.

## What happens if something goes wrong, or two things happen at once
- Submitting a request saves the request *and* creates its Manager to-do item
  together, as one single step — either both happen, or neither does.
- The "only one active request" rule (above) is also protected at the
  database level, so even two submissions arriving at almost the same instant
  can't both succeed.
- Every action (approve/reject/complete/confirm/cancel) only goes through if
  the item is still in the expected state at that exact moment — so if two
  people try to act on the same item at once, only the first one actually
  goes through; the second gets a clear error instead of causing confusion.

## The order we built things in
1. Database tables + made-up test data — nothing works yet, but everything
   else depends on this.
2. Submit / view one / list endpoints — the basic "create and see a request"
   flow, testable before any approval logic exists.
3. The "make a decision" endpoint + making sure only the right person can use
   it — the Manager→HR approval step, including the security fix from the
   review.
4. What happens automatically once HR approves — creating the right to-do
   items, and noticing when they're all done.
5. Confirm + cancel endpoints.
6. The "see my pending items" endpoint — added after the review.
7. The frontend: submit form, status/timeline page, and the shared team inbox.
