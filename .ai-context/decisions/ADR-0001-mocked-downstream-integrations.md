# ADR-0001: Payroll/IT/Facilities get a to-do item in our app, not a real system connection

## Why we needed to decide this
The business journey says Payroll updates pay info, IT sets up/removes
access, and Facilities sorts out the new location. But there's no real
Payroll, IT, or Facilities computer system for us to connect to in this
project — and nobody gave us enough detail (no docs, no login info, no data
format) to fake a realistic connection to any of them either.

## What we decided
Each of Payroll/IT/Facilities gets a simple to-do item inside our own app —
a row in the `stakeholder_actions` table. Whoever is on that team logs in
(using our simple stand-in login) and marks their item done through the same
screens the employee and Manager/HR use. No outside system is called at all.

## What this means
- The overall flow (creating to-do items, tracking when they're all done,
  showing one combined status) is fully real and fully tested.
- The *actual work* each team does ("update the pay band," "set up VPN
  access," "book a new desk") isn't automated — someone on that team just
  ticks it off in the app, the same way they might tick it off in an email
  thread today, except now there's one shared record everyone can see.
- If we ever want to connect one of these to a real system later, that's a
  small, contained change to the code that creates/finishes that to-do item —
  it doesn't need to change the database design or the API.
- What this does **not** solve: actually keeping Payroll/IT/Facilities's real
  systems in sync automatically. That's out of scope until those systems (and
  a way to talk to them) actually exist.
