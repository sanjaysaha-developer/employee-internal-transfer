# Deliverable 7 — What We Asked the AI to Build

The idea: give the AI one clear, specific instruction at a time, pointing at
exact rule/task IDs — never "just build the whole thing." Each instruction
below matches exactly one task from `tasks.md`, and was reviewed against its
rules before moving to the next one.

---

**For T01**
> Build only T01. Create the database setup file exactly matching the plan's
> database design — `employees`, `transfer_requests` (with the "only one
> active request per employee" rule), `stakeholder_actions`. Add 6 test
> employees, including at least one manager → report pair. Don't write any
> other code yet — this task is just the database.

**For T02**
> Build T02 — must satisfy rules AC1, AC2, AC3, AC4, AC13, AC14, matching the
> spec's API details exactly. Write the tests first (covering UT01–UT04,
> UT13–UT15), check they fail (since nothing exists yet), then write the code
> until they pass. Don't touch T01's database file.

**For T03**
> Build T03 — must satisfy AC5, AC6, AC15, including the "you're not allowed
> to act on this" error added after the review. Rule: for Manager/Employee-
> Confirmation items, the item must be assigned to *you specifically*; for
> HR/Payroll/IT/Facilities items, you must be acting as *that team*. Write
> UT05, UT06, UT16 as failing tests first. Don't build T04's part yet — HR
> approving should only change the status for now; the actual downstream
> to-do items come in the next task, kept separate so each task stays small
> and easy to check.

**For T04**
> Build T04, on top of what T03 already does — must satisfy AC7, AC8, AC9
> exactly, including that a to-do item that isn't needed (like Payroll for a
> location-only move) is never created at all, not just hidden. Write UT07,
> UT08, UT09, UT10 as failing tests first, plus the two extra scenarios about
> "nothing actually changed" and "history can't be edited later."

**For T05**
> Build T05 — must satisfy AC10, AC11, AC12. Cancelling only works while the
> request is still `Submitted` or `HR Review`; every still-waiting item gets
> marked Skipped, but already-finished items stay untouched. Guard this
> properly so two people can't cancel/act on the same thing at the same time
> by accident. Write UT11, UT12, UT13 first.

**For T06**
> Build T06 — must satisfy AC16 and the new endpoint exactly. Write UT17
> first.

**For T07/T08/T09 (the screens)**
> Build the three React screens per the plan — the submit form (T07), the
> requests list + status view (T08), the shared team inbox (T09). The screen
> can check things like "did you fill this in," but the backend is always the
> real check — never trust the screen's own checking alone. Don't add any new
> state-management library — not needed for a feature this size.

**For T10 (setup)**
> Wire up `docker-compose.yml`: a database service that sets itself up and
> loads test data automatically, a backend service, a frontend service, and
> an example settings file. Make sure a clean copy of this project can be
> started with one command and no extra manual steps.

---

## What we deliberately did NOT do
We never asked for "build the whole feature" in one go — each instruction
above maps to exactly one row in `tasks.md`. When one attempt didn't match its
rule correctly (see `assessment/10-gate2-evidence.md` — this happened once,
with T04's Payroll item), the fix was to correct the instruction and rebuild
that one task properly, not to just keep poking at it with follow-up prompts
until it happened to work.
