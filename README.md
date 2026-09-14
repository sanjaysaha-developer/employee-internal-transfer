# Employee Internal Transfer — SDD Assessment Submission

A feature for the One-Point Employee Portal, built by following INT's
Specification-Driven Development process, step by step:
`Understand the problem → Write the spec → First review → Plan → To-do list →
Write tests first → Build it → Security check → Final review`.

Short name for this feature: `employee-internal-transfer`.

**New here?** Start with `assessment/00-how-this-was-built.md` for the plain-
English story of how this was built, or **`HOW-TO-RUN.md`** if you just want
to get the app running on your computer.

## Where everything is
| # | What | File |
|---|---|---|
| 1 | Understanding the problem | `assessment/01-discovery-analysis.md` |
| 2 | The spec + its rules | `.ai-context/specs/employee-internal-transfer.spec.md` |
| 3 | Extra test scenarios | `.ai-context/test_cases/employee-internal-transfer.test_cases.md` |
| 4 | The technical plan | `.ai-context/plans/employee-internal-transfer.plan.md` (+ 2 decision notes in `.ai-context/decisions/`) |
| 5 | The to-do list | `.ai-context/tasks/employee-internal-transfer.tasks.md` |
| 6 | What we actually built | `assessment/06-implementation-summary.md` |
| 7 | What we asked the AI | `assessment/07-ai-prompts.md` |
| 8 | Security check | `assessment/08-security-assessment.md` |
| 9 | First review (before coding) | `assessment/09-gate1-review.md` |
| 10 | Final review (after coding) | `assessment/10-gate2-evidence.md` |
| — | Day-by-day log | `assessment/day-tracker.csv` |
| — | Current status | `.ai-context/status.md` |
| — | Business requirement | `.ai-context/BRD.md` |
| — | Project rules | `.ai-context/constitution.md` |

Every file links back to the others using short IDs (like
`employee-internal-transfer.AC7`, `.T04`, `.UT01`) so you can always trace a
rule back to its test, and a test back to the code that makes it pass.

## What it's built with
Node.js 22 + Express + PostgreSQL 16 (backend), React + Vite (frontend), all
running in Docker. See `ADR-0001` (why Payroll/IT/Facilities just get a to-do
item instead of a real system connection) and `ADR-0002` (a simple login
stand-in — **must be replaced before real use**).

## How to run it
Full step-by-step instructions (including a guided walkthrough of the app and
a troubleshooting section) are in **`HOW-TO-RUN.md`**. Quick version:
```bash
cp .env.example .env
docker compose up -d --build
# frontend -> http://localhost:5173
# backend  -> http://localhost:4000  (try GET /health)
```
# employee-internal-transfer
