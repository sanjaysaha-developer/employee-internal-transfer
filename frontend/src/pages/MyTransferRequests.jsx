import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

// employee-internal-transfer.T08 — list (API03) + detail/timeline (API02) +
// confirm (API05) / cancel (API06).
const CANCELLABLE = ['Submitted', 'HR Review'];

export default function MyTransferRequests({ employeeId }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);

  async function refreshList() {
    const res = await api.listMyTransferRequests(employeeId);
    setItems(res.items);
  }
  async function refreshDetail(id) {
    const res = await api.getTransferRequest(employeeId, id);
    setDetail(res);
  }

  useEffect(() => { setSelectedId(null); setDetail(null); refreshList(); }, [employeeId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (selectedId) refreshDetail(selectedId); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConfirm() {
    setError(null);
    try {
      await api.confirmTransferRequest(employeeId, selectedId);
      await Promise.all([refreshList(), refreshDetail(selectedId)]);
    } catch (err) { setError(err.message); }
  }
  async function handleCancel() {
    setError(null);
    try {
      await api.cancelTransferRequest(employeeId, selectedId);
      await Promise.all([refreshList(), refreshDetail(selectedId)]);
    } catch (err) { setError(err.message); }
  }

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: '0 0 280px' }}>
        <h3>My Transfer Requests</h3>
        {items.length === 0 && <p style={{ color: '#666' }}>No requests yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((it) => (
            <li key={it.id} style={{ marginBottom: 8 }}>
              <button
                onClick={() => setSelectedId(it.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: 8,
                  background: selectedId === it.id ? '#e0e7ff' : '#f9fafb',
                  border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer',
                }}
              >
                <div><strong>{it.proposedDepartment} / {it.proposedRole}</strong></div>
                <div style={{ fontSize: 13, color: '#555' }}>{it.status} · eff. {it.effectiveDate}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }}>
        {!detail && <p style={{ color: '#666' }}>Select a request to see its status timeline.</p>}
        {detail && (
          <div>
            <h3>Status: {detail.status}</h3>
            <p>
              {detail.current.department} / {detail.current.location} / {detail.current.role}
              {' → '}
              {detail.proposed.department} / {detail.proposed.location} / {detail.proposed.role}
            </p>
            <p>Effective: {detail.effectiveDate}{detail.reason ? ` — "${detail.reason}"` : ''}</p>

            <h4>Stakeholder Actions</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={th}>Type</th><th style={th}>Status</th><th style={th}>Notes</th><th style={th}>Completed</th></tr>
              </thead>
              <tbody>
                {detail.actions.map((a) => (
                  <tr key={a.id}>
                    <td style={td}>{a.type}</td>
                    <td style={td}>{a.status}</td>
                    <td style={td}>{a.notes || '—'}</td>
                    <td style={td}>{a.completedAt ? new Date(a.completedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              {detail.status === 'Ready For Confirmation' && (
                <button onClick={handleConfirm}>Confirm — this is complete and correct</button>
              )}
              {CANCELLABLE.includes(detail.status) && (
                <button onClick={handleCancel}>Cancel Request</button>
              )}
            </div>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const th = { textAlign: 'left', borderBottom: '2px solid #ddd', padding: 6 };
const td = { borderBottom: '1px solid #eee', padding: 6 };
