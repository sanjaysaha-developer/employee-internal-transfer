# Project Overview

## What we're building
A way for employees to request an internal transfer through the One-Point
Employee Portal — one form to fill in, and one place to check the status —
instead of chasing five different teams by email.

## How it's built (short version)
- **Frontend:** A simple React app — one page to submit a request, one page to
  see your requests and their status.
- **Backend:** A Node.js + Express API that owns all the rules — who approves
  what, and in what order.
- **Database:** PostgreSQL — two main tables: one for the transfer requests
  themselves, one for the "to-do items" each team needs to complete.
- **How teams do their part:** Manager, HR, Payroll, IT and Facilities each get
  a to-do item created for them automatically. Since there's no real HR/Payroll/
  IT/Facilities computer system to connect to here, they complete their to-do
  item inside this same app (see ADR-0001).
- **Login:** A simple stand-in for now (see ADR-0002) — not real security,
  clearly flagged as something to fix before real use.

## Who's involved
- **Employee** — asks for the transfer, checks the status.
- **Manager** (the employee's *current* manager) — first person to approve.
- **HR** — checks if the employee is allowed to transfer.
- **Payroll, IT, Facilities** — do their part after HR approves, only if it
  actually applies (e.g. Facilities only gets involved if the location changes).

## Short name for this feature
`employee-internal-transfer` — used in every file name and every rule ID, so
everything can be traced back to this one feature easily.

## Architecture style
Monolithic (single Express backend + single React frontend + single
PostgreSQL database, no service decomposition). See
`.ai-context/architecture.md` for the full record, confirmed with the user
on 2026-09-14 during the `.ai-context` restoration sync.

## Roles & Approvers
| Role | Approver | Email |
|---|---|---|
| Lead | Supratim Jetty | supratim.jetty@intglobal.com |
| Project Manager | Supratim Jetty | supratim.jetty@intglobal.com |
| Senior Software Engineer | Supratim Jetty | supratim.jetty@intglobal.com |

(Added 2026-09-14, per user request — provisional/for-now assignment across
all three roles pending any future split.)

## Gate reviewers
- **Gate 1 Reviewer(s):** Soumyadeep, INT Delivery Leadership (historical —
  performed the v1.3/v1.4 spec peer review). Supratim Jetty (Lead / Project
  Manager, see Roles & Approvers above) is the approver of record going
  forward.
- **Gate 2 Reviewer(s):** Candidate (self-assessed, historical — v1.0–v1.2
  implementation review). Supratim Jetty (Senior Software Engineer, see
  Roles & Approvers above) is the approver of record going forward.

(Confirmed with the user on 2026-09-14; see `.ai-context/architecture.md`.)
