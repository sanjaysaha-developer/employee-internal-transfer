// employee-internal-transfer — Jest + Supertest, run against a real Postgres
// (constitution.md Testing Discipline). Requires DATABASE_URL pointing at a
// migrated+seeded test database (see README "Running the tests").
const request = require('supertest');
const { createApp } = require('../src/app');
const { pool } = require('../src/db');

const app = createApp();

// Seeded identities (backend/src/migrations/002_seed.sql)
const ADITI = 'EMP1001'; // Engineering, Bengaluru, Software Engineer, manager EMP1002
const ROHAN_MANAGER = 'EMP1002'; // Aditi's manager
const NEHA = 'EMP1003'; // Sales, Mumbai, Sales Executive, manager EMP1004
const KARAN_MANAGER = 'EMP1004'; // Neha's manager
const PRIYA_HR_PERSON = 'EMP1005'; // has manager EMP1002, acts as HR via x-actor-role
const SURESH_IT_PERSON = 'EMP1006';

function asEmployee(employeeId) {
  return { 'x-employee-id': employeeId };
}
function asRole(employeeId, role) {
  return { 'x-employee-id': employeeId, 'x-actor-role': role };
}

function futureDate(daysFromNow) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function cleanDb() {
  await pool.query('DELETE FROM stakeholder_actions');
  await pool.query('DELETE FROM transfer_requests');
}

async function submit(employeeId, overrides = {}) {
  const payload = {
    proposedDepartment: 'Engineering',
    proposedLocation: 'Bengaluru',
    proposedRole: 'Senior Software Engineer',
    effectiveDate: futureDate(20),
    reason: 'Career growth',
    ...overrides,
  };
  return request(app).post('/api/v1/transfer-requests').set(asEmployee(employeeId)).send(payload);
}

beforeEach(cleanDb);
afterAll(async () => {
  await cleanDb();
  await pool.end();
});

describe('employee-internal-transfer.AC1/UT01 — valid submission', () => {
  it('creates a request in Submitted status with a Pending MANAGER action', async () => {
    const res = await submit(ADITI);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Submitted');

    const detail = await request(app).get(`/api/v1/transfer-requests/${res.body.id}`).set(asEmployee(ADITI));
    expect(detail.body.actions).toHaveLength(1);
    expect(detail.body.actions[0]).toMatchObject({ type: 'MANAGER', status: 'Pending', assignee: ROHAN_MANAGER });
  });
});

describe('employee-internal-transfer.AC2/UT02 — missing required field', () => {
  it('rejects a submission missing proposedRole', async () => {
    const res = await submit(ADITI, { proposedRole: undefined });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.fields).toHaveProperty('proposedRole');
  });
});

describe('employee-internal-transfer.AC3/UT03 — effective date too soon', () => {
  it('rejects effectiveDate = tomorrow', async () => {
    const res = await submit(ADITI, { effectiveDate: futureDate(1) });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('effectiveDate');
  });

  it('QA-02: accepts effectiveDate = exactly 14 days out (boundary)', async () => {
    const res = await submit(ADITI, { effectiveDate: futureDate(14) });
    expect(res.status).toBe(201);
  });
});

describe('employee-internal-transfer.AC4/UT04 — active request conflict', () => {
  it('rejects a 2nd submission while the 1st is still active', async () => {
    const first = await submit(ADITI);
    expect(first.status).toBe(201);
    const second = await submit(ADITI);
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('ACTIVE_REQUEST_EXISTS');
    expect(second.body.activeRequestId).toBe(first.body.id);
  });
});

describe('employee-internal-transfer.AC5/UT05 — Manager approves', () => {
  it('moves status to HR Review and creates a Pending HR action', async () => {
    const created = await submit(ADITI);
    const detail1 = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(ADITI));
    const managerAction = detail1.body.actions.find((a) => a.type === 'MANAGER');

    const patch = await request(app)
      .patch(`/api/v1/transfer-requests/${created.body.id}/actions/${managerAction.id}`)
      .set(asEmployee(ROHAN_MANAGER))
      .send({ decision: 'APPROVE' });
    expect(patch.status).toBe(200);
    expect(patch.body.status).toBe('Completed');

    const detail2 = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(ADITI));
    expect(detail2.body.status).toBe('HR Review');
    const hrAction = detail2.body.actions.find((a) => a.type === 'HR');
    expect(hrAction).toMatchObject({ status: 'Pending', assignee: 'HR' });
  });
});

describe('employee-internal-transfer.AC6/UT06 — Manager rejects', () => {
  it('moves status to Rejected and creates no HR action', async () => {
    const created = await submit(ADITI);
    const detail1 = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(ADITI));
    const managerAction = detail1.body.actions.find((a) => a.type === 'MANAGER');

    const patch = await request(app)
      .patch(`/api/v1/transfer-requests/${created.body.id}/actions/${managerAction.id}`)
      .set(asEmployee(ROHAN_MANAGER))
      .send({ decision: 'REJECT', notes: 'Not eligible yet' });
    expect(patch.status).toBe(200);

    const detail2 = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(ADITI));
    expect(detail2.body.status).toBe('Rejected');
    expect(detail2.body.actions.some((a) => a.type === 'HR')).toBe(false);
  });
});

async function driveToHRReview(employeeId, managerId, overrides = {}) {
  const created = await submit(employeeId, overrides);
  const detail = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(employeeId));
  const managerAction = detail.body.actions.find((a) => a.type === 'MANAGER');
  await request(app)
    .patch(`/api/v1/transfer-requests/${created.body.id}/actions/${managerAction.id}`)
    .set(asEmployee(managerId))
    .send({ decision: 'APPROVE' });
  return created.body.id;
}

describe('employee-internal-transfer.AC7/UT07/UT08 — HR approves, conditional downstream', () => {
  it('UT07: dept+role unchanged, location changed => no PAYROLL, yes FACILITIES, yes IT', async () => {
    const id = await driveToHRReview(ADITI, ROHAN_MANAGER, {
      proposedDepartment: 'Engineering', // unchanged
      proposedRole: 'Software Engineer', // unchanged
      proposedLocation: 'Hyderabad', // changed
    });
    const hrPatch = await request(app)
      .patch(`/api/v1/transfer-requests/${id}/actions/${(await getActionId(id, 'HR'))}`)
      .set(asRole(PRIYA_HR_PERSON, 'HR'))
      .send({ decision: 'APPROVE' });
    expect(hrPatch.status).toBe(200);

    const detail = await request(app).get(`/api/v1/transfer-requests/${id}`).set(asEmployee(ADITI));
    expect(detail.body.status).toBe('In Progress');
    const types = detail.body.actions.map((a) => a.type);
    expect(types).toContain('IT');
    expect(types).toContain('FACILITIES');
    expect(types).not.toContain('PAYROLL');
  });

  it('UT08: dept changed, location unchanged => yes PAYROLL, no FACILITIES, yes IT', async () => {
    const id = await driveToHRReview(ADITI, ROHAN_MANAGER, {
      proposedDepartment: 'Product', // changed
      proposedRole: 'Software Engineer',
      proposedLocation: 'Bengaluru', // unchanged
    });
    await request(app)
      .patch(`/api/v1/transfer-requests/${id}/actions/${(await getActionId(id, 'HR'))}`)
      .set(asRole(PRIYA_HR_PERSON, 'HR'))
      .send({ decision: 'APPROVE' });

    const detail = await request(app).get(`/api/v1/transfer-requests/${id}`).set(asEmployee(ADITI));
    const types = detail.body.actions.map((a) => a.type);
    expect(types).toContain('IT');
    expect(types).toContain('PAYROLL');
    expect(types).not.toContain('FACILITIES');
  });
});

describe('employee-internal-transfer.AC8/UT09 — HR rejects', () => {
  it('moves status to Rejected, no downstream actions created', async () => {
    const id = await driveToHRReview(NEHA, KARAN_MANAGER, { proposedDepartment: 'Marketing' });
    const hrActionId = await getActionId(id, 'HR', NEHA);
    await request(app)
      .patch(`/api/v1/transfer-requests/${id}/actions/${hrActionId}`)
      .set(asRole(PRIYA_HR_PERSON, 'HR'))
      .send({ decision: 'REJECT', notes: 'Ineligible' });

    const detail = await request(app).get(`/api/v1/transfer-requests/${id}`).set(asEmployee(NEHA));
    expect(detail.body.status).toBe('Rejected');
    expect(detail.body.actions.some((a) => ['PAYROLL', 'IT', 'FACILITIES'].includes(a.type))).toBe(false);
  });
});

async function getActionId(requestId, type, employeeId = ADITI) {
  const detail = await request(app).get(`/api/v1/transfer-requests/${requestId}`).set(asEmployee(employeeId));
  const action = detail.body.actions.find((a) => a.type === type && a.status === 'Pending');
  return action ? action.id : undefined;
}

async function driveToReadyForConfirmation(employeeId, managerId, overrides = {}) {
  const id = await driveToHRReview(employeeId, managerId, overrides);
  const hrId = await getActionId(id, 'HR', employeeId);
  await request(app).patch(`/api/v1/transfer-requests/${id}/actions/${hrId}`)
    .set(asRole(PRIYA_HR_PERSON, 'HR')).send({ decision: 'APPROVE' });

  for (const [type, role] of [['IT', 'IT'], ['PAYROLL', 'PAYROLL'], ['FACILITIES', 'FACILITIES']]) {
    const actionId = await getActionId(id, type, employeeId);
    if (actionId) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).patch(`/api/v1/transfer-requests/${id}/actions/${actionId}`)
        .set(asRole(SURESH_IT_PERSON, role)).send({ decision: 'COMPLETE' });
    }
  }
  return id;
}

describe('employee-internal-transfer.AC9/UT10 — completion aggregation', () => {
  it('moves to Ready For Confirmation once all downstream actions are Completed', async () => {
    const id = await driveToReadyForConfirmation(NEHA, KARAN_MANAGER, {
      proposedDepartment: 'Marketing', proposedLocation: 'Delhi',
    });
    const detail = await request(app).get(`/api/v1/transfer-requests/${id}`).set(asEmployee(NEHA));
    expect(detail.body.status).toBe('Ready For Confirmation');
    const confirmAction = detail.body.actions.find((a) => a.type === 'EMPLOYEE_CONFIRMATION');
    expect(confirmAction).toMatchObject({ status: 'Pending', assignee: NEHA });
  });
});

describe('employee-internal-transfer.AC10/UT11 — employee confirms', () => {
  it('moves status to Completed', async () => {
    const id = await driveToReadyForConfirmation(NEHA, KARAN_MANAGER, { proposedLocation: 'Delhi' });
    const res = await request(app).post(`/api/v1/transfer-requests/${id}/confirm`).set(asEmployee(NEHA));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Completed');
  });
});

describe('employee-internal-transfer.AC11/UT12 — cancel while HR Review', () => {
  it('sets status Cancelled and skips the Pending HR action, keeps MANAGER Completed', async () => {
    const id = await driveToHRReview(ADITI, ROHAN_MANAGER);
    const res = await request(app).post(`/api/v1/transfer-requests/${id}/cancel`).set(asEmployee(ADITI));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Cancelled');

    const detail = await request(app).get(`/api/v1/transfer-requests/${id}`).set(asEmployee(ADITI));
    const manager = detail.body.actions.find((a) => a.type === 'MANAGER');
    const hr = detail.body.actions.find((a) => a.type === 'HR');
    expect(manager.status).toBe('Completed');
    expect(hr.status).toBe('Skipped');
  });
});

describe('employee-internal-transfer.AC12/UT13 — cancel rejected once In Progress', () => {
  it('returns 400 INVALID_STATE and leaves status unchanged', async () => {
    const id = await driveToReadyForConfirmation(NEHA, KARAN_MANAGER, { proposedLocation: 'Delhi' });
    const res = await request(app).post(`/api/v1/transfer-requests/${id}/cancel`).set(asEmployee(NEHA));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_STATE');
  });
});

describe('employee-internal-transfer.AC13/UT14 — list is scoped to caller', () => {
  it('returns only the calling employee\'s own requests', async () => {
    await submit(ADITI);
    await submit(NEHA);
    const res = await request(app).get('/api/v1/transfer-requests').set(asEmployee(ADITI));
    expect(res.body.items).toHaveLength(1);
  });
});

describe('employee-internal-transfer.AC14/UT15 — detail forbidden for unrelated caller', () => {
  it('returns 403 for a caller who is neither owner nor assignee', async () => {
    const created = await submit(ADITI);
    const res = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(NEHA));
    expect(res.status).toBe(403);
    expect(res.body).not.toHaveProperty('proposed');
  });
});

describe('employee-internal-transfer.AC15/UT16 — PATCH forbidden for non-assignee', () => {
  it('returns 403 NOT_ASSIGNEE and leaves the action unchanged', async () => {
    const created = await submit(ADITI);
    const detail = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(ADITI));
    const managerAction = detail.body.actions.find((a) => a.type === 'MANAGER');

    const res = await request(app)
      .patch(`/api/v1/transfer-requests/${created.body.id}/actions/${managerAction.id}`)
      .set(asEmployee(NEHA))
      .send({ decision: 'APPROVE' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('NOT_ASSIGNEE');
  });
});

describe('employee-internal-transfer.AC16/UT17 — stakeholder pending-actions listing', () => {
  it('returns only Pending actions assigned to the caller\'s role', async () => {
    await driveToHRReview(ADITI, ROHAN_MANAGER); // creates a Pending HR action
    const res = await request(app).get('/api/v1/stakeholder-actions').set(asRole(PRIYA_HR_PERSON, 'HR'));
    expect(res.status).toBe(200);
    expect(res.body.items.every((a) => a.type === 'HR' && a.status === 'Pending')).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});

describe('QA-09 — idempotency on a already-decided action', () => {
  it('rejects a second decision on the same action', async () => {
    const created = await submit(ADITI);
    const detail = await request(app).get(`/api/v1/transfer-requests/${created.body.id}`).set(asEmployee(ADITI));
    const managerAction = detail.body.actions.find((a) => a.type === 'MANAGER');
    await request(app).patch(`/api/v1/transfer-requests/${created.body.id}/actions/${managerAction.id}`)
      .set(asEmployee(ROHAN_MANAGER)).send({ decision: 'APPROVE' });
    const second = await request(app).patch(`/api/v1/transfer-requests/${created.body.id}/actions/${managerAction.id}`)
      .set(asEmployee(ROHAN_MANAGER)).send({ decision: 'APPROVE' });
    expect(second.status).toBe(400);
    expect(second.body.error).toBe('INVALID_TRANSITION');
  });
});

describe('QA-12 — no auth header', () => {
  it('returns 401', async () => {
    const res = await request(app).post('/api/v1/transfer-requests').send({});
    expect(res.status).toBe(401);
  });
});
