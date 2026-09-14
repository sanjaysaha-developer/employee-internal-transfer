# Deliverable 1 — Understanding the Problem (Discovery)
## Employee Internal Transfer — One-Point Employee Portal

_Linked to: `.ai-context/BRD.md`_
_Short name (slug): `employee-internal-transfer`_

> **Gate 1 package note** _(added 09 Sep 2026, per `Gate1_Review_SanjaySaha.docx`
> Finding 2/AMBER):_ this file is a submitted Gate 1 artefact, referenced from
> `.ai-context/specs/employee-internal-transfer.spec.md` as background
> reading — it's not just a path reference, include it when sharing the Gate 1
> package.

## What are we trying to do?
Replace a slow, manual process (talking to five different teams one by one)
with one simple digital journey: the employee submits one request, the app
takes care of routing it to the right people, and the employee can check
progress in one place at any time.

## Who uses this?
| Person | What they do |
|---|---|
| Employee | Submits the request, checks the status |
| Current Manager | First person to approve (or reject) |
| HR | Checks if the employee is allowed to transfer |
| Payroll | Updates pay/banding info, only if that needs to change |
| IT | Sets up/removes system access |
| Facilities | Sorts out the new desk/location, only if the location changes |

## The steps (from the brief, matched to what the system tracks)
1. Employee talks to their manager first (happens outside the app)
2. Employee submits the request in the portal → status becomes `Submitted`
3. Manager approves → status becomes `HR Review`
4. HR checks eligibility and approves → downstream work starts
5. The employee's department/location/role info gets updated
6. Payroll updates pay info (only if needed)
7. IT sets up/removes access
8. Facilities sorts the new location (only if needed)
9. Employee gets a final confirmation → status becomes `Completed`

## Rules we decided on (used to write the spec)
1. A request needs: new department, new location, new role, and an effective
   date. A reason is optional.
2. The effective date must be at least 14 days from today (we guessed this —
   no real policy document was given to us, see "Open Questions" below).
3. Manager approves first, then HR — not both at the same time. No point
   asking HR to check eligibility before the manager has even agreed.
4. Once HR approves, Payroll/IT/Facilities all start their part at the same
   time (not one after another) — this makes things faster.
5. Payroll only gets involved if the department or role is changing.
6. Facilities only gets involved if the location is changing.
7. If Manager or HR says no, the request is marked `Rejected` and nothing else
   happens.
8. The employee can cancel their request, but only before Payroll/IT/Facilities
   have started working on it.
9. Once everything is done, the employee gives one final "yes, this is
   correct" confirmation before the request is marked fully `Completed`.
10. An employee can only have one active (not-yet-finished) request at a time.

## Things we decided without a real stakeholder to confirm (guesses, clearly marked)
| # | Question | What we assumed |
|---|---|---|
| Q1 | How much notice is needed before the effective date? | 14 days — a guess, should be confirmed by HR before real use |
| Q2 | Does a location-only move need Payroll involved? | No — our guess |
| Q3 | Can HR reopen a rejected request? | No — employee submits a new one instead |
| Q4 | Can someone have two transfer requests going at once? | No — one at a time only |
| Q5 | Does the *new* manager also need to approve? | Not in this version — only the current manager approves |
| Q6 | What about transfers between countries? | Not covered in this version — flagged as a risk to check later |
| Q7 | Do we send emails? | No — status is shown in the app only, for now |
| Q8 _(added after Gate 1 review)_ | The brief says IT "may need to provision or remove access" (conditional). Does every transfer really need an IT task? | Yes — IT always gets a task, regardless of what changed. See `BRD.md` Open Questions OQ1. |
| Q9 _(added after Gate 1 review)_ | The brief's step 8 says "employee receives confirmation" — a notification. Should that be an active required step instead? | Yes — we made it an active, required confirmation gate before `Completed`. See `BRD.md` Open Questions OQ2. |
| Q10 _(added after Gate 1 review)_ | What does the effective date actually gate once the request is submitted? | Nothing automatic — it's a reference field for Payroll/IT/Facilities; the org record changes at `Completed`, not on the effective date. See `BRD.md` Open Questions OQ3. |

## Things we're assuming
- We don't have a real HR system to check job titles/departments against, so
  we use a small made-up list of employees for testing.
- "Who is logged in" is faked for this exercise with a simple stand-in — not
  real login security (see ADR-0002). This must change before real use.
- We built enough to show the whole idea working end-to-end (submit → manager
  approves → HR approves → Payroll/IT/Facilities do their part → employee
  confirms), plus the reject and cancel paths — not every possible edge case a
  full production rollout would eventually need.

## Things that depend on other things
- A real company login system (faked here).
- A list of departments/locations/roles (we made up a small list for now).
- Payroll, IT, and Facilities don't have real systems to connect to — their
  "connection" is just a to-do item inside this same app.

## What we are NOT building in this version
- Real connections to HR/Payroll/IT/Facilities systems (a future project).
- Automatic eligibility rules — HR makes this call themselves for now.
- New-manager approval.
- Cross-country transfer rules.
- Email/push notifications (status shows in the app only).
- Reopening a rejected request.
- Cancelling once Payroll/IT/Facilities have already started.

## Business decision vs. technical decision
| Decision | Who owns this kind of decision |
|---|---|
| Manager approves before HR, not at the same time | **Business** (company policy) |
| Only one active request at a time | **Business** (company policy) |
| 14-day notice period | **Business** (our guess, needs confirming) |
| Skip Payroll for a location-only move | **Business** (our guess) |
| Employee gives a final "yes, done" confirmation | **Business** (product decision) |
| Payroll/IT/Facilities all start at the same time, not one after another | **Technical** (makes things faster; doesn't change what info is collected) |
| PostgreSQL + Node/Express + React | **Technical** (chosen for this project) |
| Simple login stand-in instead of real login | **Technical** (a shortcut for this exercise only) |
| One shared table for all team to-do items, instead of 5 separate systems | **Technical** |
| Plain SQL instead of a database tool/ORM | **Technical** |

## Are we ready to move on?
Can we describe this feature in one clear paragraph a stranger could build
from? **Yes**: "An employee submits a transfer request (department, location,
role, date, optional reason). Their manager approves it, then HR approves it.
Once HR approves, Payroll/IT/Facilities each get a to-do item if it applies to
them. The employee sees one status the whole time, and gives a final
confirmation once everything is done." Discovery is done — moving on to
writing the actual spec.
