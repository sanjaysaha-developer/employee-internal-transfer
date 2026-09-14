# Test Cases: Employee Internal Transfer

## Based on
`.ai-context/specs/employee-internal-transfer.spec.md` (version 1.2)

This file has two parts: the tests that come straight from the spec's own
rules (same list as in the spec), and extra tests a tester would add to check
more scenarios (odd data, error cases, and full end-to-end flows). Broader
company-wide test scenarios that touch more than one feature would go in a
separate `_integration.md` file — we don't have one yet since this is the only
feature in the project.

## Tests that come straight from the spec
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
| UT09 | AC8 | HR rejects | status=Rejected, no downstream items created |
| UT10 | AC9 | Last non-Manager/HR item marked done | status=Ready For Confirmation, EMPLOYEE_CONFIRMATION item Pending |
| UT11 | AC10 | Employee confirms | status=Completed |
| UT12 | AC11 | Cancel during HR Review, Manager item already done | status=Cancelled, HR item Skipped, Manager item stays Completed |
| UT13 | AC12 | Try to cancel while In Progress | 400, INVALID_STATE, status unchanged |
| UT14 | AC13 | List requests as Employee A | only Employee A's own requests come back |
| UT15 | AC14 | View details as an unrelated employee | 403, no data returned |
| UT16 | AC15 | Try to act on an HR item as an unrelated employee | 403, NOT_ASSIGNEE, nothing changes |
| UT17 | AC16 | HR checks their pending items, some already done | only the still-pending ones come back |

## Extra tests a tester would add

### Odd or edge-case data
| Test ID | What it checks | What should happen |
|---|---|---|
| QA-01 | Leaving `reason` blank vs. sending an empty text | Both are fine, no error |
| QA-02 | Date exactly 14 days away (the edge case) | Accepted — "at least 14" includes exactly 14 |
| QA-03 | Date 13 days + almost midnight vs. 14 days + just after midnight | Should be consistent — explained in the plan |
| QA-04 | New dept/location/role are all exactly the same as current | Still allowed to submit; later, Payroll and Facilities are both skipped since nothing actually changed |
| QA-05 | A very long reason (over 2000 characters) | 400 error, too long |
| QA-06 | Reason/department/location with non-English characters | Accepted, saved correctly |

### Error cases
| Test ID | What it checks | What should happen |
|---|---|---|
| QA-07 | Sending a `decision` that isn't APPROVE/REJECT/COMPLETE | 400 error |
| QA-08 | Marking a Manager item as "COMPLETE" (only Payroll/IT/Facilities use COMPLETE) | 400 error |
| QA-09 | Acting on an item that's already been decided | 400 error, nothing changes — acting twice does nothing extra |
| QA-10 | Cancelling a request that doesn't exist | 404 error |
| QA-11 | Confirming a request that isn't ready yet | 400 error |
| QA-12 | Submitting with no login info at all | 401 error |
| QA-13 | Database fails partway through saving (simulated) | Nothing half-saved — either the whole request is created, or none of it is |

### Full journeys (start to finish)
| Test ID | What it checks | What should happen |
|---|---|---|
| QA-14 | Full happy path: submit → manager approves → HR approves (dept+location both change) → all teams finish → employee confirms | Ends at Completed, with a full, in-order history |
| QA-15 | Full "manager says no" path | Ends at Rejected, with only the Manager item in the history |
| QA-16 | Full "cancel during HR review" path | Ends at Cancelled; Manager=Completed, HR=Skipped |
| QA-17 | Every action has a timestamp once it's decided, and never changes after that | History can't be quietly edited later |

## Who owns what
A tester checks the odd-data and error-case scenarios above. The rules listed
in "Tests that come straight from the spec" (UT01–UT17) are the bare minimum —
every one of them must pass before this feature is allowed to move to the
final review (Gate 2).
