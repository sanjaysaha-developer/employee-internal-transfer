# Spec: Employee Internal Transfer

## Spec ID
employee-internal-transfer

## Status
Version 1.4 — **In Peer Review (Gate 1)**. v1.2 remains Approved and in
production. v1.3 (AC17, the Stakeholder Inbox UI fix) and v1.4 (this round —
closing the conditions from the Gate 1 peer review) are both pending sign-off
before any further code changes.

**How we got here, in short:**
- v1.0 → v1.1: A review before coding (see `assessment/09-gate1-review.md`)
  found 3 real problems and fixed them: (1) anyone could approve someone
  else's request — closed that hole, (2) one status value was never actually
  used anywhere — removed it, (3) only the employee could check their pending
  items, but other teams needed that too — added a way for them to check.
- v1.1 → v1.2: While building it (Day 7), we noticed the diagram below had a
  status called "Manager Review" that the rules never actually put a request
  into — a request goes straight from "just submitted" to being reviewed by
  the Manager, with no separate step in between. Rather than just quietly
  writing code that ignored this mistake, we fixed the spec itself: there's
  now just one status, `Submitted`, that covers "just created" and "waiting
  for the Manager" together.
- v1.2 → v1.3 (proposed): A screenshot-based observation on the Stakeholder
  Inbox screen — switching the "Logged in as" employee doesn't reset the
  "Acting as" team-role selector, so a pending team item (e.g. PAYROLL) stays
  visible under the new identity. This is correct per AC16 (team queues are
  role-scoped, not employee-scoped — see ADR-0002), but is confusing in the
  dev-stub UI. Proposed fix is UI-only: reset "Acting as" to "Myself" whenever
  the logged-in employee changes. See new **AC17** below.
- v1.3 → v1.4 (this round): An independent Gate 1 peer review
  (`Gate1_Review_SanjaySaha.docx`, reviewer Soumyadeep, 08 Sep 2026, verdict
  **Approved With Conditions**) found the whole spec package had three
  business decisions quietly baked in as if they were settled facts, plus a
  handful of smaller contract/coverage gaps. Nothing here changes behaviour —
  it makes existing choices explicit, adds one new AC, and closes small
  documentation gaps:
  - The IT-always-triggers rule, the mandatory employee-confirmation step, and
    what the effective date actually gates were never stated as decisions
    anywhere — now logged as assumptions OQ1–OQ3 in `BRD.md` and referenced
    from AC7/AC9/AC10 below (Finding 1, RED).
  - `assessment/01-discovery-analysis.md` is now explicitly flagged as a
    Gate 1 package artefact, not just a path reference (Finding 2, AMBER).
  - New **AC18** — rejection-reason visibility to the employee (Finding 3).
  - API02's error table was missing its 403 case, even though AC14 requires
    it (Finding 4).
  - Added a spec-level rate-limiting statement to close a constitution
    compliance gap (Finding 5).
  - Added an explicit out-of-scope line for the "downstream team never
    completes their task" case (Finding 6).
  - Added **UT20** for the untested role-only fan-out combination, and moved
    API07 to sort after API06 with a note on why its ID is out of sequence
    (Finding 7/8, GREEN).

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review, v1.0→v1.1) | — | — | Approved | See `assessment/09-gate1-review.md` |
| Gate 2 (Code Review, v1.2) | — | — | Approved | See `assessment/10-gate2-evidence.md` |
| Gate 1 (Spec Review, v1.3 delta — AC17) | _pending_ | _pending_ | _pending_ | _pending — see AC17 below_ |
| Gate 1 (Peer Review, full package) | Soumyadeep (INT Delivery Leadership) | 2026-09-08 | Approved With Conditions | See `Gate1_Review_SanjaySaha.docx` — conditions closed in this v1.4 delta |

## Linked BRD
.ai-context/BRD.md#BRD-001

## What this feature does (in one paragraph)
An employee submits a transfer request (new department, location, role,
effective date, and an optional reason) through the portal. Their manager
approves it first, then HR approves it. Once HR approves, the portal
automatically creates to-do items for Payroll, IT and Facilities — but only
for the ones that actually apply to what's changing. The employee sees one
status the whole time, including which team's action is currently pending, and
gives a final "yes, this is done" confirmation once everything is finished.

## Related files
- Builds on: `.ai-context/project_context.md`, `.ai-context/constitution.md`
- Related specs: none yet — this is the first feature in the project
- Background reading: `assessment/01-discovery-analysis.md`

## The two main things this feature tracks
- **Transfer Request** — the employee's submission. Has one overall `status`.
- **Stakeholder Action** — one to-do item per team (Manager, HR, Payroll, IT,
  Facilities, or the employee's own final confirmation). Each has its own
  status.

## How the status changes over time
```
Submitted → HR Review → In Progress → Ready For Confirmation → Completed
Submitted → Rejected        (Manager says no)
HR Review → Rejected        (HR says no)
Submitted / HR Review → Cancelled   (employee cancels)
```
`Submitted` covers both "just created" and "waiting on the Manager" — there's
no separate status for that in between (see the note under Status above).

**What the effective date does** _(added v1.4, per Gate 1 Finding 1c / BRD
OQ3):_ it's stored and shown as a reference date for Payroll/IT/Facilities to
plan their part around. Nothing in the system automatically waits for it —
the employee's department/location/role record is updated as soon as the
request reaches `Completed`, not on the effective date itself. If the org
record actually needs to change on the effective date rather than at
`Completed`, that's a different, bigger feature and isn't built here (see
"What we are NOT building" below).

## API Contract
_(This is the technical contract for each endpoint — exact field names,
what a successful call returns, and what errors look like.)_

### employee-internal-transfer.API01 — POST /api/v1/transfer-requests
Submit a new transfer request.

**What you send:**
```json
{
  "proposedDepartment": "string",
  "proposedLocation": "string",
  "proposedRole": "string",
  "effectiveDate": "YYYY-MM-DD",
  "reason": "string | null"
}
```
**What you get back if it worked (201):**
```json
{
  "id": "uuid",
  "status": "Submitted",
  "createdAt": "ISO-8601 timestamp"
}
```
**What can go wrong:**
| Code | When this happens | What you get back |
|---|---|---|
| 400 | A required field is missing | `{ "error": "VALIDATION_ERROR", "fields": { "<field>": "<message>" } }` |
| 400 | Effective date is less than 14 days away | `{ "error": "VALIDATION_ERROR", "fields": { "effectiveDate": "must be at least 14 days out" } }` |
| 401 | Nobody's logged in | `{ "error": "UNAUTHENTICATED" }` |
| 409 | This employee already has an active request | `{ "error": "ACTIVE_REQUEST_EXISTS", "activeRequestId": "uuid" }` |

### employee-internal-transfer.API02 — GET /api/v1/transfer-requests/:id
Get the full details of one request, including its to-do list history.

**What you get back (200):**
```json
{
  "id": "uuid",
  "employeeId": "string",
  "current": { "department": "string", "location": "string", "role": "string" },
  "proposed": { "department": "string", "location": "string", "role": "string" },
  "effectiveDate": "YYYY-MM-DD",
  "reason": "string | null",
  "status": "Submitted | HR Review | In Progress | Ready For Confirmation | Completed | Rejected | Cancelled",
  "actions": [
    { "id": "uuid", "type": "MANAGER | HR | PAYROLL | IT | FACILITIES | EMPLOYEE_CONFIRMATION",
      "status": "Pending | Completed | Rejected | Skipped",
      "assignee": "string | null", "notes": "string | null",
      "completedAt": "ISO-8601 timestamp | null" }
  ]
}
```
**What can go wrong:**
| Code | When this happens | What you get back |
|---|---|---|
| 401 | Nobody's logged in | `{ "error": "UNAUTHENTICATED" }` |
| 403 _(added v1.4, per AC14 / Gate 1 Finding 4)_ | Caller is neither the employee nor assigned to any to-do item on this request | `{ "error": "FORBIDDEN" }` |
| 404 | That request doesn't exist | `{ "error": "NOT_FOUND" }` |

### employee-internal-transfer.API03 — GET /api/v1/transfer-requests
List the logged-in employee's own requests.

**What you get back (200):**
```json
{ "items": [ { "id": "uuid", "status": "string", "proposedDepartment": "string",
  "proposedLocation": "string", "proposedRole": "string", "effectiveDate": "YYYY-MM-DD",
  "createdAt": "ISO-8601 timestamp" } ] }
```
**What can go wrong:**
| Code | When this happens | What you get back |
|---|---|---|
| 401 | Nobody's logged in | `{ "error": "UNAUTHENTICATED" }` |

### employee-internal-transfer.API04 — PATCH /api/v1/transfer-requests/:id/actions/:actionId
A team member (Manager/HR/Payroll/IT/Facilities) makes a decision on their own
to-do item — approve, reject, or mark it done.

**What you send:**
```json
{ "decision": "APPROVE | REJECT | COMPLETE", "notes": "string | null" }
```
**What you get back if it worked (200):** the updated to-do item (same shape as
`actions[]` above).
**What can go wrong:**
| Code | When this happens | What you get back |
|---|---|---|
| 400 | This decision doesn't make sense for this item right now | `{ "error": "INVALID_TRANSITION" }` |
| 401 | Nobody's logged in | `{ "error": "UNAUTHENTICATED" }` |
| 403 | This item isn't assigned to you | `{ "error": "NOT_ASSIGNEE" }` |
| 404 | This item doesn't exist | `{ "error": "NOT_FOUND" }` |

### employee-internal-transfer.API05 — POST /api/v1/transfer-requests/:id/confirm
The employee gives their final "yes, this is done" confirmation.

**What you get back (200):** `{ "id": "uuid", "status": "Completed" }`
**What can go wrong:**
| Code | When this happens | What you get back |
|---|---|---|
| 400 | Request isn't ready for confirmation yet | `{ "error": "INVALID_STATE" }` |
| 401 | Nobody's logged in | `{ "error": "UNAUTHENTICATED" }` |
| 404 | That request doesn't exist | `{ "error": "NOT_FOUND" }` |

### employee-internal-transfer.API06 — POST /api/v1/transfer-requests/:id/cancel
The employee cancels their own request.

**What you get back (200):** `{ "id": "uuid", "status": "Cancelled" }`
**What can go wrong:**
| Code | When this happens | What you get back |
|---|---|---|
| 400 | This request can't be cancelled right now | `{ "error": "INVALID_STATE" }` |
| 401 | Nobody's logged in | `{ "error": "UNAUTHENTICATED" }` |
| 404 | That request doesn't exist | `{ "error": "NOT_FOUND" }` |

### employee-internal-transfer.API07 — GET /api/v1/stakeholder-actions?assignee=me&status=Pending
A team member lists their own pending to-do items, across every transfer
request — added after the review in Step 3 (Gate 1), so every team, not just
the employee, has one place to check what's waiting on them.

_Numbering note (added v1.4, per Gate 1 Finding 7/GREEN): API07 keeps its
original ID even though it now sorts last in this document — it was added
after Gate 1 (between the original API04 and API05), and renumbering it would
have meant relabelling AC16, UT17, and every code comment that already cites
API07 by that exact ID. Sorted last here purely for top-to-bottom
readability; the ID itself is not sequential with document position._

**What you get back (200):**
```json
{ "items": [ { "id": "uuid", "transferRequestId": "uuid", "type": "MANAGER | HR | PAYROLL | IT | FACILITIES | EMPLOYEE_CONFIRMATION",
  "status": "Pending", "createdAt": "ISO-8601 timestamp" } ] }
```
**What can go wrong:**
| Code | When this happens | What you get back |
|---|---|---|
| 401 | Nobody's logged in | `{ "error": "UNAUTHENTICATED" }` |

## Acceptance Criteria (the exact rules the feature must follow)
1. **AC1** — If all required fields are filled in and the effective date is at
   least 14 days away, submitting creates a request with status `Submitted`
   and a `MANAGER` to-do item with status `Pending`.
2. **AC2** — If a required field is missing, submitting fails with a 400 error
   and no request is created.
3. **AC3** — If the effective date is less than 14 days away, submitting fails
   with a 400 error about the date, and no request is created.
4. **AC4** — If the employee already has an active request, trying to submit
   another one fails with a 409 error, and no new request is created.
5. **AC5** — If the Manager approves their to-do item, the request moves to
   `HR Review` and a new `HR` to-do item is created as `Pending`.
6. **AC6** — If the Manager rejects their to-do item, the request moves to
   `Rejected`, nothing else is created, and the reason is saved on that item.
7. **AC7** — If HR approves, the request moves to `In Progress`, and: `IT`
   always gets a to-do item; `PAYROLL` only gets one if the department or role
   is changing; `FACILITIES` only gets one if the location is changing. If a
   team doesn't need to be involved, no item is created for them at all — it's
   not just hidden, it simply doesn't exist. _(IT-always-triggers is a logged
   assumption, not a confirmed HR/IT policy — see `BRD.md` OQ1.)_
8. **AC8** — If HR rejects, the request moves to `Rejected` and no Payroll/IT/
   Facilities items are created.
9. **AC9** — Once every Payroll/IT/Facilities item that *was* created is
   marked `Completed`, the request moves to `Ready For Confirmation` and a
   final `EMPLOYEE_CONFIRMATION` item is created as `Pending`. _(There is
   deliberately no timeout or escalation if a team never completes their
   item — see "What we are NOT building" below.)_
10. **AC10** — If the employee confirms while the request is
    `Ready For Confirmation`, the request moves to `Completed`. _(Making this
    an active, required confirmation — rather than a passive notification —
    is a logged assumption, not a confirmed product decision — see `BRD.md`
    OQ2.)_
11. **AC11** — If the employee cancels while the request is `Submitted` or
    `HR Review`, the request moves to `Cancelled`, and every still-`Pending`
    item on it is marked `Skipped`.
12. **AC12** — If the request is past that point (`In Progress`,
    `Ready For Confirmation`, `Completed`, `Rejected`, or `Cancelled`), trying
    to cancel it fails with a 400 error and nothing changes.
13. **AC13** — When an employee checks their list of requests, they only ever
    see their own — never anyone else's — newest first.
14. **AC14** — If someone who is neither the employee nor assigned to one of
    the to-do items tries to look at a request's details, they get a 403 error
    and no data is returned.
15. **AC15** _(added after Gate 1, Finding 1)_ — If someone who isn't assigned
    to a to-do item tries to act on it, they get a 403 `NOT_ASSIGNEE` error and
    nothing changes.
16. **AC16** _(added after Gate 1, Finding 3)_ — When a team member checks
    their own pending items (API07), they only see items assigned to them —
    never someone else's, and never ones that are already done.
17. **AC17** _(proposed, v1.3, pending Gate 1)_ — In the Stakeholder Inbox
    screen, whenever the logged-in employee (the "Logged in as" identity)
    changes, the "Acting as" role selector resets to "Myself" and the pending
    item list refreshes accordingly — it never silently keeps showing a
    previous employee's chosen team-role queue. This is a frontend-only
    behavior; it does not change API07's data contract (AC16 is unaffected).
18. **AC18** _(added v1.4, Gate 1 Finding 3)_ — When an employee views a
    `Rejected` request via API02, the rejection reason (the `notes` field of
    whichever action — `MANAGER` or `HR` — actually rejected it) is visible
    in the response, same as any other action's notes. Nothing is filtered
    out for the employee's own request.

## Test cases that come straight from these rules
| Test ID | Checks rule | What it tests | What should happen |
|---|---|---|---|
| UT01 | AC1 | Valid submission, date 20 days away | 201, status=Submitted, MANAGER item Pending |
| UT02 | AC2 | Submission missing `proposedRole` | 400, mentions proposedRole |
| UT03 | AC3 | Submission with date = tomorrow | 400, mentions effectiveDate |
| UT04 | AC4 | Submitting a 2nd request while the 1st is still active | 409, ACTIVE_REQUEST_EXISTS |
| UT05 | AC5 | Manager approves | status=HR Review, HR item Pending |
| UT06 | AC6 | Manager rejects | status=Rejected, no HR item created |
| UT07 | AC7 | HR approves; dept+role same, location different | no PAYROLL item, yes FACILITIES, yes IT |
| UT08 | AC7 | HR approves; dept different, location same | yes PAYROLL, no FACILITIES, yes IT |
| UT20 _(added v1.4)_ | AC7 | HR approves; role different, dept+location same | yes PAYROLL (role changed), no FACILITIES, yes IT |
| UT09 | AC8 | HR rejects | status=Rejected, no downstream items created |
| UT10 | AC9 | Last non-Manager/HR item marked done | status=Ready For Confirmation, EMPLOYEE_CONFIRMATION item Pending |
| UT11 | AC10 | Employee confirms | status=Completed |
| UT12 | AC11 | Cancel during HR Review, Manager item already done | status=Cancelled, HR item Skipped, Manager item stays Completed |
| UT13 | AC12 | Try to cancel while In Progress | 400, INVALID_STATE, status unchanged |
| UT14 | AC13 | List requests as Employee A | only Employee A's own requests come back |
| UT15 | AC14 | View details as an unrelated employee | 403, no data returned |
| UT16 | AC15 | Try to act on an HR item as an unrelated employee | 403, NOT_ASSIGNEE, nothing changes |
| UT17 | AC16 | HR checks their pending items, some already done | only the still-pending ones come back |
| UT18 | AC17 _(proposed)_ | On Stakeholder Inbox, switch "Logged in as" while "Acting as: PAYROLL team" is selected | "Acting as" resets to "Myself"; list reloads for the new identity's own items |
| UT19 _(added v1.4)_ | AC18 | Manager rejects with a reason, then the employee views the request via API02 | response includes the MANAGER action's `notes` field with the rejection reason |

## What we are NOT building in this version
- Real connections to HR/Payroll/IT/Facilities systems (a future project).
- Automatic eligibility rules — HR decides this themselves.
- Approval from the *new* department's manager.
- Rules for transfers between countries.
- Email/push notifications.
- Reopening a rejected request — the employee submits a new one instead.
- Cancelling once Payroll/IT/Facilities have already started working on it.
- Automatic timeout or escalation when a downstream team (Payroll/IT/
  Facilities) never completes their to-do item _(added v1.4, Gate 1
  Finding 6)_ — if a team never acts, the request simply stays `In Progress`
  indefinitely; there's no reminder, escalation, or "mark as not required"
  override in this version. A V2 concern.

## Non-functional rules (from the project rules file)
- No personal info beyond employee id/name/department/location/role is stored
  or logged — no pay/salary info is stored in this feature at all.
- API responses should be under 500ms.
- Every action's full history is kept forever.
- Every endpoint needs someone logged in (a simple stand-in for now — see
  ADR-0002).
- Rate limiting _(added v1.4, Gate 1 Finding 5)_: no per-endpoint rate
  limiting is implemented in V1 — this is an internal tool reachable only by
  authenticated employees and approved stakeholders, on an internal network.
  Revisit this decision if the portal is ever exposed to higher traffic or
  external/unauthenticated access.
