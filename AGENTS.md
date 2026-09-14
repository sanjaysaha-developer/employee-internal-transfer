# INT AI-First Engineering Policy

This file makes the project self-contained and vendor-agnostic: any AI tool or
assistant (Claude, Gemini, Cursor, Windsurf, Copilot, or otherwise) working in
this repository MUST follow the policy below, sourced from local project
skills first (`.agents/skills/<skill_name>/SKILL.md`) and the INT Control
Plane (`.agent/`) second.

## Authority

Follow the INT SDD Blueprint V1.0.

The project repository is the primary source of project context.

Do not rely on chat history as the project's permanent source of truth.

---

## Artifact Authority

Use the following hierarchy:

1. constitution.md
2. BRD.md
3. Approved Spec
4. Approved Plan
5. Approved Tasks
6. Test Cases
7. Existing Implementation

Code is generated output.

Do not use implementation code to silently redefine requirements.

---

## Mandatory Lifecycle

BRD
↓
Spec
↓
Gate 1
↓
Plan
↓
Architecture Check
↓
Tasks
↓
Test-first RED
↓
Implementation GREEN
↓
Gate 2
↓
Merge
↓
Release
↓
Production Support

---

## Core Rules

- No implementation without an approved Spec.
- No direct code edits when client feedback/screenshots are provided; auto-detect affected Spec ID(s) (or generate a Multi-Spec Impact Matrix), update Specs, and wait for Gate 1 approval first.
- No implementation before tests exist and are confirmed RED.
- One task per agent execution.
- Prompt by stable artifact ID.
- Preserve existing implementation.
- Do not invent requirements.
- Do not bypass Gate 1.
- Do not bypass Gate 2.
- Keep architecture.md current.
- Keep status.md current.
- Do not expose secrets or PII in project artifacts.
- Human owns all merged code.

---

## Context Rules

Prefer repository context over chat history.

Read only the files required for the current task.

Do not scan the entire repository for localized work.

Use `.agentignore` aggressively.

---

## Skill & Governance Resolution Hierarchy

Whenever any skill or governance rule is executed in this workspace, enforce
the following loading priority:

- **Priority 1 (Local Repository First)**: First check if `AGENTS.md` (this
  file) or local project skills (`.agents/skills/<skill_name>/SKILL.md`)
  exist inside this project repository root. If present, load and execute
  the **local project skills** first.
- **Priority 2 (Global Fallback Second)**: If and ONLY if a requested skill
  or rule file is not present locally in the project repository root, fall
  back to checking global skills (`~/.gemini/config/skills/<skill_name>/SKILL.md`).

---

## Related Local Project Skills

- `.agents/skills/int-project-setup/SKILL.md`
- `.agents/skills/int-sdd-lifecycle/SKILL.md`
- `.agents/skills/int-brd-ingestion/SKILL.md`
- `.agents/skills/int-incident-management/SKILL.md`
- `.agents/skills/int-hotfix-management/SKILL.md`
- `.agents/skills/int-release-management/SKILL.md`
- `.agents/skills/int-session-continuation/SKILL.md`
