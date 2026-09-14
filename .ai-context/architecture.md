# Architecture

_This file did not exist before the 2026-09-14 `.ai-context` restoration sync.
Its content below is backfilled from what already exists in
`project_context.md`, `constitution.md`, the codebase layout, and
`status.md` — no new technology or architecture decisions were made._

## Project Type
Full Stack

## Architecture Style
**Monolithic.**

Confirmed with the user on 2026-09-14 (not the skill's Full Stack default of
"Modular Monolith / Microservice-Ready"): the codebase is a single Express
backend (`backend/`) and a single React frontend (`frontend/`), with no
internal module/service boundaries drawn and a single PostgreSQL database
accessed via plain SQL (no ORM). Everything ships as one unit via
`docker-compose`. See `.ai-context/constitution.md` → "Technical
building-block rules".

## Technology Stack
| Layer | Choice | Source |
|---|---|---|
| Frontend | React (plain, no state-management library) | project_context.md, constitution.md |
| Backend | Node.js + Express | project_context.md |
| Database | PostgreSQL, plain SQL via `pg` (no ORM) | constitution.md |
| Auth | Stand-in / stub login — not real security (see ADR-0002) | ADR-0002, constitution.md |
| Deployment | Docker via `docker-compose` | constitution.md, docker-compose.yml |

## Repository Layout Note
This project's execution layer predates the current `int-project-setup`
skill's mandated `src/frontend` + `src/backend` + `tests/frontend` +
`tests/backend` layout. The existing, already-built layout —
`backend/src/`, `backend/tests/`, `frontend/src/` — is preserved as-is per
the Existing Project Protection rule (no destructive restructuring of
working code). Any new feature work should follow this project's existing
`backend/` / `frontend/` convention rather than the skill's generic
template baseline, unless a dedicated ADR proposes a restructuring.

## Domain / Module Boundaries
- **Employee Internal Transfer** (`employee-internal-transfer`) — the only
  feature module implemented so far. See:
  - `.ai-context/specs/employee-internal-transfer.spec.md`
  - `.ai-context/plans/employee-internal-transfer.plan.md`
  - `.ai-context/decisions/ADR-0001-mocked-downstream-integrations.md`
  - `.ai-context/decisions/ADR-0002-stub-authentication.md`

## Roles & Approvers
Added 2026-09-14 per user request — provisional/for-now assignment across
all three roles pending any future split.

| Role | Approver | Email |
|---|---|---|
| Lead | Supratim Jetty | supratim.jetty@intglobal.com |
| Project Manager | Supratim Jetty | supratim.jetty@intglobal.com |
| Senior Software Engineer | Supratim Jetty | supratim.jetty@intglobal.com |

## Gate Reviewers
Historical assignments confirmed with the user on 2026-09-14 (known from
`status.md` / `assessment/10-gate2-evidence.md`, not newly assigned):
- **Gate 1 Reviewer(s):** Soumyadeep, INT Delivery Leadership (see
  `Gate1_Review_SanjaySaha.docx`, referenced from `status.md` Day 12 entry) —
  performed the v1.3/v1.4 spec peer review.
- **Gate 2 Reviewer(s):** Candidate (self-assessed — see
  `assessment/10-gate2-evidence.md`) — v1.0–v1.2 implementation review.

Going forward, Supratim Jetty (Lead / Project Manager / Senior Software
Engineer, see Roles & Approvers above) is the approver of record for both
Gate 1 and Gate 2.

## Non-Functional Baselines
See `.ai-context/constitution.md` for the authoritative testing, security,
performance, and versioning rules — not duplicated here to avoid drift.
