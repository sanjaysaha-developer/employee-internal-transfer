# Deliverable 8 — Security Check
## Employee Internal Transfer

Checked against our project rules and our standard security checklist — not
just what the spec happens to mention.

## Checklist results
| Check | Result | Notes |
|---|---|---|
| No personal info in logs, ever | **Pass** | We only ever log the request id, the status change, and the type of action — never people's names, departments, etc., even though our rules would allow logging that much. |
| No passwords/secrets written in code or logged | **Pass** | Database password only comes from a settings file that's never checked into version control, and is never hardcoded anywhere. |
| Clear decision about rate limiting for every endpoint | **Decided: none, for now** | This is a low-traffic internal tool for this exercise, so we skipped it — but we wrote that decision down instead of just leaving it unmentioned, per our rules. Before real use, this should sit behind the company's normal rate limiter. |
| New dependencies checked before adding them | **Pass, with one rejected suggestion, plus one known minor issue** | Backend dependencies: 0 known issues found. One AI-suggested package for generating request codes was rejected in favour of a built-in Postgres feature that already does the same job — one less outside dependency to worry about. Frontend: found 1 known issue in our dev tools (`vite`'s local dev server) — it only affects the local development server, not the actual built app, and doesn't apply once this is deployed properly (see below). |
| Who's allowed to do what is checked, not assumed | **One real gap, clearly written down** | ADR-0002: login is a simple stand-in for this exercise, not real security — **the single biggest risk here**. Everything built *on top* of that stand-in is real and tested: you can only see or act on your own requests/items (rules AC13, AC14, AC15), and that logic doesn't need to change once real login is added — only the stand-in itself gets swapped out. |
| Personal data handled correctly, in storage and in transit | **Mostly fine, one thing deferred** | Nothing beyond the allowed list (employee id/name/department/location/role) is stored — no pay info at all, by design. This runs over plain, unencrypted connections locally for this exercise; a real deployment would add encryption at the network/gateway level, which is normal and not something this one feature needs to build itself. |
| Automated security scans run and clean | **Not set up for this exercise** | There's no automated pipeline for this exercise. We ran the dependency checks by hand instead (see above) — see `assessment/10-gate2-evidence.md` for the actual output. Setting up automatic scanning is a good next step, not something we skipped without saying so. |

## Biggest risks, in order
1. **The stand-in login (ADR-0002).** Anyone who can reach the API could
   pretend to be any employee or any team just by changing what they send.
   **This must be fixed before any real use** — and the fix only touches one
   file (`backend/src/middleware/auth.js`); nothing else needs to change.
2. **No rate limiting.** Fine for a small internal tool like this one; not
   fine if this were ever opened up to the public internet as-is.
3. **No encryption between the app pieces locally.** Fine for local testing;
   a real deployment handles this at the network level, not inside the app.

## Things we checked and found to be fine
- **Database queries are all built safely** — every single one uses proper
  placeholders instead of pasting text directly into a SQL query, so there's
  no way to sneak extra commands into a query. We checked this by searching
  the whole codebase for any query built by joining text together, and found
  none.
- **Can't peek at someone else's request.** The two checks added after the
  review (AC14 and AC15) close off both ways someone could otherwise see or
  touch a request/item that isn't theirs.
- **Can't force a request into an invalid status.** Every action checks the
  request's *current* status on the server before doing anything — so calling
  things in the wrong order from outside the app can't trick it into an
  invalid state.
