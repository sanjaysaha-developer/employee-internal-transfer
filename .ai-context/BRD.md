# Business Requirements Document (BRD)

### BRD-001: One easy way to request an internal transfer
**Who asked for this:** Company leadership, as part of the SDD assessment task.

**Why we need this:** Right now, an employee who wants to transfer to a
different team, location, or role has to talk to a lot of people separately —
their manager, HR, Payroll, IT, Facilities — with no single place to check
progress. This is slow and easy to get wrong.

**Sponsor:** The team that owns the One-Point Employee Portal.

**Priority:** High.

**What's already decided:**
- The employee picks a new department, location, role, and effective date, and
  can add an optional reason, then submits the request through the portal.
- The portal keeps track of what still needs to happen and shows the employee
  one simple status.
- For now, Manager, HR, Payroll, IT and Facilities all do their part *inside
  this same portal* — we are not connecting to any of their real systems yet
  (see "Not decided yet" below).

**Not decided yet:**
- Exact rules for whether someone is "eligible" to transfer (like minimum time
  in a role). No HR policy document was given to us, so for now this is a
  human decision made by HR when they review the request, not an automatic
  check.
- Whether transfers across countries need extra steps (visa, tax, etc.) — not
  covered in this version.
- Connecting to real HR/Payroll/IT/Facilities systems — a future project, not
  this one.

**Open Questions & Assumptions** _(added after Gate 1 review, 08 Sep 2026 —
`Gate1_Review_SanjaySaha.docx`, Finding 1/RED)._ Three rules ended up embedded
in the spec as if they were settled facts, when they were actually our calls
with no stakeholder to confirm them. Naming them here, as assumptions, rather
than leaving them silent in the spec:

| # | Open Question | Assumption we're going with (pending real confirmation) | Owner to confirm |
|---|---|---|---|
| OQ1 | The brief says IT "may need to provision or remove access" — conditional wording. Does *every* transfer really need an IT task, even a role-only change with no department/location change? | **Yes, IT always gets a task**, regardless of what changed. Simpler to reason about than trying to guess which role/access changes need IT from the outside; also cheap to close as "not applicable" if it turns out not to be needed. | HR + IT |
| OQ2 | The brief's step 8 says "employee receives confirmation" — that reads as a notification, not an action. Should the employee have to actively confirm before the request is `Completed`, or is a passive notification enough? | **Active confirmation required.** We're treating this as a real acceptance step (did everything actually happen correctly?), not just an FYI — but this is a product decision, not something the brief actually specifies. | HR / Product owner |
| OQ3 | The effective date is collected and validated (≥14 days out), but the brief never says what it's *for* once the request is submitted. Does the org record change on that date, or when the request reaches `Completed`? | **The org record changes at `Completed`.** The effective date is stored as a reference field for Payroll/IT/Facilities to plan around, but nothing in the system automatically waits for that date before applying the change. | HR / Payroll |

These three are carried into the spec as **labelled assumptions** (see
`employee-internal-transfer.spec.md` v1.4), not as silent design choices —
if any answer above turns out to be wrong, only the assumption needs to
change, not a hidden design decision no one knew was being made.

**Note:** Normally a Business Analyst would write this document after talking
to real stakeholders. Here, there was no one to interview, so this was written
directly from the assignment brief. Anywhere we had to guess, it's written down
clearly as a guess in `assessment/01-discovery-analysis.md`, not hidden.
