# Prompt History

_Append-only chronological audit log of user prompts, change requests, and AI
execution turns. NEVER overwrite this file's existing content — only append
new entries below the last one._

_This file did not exist before the 2026-09-14 `.ai-context` restoration
sync. It starts here going forward; it does not retroactively reconstruct
prompt history that predates this file. Prior work is summarized in
`.ai-context/status.md` (Day 1–12 log) and `assessment/07-ai-prompts.md`._

---

## 2026-09-14 — `.ai-context` / Control Plane restoration sync

- **Command:** `/int-project-setup` (re-run on an already-initialized
  project).
- **Action:** Non-destructive restoration sync. Restored the missing INT
  Control Plane (`.agent/`), `AGENTS.md`, `.agents/skills/`, all 12
  `.ai-context/templates/`, the missing `.ai-context/` subdirectories
  (`pr_reviews/`, `incidents/`, `hotfixes/`, `releases/`,
  `change_requests/`), and the missing base files
  (`architecture.md`, `brd-change-log.md`, `prompt_history.md`). Merged
  `.gitignore` additively (kept existing entries, added the mandatory
  Control Plane / knowledge base negations and standard exclusion
  boundaries).
- **Not touched:** `BRD.md`, `constitution.md`, `project_context.md`
  (only appended two new sections), `status.md`, `specs/`, `plans/`,
  `tasks/`, `test_cases/`, `decisions/`, `backend/`, `frontend/`,
  `assessment/`.
- **User confirmations obtained:** Architecture style = Monolithic (not the
  skill's Full Stack default of Modular Monolith/Microservice-Ready); Gate
  1/Gate 2 reviewers recorded from existing project records (Soumyadeep,
  INT Delivery Leadership for Gate 1; Candidate/self-assessed for Gate 2).

## 2026-09-14 — Roles & Approvers update

- **Prompt:** "in governace and roles add - supratim.jetty@intglobal.com as
  approver for lead, project manger and senior software engineer for now"
- **Action:** Added a "Roles & Approvers" table to `project_context.md` and
  `architecture.md` assigning Supratim Jetty (supratim.jetty@intglobal.com)
  as approver for the Lead, Project Manager, and Senior Software Engineer
  roles — noted explicitly as a provisional/for-now assignment across all
  three roles. Historical Gate 1 (Soumyadeep) and Gate 2 (Candidate,
  self-assessed) reviewer records were kept, not overwritten, and
  cross-referenced as the approver of record going forward.
- **Not touched:** the spec's own "Status"/history section
  (`.ai-context/specs/employee-internal-transfer.spec.md`) — it does not use
  the template's "Roles & Assignments" block, and this change is scoped to
  project-level governance docs, not the spec under active Gate 1 review.
