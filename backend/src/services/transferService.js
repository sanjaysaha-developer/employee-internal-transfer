// employee-internal-transfer — core business logic.
// Implements T02–T06 against .ai-context/specs/employee-internal-transfer.spec.md v1.2.
const { pool } = require('../db');

const MIN_NOTICE_DAYS = 14;
const MAX_REASON_LENGTH = 2000;
const TERMINAL_STATUSES = ['Completed', 'Rejected', 'Cancelled'];
const CANCELLABLE_STATUSES = ['Submitted', 'HR Review'];
const DOWNSTREAM_TYPES = ['PAYROLL', 'IT', 'FACILITIES'];

class ServiceError extends Error {
  constructor(status, body) {
    super(body.error);
    this.status = status;
    this.body = body;
  }
}

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// AC3 / QA-02: effectiveDate must be >= today + 14 days (boundary inclusive).
// QA-03: comparison is done on UTC calendar dates only, not wall-clock time,
// so "14 days" means 14 whole calendar days regardless of time-of-day.
function validateSubmission(payload) {
  const fields = {};
  const required = ['proposedDepartment', 'proposedLocation', 'proposedRole', 'effectiveDate'];
  for (const field of required) {
    if (!payload[field] || typeof payload[field] !== 'string' || !payload[field].trim()) {
      fields[field] = 'required';
    }
  }
  if (payload.reason != null && typeof payload.reason !== 'string') {
    fields.reason = 'must be a string';
  }
  if (typeof payload.reason === 'string' && payload.reason.length > MAX_REASON_LENGTH) {
    fields.reason = `must be at most ${MAX_REASON_LENGTH} characters`;
  }

  if (!fields.effectiveDate) {
    const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(payload.effectiveDate);
    if (!parsed) {
      fields.effectiveDate = 'must be YYYY-MM-DD';
    } else {
      const effectiveDate = new Date(Date.UTC(+parsed[1], +parsed[2] - 1, +parsed[3]));
      const minDate = new Date(todayUTC());
      minDate.setUTCDate(minDate.getUTCDate() + MIN_NOTICE_DAYS);
      if (Number.isNaN(effectiveDate.getTime())) {
        fields.effectiveDate = 'must be a valid date';
      } else if (effectiveDate.getTime() < minDate.getTime()) {
        fields.effectiveDate = `must be at least ${MIN_NOTICE_DAYS} days out`;
      }
    }
  }

  if (Object.keys(fields).length > 0) {
    throw new ServiceError(400, { error: 'VALIDATION_ERROR', fields });
  }
}

// AC1 / AC4 / QA-13: create the request + its MANAGER action atomically. The DB's
// partial unique index (see migration 001) is the source of truth for "only one
// active request" — we catch its violation (23505) rather than racing a
// SELECT-then-INSERT check in application code.
async function createTransferRequest(employeeId, payload) {
  validateSubmission(payload);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const empResult = await client.query('SELECT * FROM employees WHERE id = $1', [employeeId]);
    if (empResult.rowCount === 0) {
      throw new ServiceError(401, { error: 'UNAUTHENTICATED' });
    }
    const employee = empResult.rows[0];
    if (!employee.manager_id) {
      // Not an AC in spec.md — found during implementation (§18 "boundary and
      // failure-path correctness is the engineer's job"): an employee with no
      // manager on file cannot be routed a MANAGER action. Documented in
      // assessment/06-implementation-summary.md rather than silently ignored.
      throw new ServiceError(400, {
        error: 'NO_MANAGER_ASSIGNED',
        message: 'This employee has no manager on file; cannot route a Manager approval step.',
      });
    }

    let insertResult;
    try {
      insertResult = await client.query(
        `INSERT INTO transfer_requests
           (employee_id, current_department, current_location, current_role_title,
            proposed_department, proposed_location, proposed_role, effective_date,
            reason, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Submitted')
         RETURNING id, status, created_at`,
        [
          employeeId, employee.department, employee.location, employee.role,
          payload.proposedDepartment, payload.proposedLocation, payload.proposedRole,
          payload.effectiveDate, payload.reason || null,
        ],
      );
    } catch (err) {
      if (err.code === '23505') {
        // Postgres aborts the whole transaction on a constraint violation —
        // any further query on this same client would fail with "current
        // transaction is aborted" until we roll back. Roll back first, then
        // look up the existing active request on a fresh connection.
        await client.query('ROLLBACK');
        const active = await pool.query(
          `SELECT id FROM transfer_requests
           WHERE employee_id = $1 AND status NOT IN ('Completed','Rejected','Cancelled')`,
          [employeeId],
        );
        throw new ServiceError(409, {
          error: 'ACTIVE_REQUEST_EXISTS',
          activeRequestId: active.rows[0] ? active.rows[0].id : null,
        });
      }
      throw err;
    }

    const request = insertResult.rows[0];
    await client.query(
      `INSERT INTO stakeholder_actions (transfer_request_id, type, status, assignee)
       VALUES ($1, 'MANAGER', 'Pending', $2)`,
      [request.id, employee.manager_id],
    );

    await client.query('COMMIT');
    return { id: request.id, status: request.status, createdAt: request.created_at };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function isAssignedTo(action, employeeId, actorRole) {
  return action.assignee === employeeId || (!!actorRole && action.assignee === actorRole);
}

function toActionDTO(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    assignee: row.assignee,
    notes: row.notes,
    completedAt: row.completed_at,
  };
}

function toRequestDTO(request, actions) {
  return {
    id: request.id,
    employeeId: request.employee_id,
    current: {
      department: request.current_department,
      location: request.current_location,
      role: request.current_role_title,
    },
    proposed: {
      department: request.proposed_department,
      location: request.proposed_location,
      role: request.proposed_role,
    },
    effectiveDate: request.effective_date,
    reason: request.reason,
    status: request.status,
    actions: actions.map(toActionDTO),
  };
}

async function fetchRequestAndActions(requestId) {
  const reqResult = await pool.query('SELECT * FROM transfer_requests WHERE id = $1', [requestId]);
  if (reqResult.rowCount === 0) {
    throw new ServiceError(404, { error: 'NOT_FOUND' });
  }
  const actionsResult = await pool.query(
    'SELECT * FROM stakeholder_actions WHERE transfer_request_id = $1 ORDER BY created_at ASC',
    [requestId],
  );
  return { request: reqResult.rows[0], actions: actionsResult.rows };
}

// AC14: 403 for any caller who is neither the owner nor an assignee of one of
// its actions.
async function getTransferRequestDetail(requestId, employeeId, actorRole) {
  const { request, actions } = await fetchRequestAndActions(requestId);
  const isOwner = request.employee_id === employeeId;
  const isAssignee = actions.some((a) => isAssignedTo(a, employeeId, actorRole));
  if (!isOwner && !isAssignee) {
    throw new ServiceError(403, { error: 'FORBIDDEN' });
  }
  return toRequestDTO(request, actions);
}

// AC13: only the caller's own requests, most-recent-first.
async function listTransferRequestsForEmployee(employeeId) {
  const result = await pool.query(
    `SELECT id, status, proposed_department, proposed_location, proposed_role,
            effective_date, created_at
     FROM transfer_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
    [employeeId],
  );
  return result.rows.map((r) => ({
    id: r.id,
    status: r.status,
    proposedDepartment: r.proposed_department,
    proposedLocation: r.proposed_location,
    proposedRole: r.proposed_role,
    effectiveDate: r.effective_date,
    createdAt: r.created_at,
  }));
}

const VALID_DECISIONS_BY_TYPE = {
  MANAGER: ['APPROVE', 'REJECT'],
  HR: ['APPROVE', 'REJECT'],
  PAYROLL: ['COMPLETE'],
  IT: ['COMPLETE'],
  FACILITIES: ['COMPLETE'],
  // EMPLOYEE_CONFIRMATION is actioned via API05 (confirm), never via API04.
  EMPLOYEE_CONFIRMATION: [],
};

// AC5–AC9, AC15 / Gate 1 Finding 1: a stakeholder records a decision on their
// own work item. Every state change is guarded by `WHERE status = 'Pending'`
// on the UPDATE itself (plan.md § Failure-Path & Concurrency Handling), so a
// concurrent double-decision loses the race atomically rather than via a
// separate pre-check (QA-09).
async function decideAction(requestId, actionId, employeeId, actorRole, decision, notes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const actionResult = await client.query(
      `SELECT a.*, r.status AS request_status, r.employee_id AS request_employee_id,
              r.current_department, r.current_location, r.current_role_title,
              r.proposed_department, r.proposed_location, r.proposed_role
       FROM stakeholder_actions a
       JOIN transfer_requests r ON r.id = a.transfer_request_id
       WHERE a.id = $1 AND a.transfer_request_id = $2
       FOR UPDATE OF a, r`,
      [actionId, requestId],
    );
    if (actionResult.rowCount === 0) {
      throw new ServiceError(404, { error: 'NOT_FOUND' });
    }
    const action = actionResult.rows[0];

    if (!isAssignedTo(action, employeeId, actorRole)) {
      throw new ServiceError(403, { error: 'NOT_ASSIGNEE' });
    }

    const validDecisions = VALID_DECISIONS_BY_TYPE[action.type] || [];
    if (action.status !== 'Pending' || !validDecisions.includes(decision)) {
      throw new ServiceError(400, { error: 'INVALID_TRANSITION' });
    }

    const newActionStatus = decision === 'REJECT' ? 'Rejected' : 'Completed';
    const updateResult = await client.query(
      `UPDATE stakeholder_actions
       SET status = $1, notes = $2, completed_at = now(), updated_at = now()
       WHERE id = $3 AND status = 'Pending'
       RETURNING *`,
      [newActionStatus, notes || null, actionId],
    );
    if (updateResult.rowCount === 0) {
      // Lost a concurrent race — someone else acted on this between our SELECT
      // and our UPDATE. Treat identically to "already decided" (QA-09).
      throw new ServiceError(400, { error: 'INVALID_TRANSITION' });
    }
    const updatedAction = updateResult.rows[0];

    // AC5/AC6: Manager gate.
    if (action.type === 'MANAGER') {
      if (decision === 'APPROVE') {
        await client.query(
          `UPDATE transfer_requests SET status = 'HR Review', updated_at = now() WHERE id = $1`,
          [requestId],
        );
        await client.query(
          `INSERT INTO stakeholder_actions (transfer_request_id, type, status, assignee)
           VALUES ($1, 'HR', 'Pending', 'HR')`,
          [requestId],
        );
      } else {
        await client.query(
          `UPDATE transfer_requests SET status = 'Rejected', updated_at = now() WHERE id = $1`,
          [requestId],
        );
      }
    }

    // AC7/AC8: HR gate — on approval, create downstream work items per the
    // diff rule; a skipped type is never created at all (Gate 1 wording fix).
    if (action.type === 'HR') {
      if (decision === 'APPROVE') {
        await client.query(
          `UPDATE transfer_requests SET status = 'In Progress', updated_at = now() WHERE id = $1`,
          [requestId],
        );
        // IT: unconditional.
        await client.query(
          `INSERT INTO stakeholder_actions (transfer_request_id, type, status, assignee)
           VALUES ($1, 'IT', 'Pending', 'IT')`,
          [requestId],
        );
        const roleOrDeptChanged = action.proposed_department !== action.current_department
          || action.proposed_role !== action.current_role_title;
        if (roleOrDeptChanged) {
          await client.query(
            `INSERT INTO stakeholder_actions (transfer_request_id, type, status, assignee)
             VALUES ($1, 'PAYROLL', 'Pending', 'PAYROLL')`,
            [requestId],
          );
        }
        const locationChanged = action.proposed_location !== action.current_location;
        if (locationChanged) {
          await client.query(
            `INSERT INTO stakeholder_actions (transfer_request_id, type, status, assignee)
             VALUES ($1, 'FACILITIES', 'Pending', 'FACILITIES')`,
            [requestId],
          );
        }
      } else {
        await client.query(
          `UPDATE transfer_requests SET status = 'Rejected', updated_at = now() WHERE id = $1`,
          [requestId],
        );
      }
    }

    // AC9: completion aggregation for downstream (non-Manager/HR) actions.
    if (DOWNSTREAM_TYPES.includes(action.type) && newActionStatus === 'Completed') {
      const pendingDownstream = await client.query(
        `SELECT COUNT(*)::int AS count FROM stakeholder_actions
         WHERE transfer_request_id = $1 AND type = ANY($2) AND status = 'Pending'`,
        [requestId, DOWNSTREAM_TYPES],
      );
      if (pendingDownstream.rows[0].count === 0) {
        await client.query(
          `UPDATE transfer_requests SET status = 'Ready For Confirmation', updated_at = now() WHERE id = $1`,
          [requestId],
        );
        await client.query(
          `INSERT INTO stakeholder_actions (transfer_request_id, type, status, assignee)
           VALUES ($1, 'EMPLOYEE_CONFIRMATION', 'Pending', $2)`,
          [requestId, action.request_employee_id],
        );
      }
    }

    await client.query('COMMIT');
    return toActionDTO(updatedAction);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// AC10: employee confirmation closes the loop. Ownership is enforced (403) even
// though it isn't in spec.md's literal API05 exception table — see
// assessment/06-implementation-summary.md for why this defensive check was
// added rather than silently trusting the request id alone.
async function confirmRequest(requestId, employeeId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reqResult = await client.query('SELECT * FROM transfer_requests WHERE id = $1 FOR UPDATE', [requestId]);
    if (reqResult.rowCount === 0) throw new ServiceError(404, { error: 'NOT_FOUND' });
    const request = reqResult.rows[0];
    if (request.employee_id !== employeeId) throw new ServiceError(403, { error: 'FORBIDDEN' });
    if (request.status !== 'Ready For Confirmation') throw new ServiceError(400, { error: 'INVALID_STATE' });

    await client.query(
      `UPDATE transfer_requests SET status = 'Completed', updated_at = now() WHERE id = $1`,
      [requestId],
    );
    await client.query(
      `UPDATE stakeholder_actions SET status = 'Completed', completed_at = now(), updated_at = now()
       WHERE transfer_request_id = $1 AND type = 'EMPLOYEE_CONFIRMATION' AND status = 'Pending'`,
      [requestId],
    );
    await client.query('COMMIT');
    return { id: requestId, status: 'Completed' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// AC11/AC12: cancel while Submitted or HR Review only; every Pending action is
// Skipped, Completed/Rejected actions are untouched.
async function cancelRequest(requestId, employeeId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reqResult = await client.query('SELECT * FROM transfer_requests WHERE id = $1 FOR UPDATE', [requestId]);
    if (reqResult.rowCount === 0) throw new ServiceError(404, { error: 'NOT_FOUND' });
    const request = reqResult.rows[0];
    if (request.employee_id !== employeeId) throw new ServiceError(403, { error: 'FORBIDDEN' });
    if (!CANCELLABLE_STATUSES.includes(request.status)) {
      throw new ServiceError(400, { error: 'INVALID_STATE' });
    }

    await client.query(
      `UPDATE transfer_requests SET status = 'Cancelled', updated_at = now() WHERE id = $1`,
      [requestId],
    );
    await client.query(
      `UPDATE stakeholder_actions SET status = 'Skipped', updated_at = now()
       WHERE transfer_request_id = $1 AND status = 'Pending'`,
      [requestId],
    );
    await client.query('COMMIT');
    return { id: requestId, status: 'Cancelled' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// AC16 / Gate 1 Finding 3: a stakeholder's own pending work items, across every
// request, identified the same way authorization is checked elsewhere —
// assignee = the caller's employee id (Manager/Employee-Confirmation actions)
// or the caller's actor role (HR/Payroll/IT/Facilities actions).
async function listPendingActionsForActor(employeeId, actorRole) {
  const result = await pool.query(
    `SELECT a.*, a.transfer_request_id AS request_id FROM stakeholder_actions a
     WHERE a.status = 'Pending' AND (a.assignee = $1 OR a.assignee = $2)
     ORDER BY a.created_at ASC`,
    [employeeId, actorRole],
  );
  return result.rows.map((r) => ({
    id: r.id,
    transferRequestId: r.request_id,
    type: r.type,
    status: r.status,
    createdAt: r.created_at,
  }));
}

module.exports = {
  ServiceError,
  createTransferRequest,
  getTransferRequestDetail,
  listTransferRequestsForEmployee,
  decideAction,
  confirmRequest,
  cancelRequest,
  listPendingActionsForActor,
};
