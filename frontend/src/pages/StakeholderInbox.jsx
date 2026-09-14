import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

// employee-internal-transfer.T09 — minimal shared inbox for Manager/HR/
// Payroll/IT/Facilities actors (API07 + API04). Not a full per-team portal —
// plan.md's Explicitly Deferred — just enough to demo/exercise the backend.
const TEAM_ROLES = ['HR', 'PAYROLL', 'IT', 'FACILITIES'];
const DECISIONS_BY_TYPE = {
  MANAGER: ['APPROVE', 'REJECT'],
  HR: ['APPROVE', 'REJECT'],
  PAYROLL: ['COMPLETE'],
  IT: ['COMPLETE'],
  FACILITIES: ['COMPLETE'],
};

export default function StakeholderInbox({ employeeId }) {
  const [actAsRole, setActAsRole] = useState(''); // '' = acting as MANAGER (self, via employeeId)
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState(null);

  async function refresh() {
    const res = await api.listMyPendingActions(employeeId, actAsRole || undefined);
    setItems(res.items);
  }

  // AC17 (v1.3) — reset "Acting as" to "Myself" whenever the logged-in
  // employee changes, so a previously-selected team queue (e.g. PAYROLL)
  // never silently carries over under a new identity. Tracked via a ref
  // (not just a second useEffect on [employeeId]) so the identity-change
  // and role-reset happen in the *same* effect run as the refresh: two
  // separate effects both depending on employeeId would each fire once
  // with this render's still-stale actAsRole before the reset takes effect,
  // firing one avoidable fetch for the new employee under the old role
  // first — the same stale-identity leak AC17 exists to prevent, just
  // moved into the network call instead of the UI. Frontend-only; does not
  // touch API07's contract (AC16 is unaffected).
  const prevEmployeeIdRef = useRef(employeeId);
  useEffect(() => {
    if (prevEmployeeIdRef.current !== employeeId) {
      prevEmployeeIdRef.current = employeeId;
      if (actAsRole !== '') {
        setActAsRole(''); // re-triggers this effect with actAsRole=''; skip fetching now
        return;
      }
    }
    refresh();
  }, [employeeId, actAsRole]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(item, decision) {
    setMessage(null);
    try {
      await api.decideAction(employeeId, actAsRole || undefined, item.transferRequestId, item.id, decision, notes[item.id]);
      setMessage({ ok: true, text: `${item.type} action ${decision.toLowerCase()}d.` });
      await refresh();
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  return (
    <div>
      <h3>Stakeholder Inbox</h3>
      <p style={{ color: '#666' }}>
        Pending work items assigned to you — as yourself (Manager/Employee-Confirmation
        items) or acting as a team role (HR/Payroll/IT/Facilities), per API07.
      </p>
      <div style={{ marginBottom: 16 }}>
        <label>Acting as: </label>
        <select value={actAsRole} onChange={(e) => setActAsRole(e.target.value)}>
          <option value="">Myself ({employeeId}) — e.g. Manager</option>
          {TEAM_ROLES.map((r) => <option key={r} value={r}>{r} team</option>)}
        </select>
      </div>

      {items.length === 0 && <p style={{ color: '#666' }}>No pending items.</p>}
      {items.map((item) => (
        <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, marginBottom: 10 }}>
          <div><strong>{item.type}</strong> — request <code>{item.transferRequestId}</code></div>
          <div style={{ fontSize: 13, color: '#555' }}>Created {new Date(item.createdAt).toLocaleString()}</div>
          <input
            placeholder="notes (optional)"
            value={notes[item.id] || ''}
            onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
            style={{ width: '100%', margin: '8px 0', padding: 4 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {(DECISIONS_BY_TYPE[item.type] || []).map((d) => (
              <button key={d} onClick={() => act(item, d)}>{d}</button>
            ))}
          </div>
        </div>
      ))}
      {message && <p style={{ color: message.ok ? 'green' : 'crimson' }}>{message.text}</p>}
    </div>
  );
}
