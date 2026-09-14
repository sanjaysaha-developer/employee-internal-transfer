-- employee-internal-transfer.T01 — schema migration
-- See .ai-context/plans/employee-internal-transfer.plan.md § Data Model

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS employees (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  location      TEXT NOT NULL,
  role          TEXT NOT NULL,
  manager_id    TEXT REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS transfer_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         TEXT NOT NULL REFERENCES employees(id),
  current_department  TEXT NOT NULL,
  current_location    TEXT NOT NULL,
  current_role_title        TEXT NOT NULL,
  proposed_department TEXT NOT NULL,
  proposed_location   TEXT NOT NULL,
  proposed_role       TEXT NOT NULL,
  effective_date      DATE NOT NULL,
  reason              TEXT,
  status              TEXT NOT NULL CHECK (status IN (
                        'Submitted','HR Review','In Progress',
                        'Ready For Confirmation','Completed','Rejected','Cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AC4: only one non-terminal request per employee, enforced at the DB layer
-- (not just checked-then-inserted in application code) so it holds under
-- concurrent submissions too.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_request_per_employee
  ON transfer_requests (employee_id)
  WHERE status NOT IN ('Completed','Rejected','Cancelled');

CREATE TABLE IF NOT EXISTS stakeholder_actions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_request_id UUID NOT NULL REFERENCES transfer_requests(id),
  type                TEXT NOT NULL CHECK (type IN (
                        'MANAGER','HR','PAYROLL','IT','FACILITIES','EMPLOYEE_CONFIRMATION')),
  status              TEXT NOT NULL CHECK (status IN (
                        'Pending','Completed','Rejected','Skipped')),
  assignee            TEXT NOT NULL,
  notes               TEXT,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stakeholder_actions_by_request
  ON stakeholder_actions (transfer_request_id);

CREATE INDEX IF NOT EXISTS stakeholder_actions_by_assignee_status
  ON stakeholder_actions (assignee, status);
