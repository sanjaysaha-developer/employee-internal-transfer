// Thin API client. Identity is the stub-auth headers (ADR-0002) — this is a
// dev-only "log in as" mechanism, not a real session.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api/v1';

async function call(path, { method = 'GET', employeeId, actorRole, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (employeeId) headers['x-employee-id'] = employeeId;
  if (actorRole) headers['x-actor-role'] = actorRole;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data && data.error ? data.error : `HTTP ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const api = {
  submitTransferRequest: (employeeId, payload) => call('/transfer-requests', { method: 'POST', employeeId, body: payload }),
  listMyTransferRequests: (employeeId) => call('/transfer-requests', { employeeId }),
  getTransferRequest: (employeeId, id) => call(`/transfer-requests/${id}`, { employeeId }),
  confirmTransferRequest: (employeeId, id) => call(`/transfer-requests/${id}/confirm`, { method: 'POST', employeeId }),
  cancelTransferRequest: (employeeId, id) => call(`/transfer-requests/${id}/cancel`, { method: 'POST', employeeId }),
  listMyPendingActions: (employeeId, actorRole) => call('/stakeholder-actions', { employeeId, actorRole }),
  decideAction: (employeeId, actorRole, requestId, actionId, decision, notes) => call(
    `/transfer-requests/${requestId}/actions/${actionId}`,
    { method: 'PATCH', employeeId, actorRole, body: { decision, notes } },
  ),
};
