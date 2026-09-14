# Deliverable 9 — First Review, Before Any Code (Gate 1)

**What we reviewed:** `.ai-context/specs/employee-internal-transfer.spec.md`,
first version (v1.0)
**Who reviewed it:** A second, separate pass at the spec, deliberately looking
for problems — not the same read-through as when it was written. In a real
team this would be a different person; here, it means reading it fresh,
specifically hunting for holes, instead of just re-reading to approve it.
**When:** Day 4
**How long it should take:** Same day, since the spec has more than 5 rules
in it, our own standard says same-day review, 48 hours at the outside.

## What we checked (checklist)
- [x] Reviewer is separate from the author
- [x] The main idea is explained in one clear paragraph
- [x] Every rule is written as "if this, then that," with its own ID
- [ ] → **problem found** — one endpoint's error list was missing a case
- [x] What's out of scope is written down clearly
- [x] No other spec yet to compare against — this is the first feature
- [x] No security sign-off needed yet — will be checked again below
- [ ] → result: **Changes needed**, not approved yet

## What we found

### Problem 1 (Security) — real problem, must fix
The "make a decision" endpoint (API04) didn't say what happens if someone who
isn't assigned to that to-do item tries to act on it anyway. As written, any
logged-in employee could approve or reject *anyone's* to-do item — including
approving their own HR check. That's a real security hole, and our project
rules say this kind of thing must be checked, not assumed.
**Fix:** Add a clear 403 error for "this isn't your item," and add a new rule
(AC15) that says this explicitly, so it can be tested.

### Problem 2 (Confusing leftover) — real problem, must fix
The spec listed "In Progress" as a possible status for a to-do item, but
nothing in the whole spec ever actually set an item to that status — every
action went straight from "waiting" to "done" or "rejected." Left as-is, this
would leave anyone building from this spec guessing whether they need to add
something to support it, or just ignore it.
**Fix:** Remove "In Progress" from the list of possible to-do item statuses.
If we want a "someone's currently working on it" status later, that needs its
own new rule, not an unused leftover value.

### Problem 3 (Missing feature) — real problem, must fix
The brief clearly says every team should be able to see what's pending with
them — not just the employee. But the spec only gave the *employee* a way to
list their requests. Manager, HR, Payroll, IT and Facilities had no way to
find out what's waiting on them unless someone told them the request ID
directly, which defeats the whole point.
**Fix:** Add a new endpoint (API07) so any team member can list their own
pending items, and add a new rule (AC16) to cover it.

### Problem 4 (Small wording issue) — not a blocker
One rule said IT "is always created" without also saying it's *never*
skipped, which a quick reader might misread as conditional like Payroll and
Facilities are. Small fix, doesn't need to block approval on its own.

## Outcome
**Changes needed.** All three real problems and the wording issue were fixed
the same day. Spec moved to version 1.1.

## Re-check (same day)
Went back through the checklist above after the fixes: every endpoint now has
a complete list of errors, no leftover unused status, the security hole is
closed and has its own testable rule, and the wording is tightened.

**Result: Approved.** Work on the technical plan (Deliverable 4) can start.

## A note on "second person" reviews for this exercise
Normally this review is done by a real second person on the team. For this
exercise, it means a deliberate, separate pass at the frozen first draft,
specifically looking for the kinds of problems listed above (confusing
wording, untestable rules, scope creep, security holes, and so on) — not just
skimming it again. The three real problems found above are the kind of thing
that should still get a real person's sign-off on an actual team before this
spec ships.
