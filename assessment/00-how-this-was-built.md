# How This Was Built — Step by Step (Plain English)

This file explains everything that was done, in simple words, in the order it
was done. If you only read one file in this folder, read this one first.

## The task
Build a feature: an employee can ask for an internal transfer (new department,
new location, new role) through the company portal. The request needs to be
approved by the manager, then HR, and then a few teams (Payroll, IT,
Facilities) need to do their part. The employee should be able to see the
status at any time.

We were asked to follow a process called SDD (Specification-Driven
Development). In simple words: **write down exactly what you're building and
why, before you write any code** — and get that written plan checked by
someone else before you start.

## Step 1 — Understand the problem (Discovery)
File: `assessment/01-discovery-analysis.md`

Before writing anything, we asked: who uses this, what are the rules, what's
not decided yet, and what are we *not* building. Since there was no real HR
person to ask, we wrote down our best guesses clearly and labelled them as
guesses (for example: "employee must give at least 14 days' notice" — nobody
confirmed this, so it's marked as an assumption).

## Step 2 — Write the spec (what we're building)
File: `.ai-context/specs/employee-internal-transfer.spec.md`

A "spec" is a document that says exactly what the feature does — what
buttons/fields it has, what happens when you click submit, what error you get
if something's missing, and so on. We gave every rule a short ID (like `AC1`,
`AC2`) so it's easy to point at later and say "this test checks AC1."

## Step 3 — Someone checks the spec (Gate 1)
File: `assessment/09-gate1-review.md`

Before writing any code, the spec was reviewed like a second person was
checking it, looking for holes. Three real problems were found:
1. Anyone could approve someone else's request — a security hole.
2. One status ("In Progress" for an action) was never actually used anywhere —
   confusing leftover.
3. Only the employee could see their own pending items — but Managers, HR,
   Payroll, IT and Facilities also need to see what's waiting on *them*, and
   there was no way for them to check.

All three were fixed and the spec was updated (version 1.1).

## Step 4 — Write the technical plan
File: `.ai-context/plans/employee-internal-transfer.plan.md`

This is where we decided *how* to build it: which programming language, which
database, how the data is stored, what happens if two people click "submit" at
the same time, and so on. Two important decisions were written down as short
"why we chose this" notes (called ADRs):
- ADR-0001: There's no real Payroll/IT/Facilities computer system to connect
  to, so each team just gets a task inside our own app instead.
- ADR-0002: There's no real company login system to plug into for this
  exercise, so we used a simple stand-in (you just tell the app who you are).
  This is flagged clearly as something that must be replaced before this goes
  anywhere near real use.

## Step 5 — Break the plan into small tasks
File: `.ai-context/tasks/employee-internal-transfer.tasks.md`

The plan was split into 10 small, do-one-at-a-time pieces (called tasks), like
"build the submit-request part" or "build the approve/reject part." Each task
says exactly which rule (AC) it needs to satisfy.

## Step 6 — Write down the AI prompts used
File: `assessment/07-ai-prompts.md`

Each task above was built by giving the AI one clear, specific instruction at
a time — never "just build the whole thing." This file lists exactly what was
asked for each task.

## Step 7 — Write tests first, then write the code (Test-First)
Files: `backend/tests/transferRequests.test.js`, `backend/src/*`

For every rule, a test was written *before* the code that makes it work. Tests
were run and — as expected — failed first (nothing existed yet), then the
actual code was written until every test passed. In the end, all 20 tests
passed against a real database (not a fake/pretend one).

We even proved this "write test first" idea for real: we put a small
deliberate mistake back into the code, ran the tests (one failed, exactly as
expected), then fixed it and ran the tests again (all passed). The full
before/after output is saved in `assessment/10-gate2-evidence.md`.

## Step 8 — Build the screens people actually use
Files: `frontend/src/*`

Three simple screens were built with React:
1. A form to submit a new transfer request.
2. A page to see your requests and their current status.
3. An inbox where Manager/HR/Payroll/IT/Facilities can see what's waiting on
   them and approve/complete it.

## Step 9 — Check for security problems
File: `assessment/08-security-assessment.md`

We went through a checklist: are passwords/secrets safe? Can someone see or
change someone else's request? Are we storing anything we shouldn't (like
salary info)? The one real gap found — the login stand-in from Step 4 — was
written down clearly as something to fix before real use, not hidden.

## Step 10 — Final review before calling it done (Gate 2)
File: `assessment/10-gate2-evidence.md`

One last check: does every rule (AC) actually have a passing test? Is the code
clean? Any leftover security issues? Everything was checked off, and the real
test output was saved as proof, not just a claim that "it works."

## Where everything lives
| What | File |
|---|---|
| The problem, in plain words | `assessment/01-discovery-analysis.md` |
| What we're building | `.ai-context/specs/employee-internal-transfer.spec.md` |
| Extra test scenarios | `.ai-context/test_cases/employee-internal-transfer.test_cases.md` |
| How we're building it | `.ai-context/plans/employee-internal-transfer.plan.md` |
| Small to-do list | `.ai-context/tasks/employee-internal-transfer.tasks.md` |
| What we told the AI | `assessment/07-ai-prompts.md` |
| Security check | `assessment/08-security-assessment.md` |
| First review (before coding) | `assessment/09-gate1-review.md` |
| Final review (after coding) | `assessment/10-gate2-evidence.md` |
| Day-by-day log | `assessment/day-tracker.csv` |
| The actual app | `backend/`, `frontend/`, `docker-compose.yml` |
