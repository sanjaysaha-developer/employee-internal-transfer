import React, { useState } from 'react';
import NewTransferRequest from './pages/NewTransferRequest.jsx';
import MyTransferRequests from './pages/MyTransferRequests.jsx';
import StakeholderInbox from './pages/StakeholderInbox.jsx';

const SEEDED_EMPLOYEES = [
  { id: 'EMP1001', label: 'EMP1001 — Aditi Sharma (Engineering, Bengaluru)' },
  { id: 'EMP1002', label: 'EMP1002 — Rohan Verma (Engineering Manager)' },
  { id: 'EMP1003', label: 'EMP1003 — Neha Gupta (Sales, Mumbai)' },
  { id: 'EMP1004', label: 'EMP1004 — Karan Mehta (Sales Manager)' },
  { id: 'EMP1005', label: 'EMP1005 — Priya Nair (HR)' },
  { id: 'EMP1006', label: 'EMP1006 — Suresh Iyer (IT)' },
];
const TABS = ['New Transfer Request', 'My Transfer Requests', 'Stakeholder Inbox'];

export default function App() {
  const [employeeId, setEmployeeId] = useState('EMP1001');
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 4 }}>One-Point Employee Portal</h1>
      <h2 style={{ marginTop: 0, fontWeight: 400, color: '#555' }}>Employee Internal Transfer</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, padding: 12, background: '#f3f4f6', borderRadius: 8 }}>
        <label htmlFor="employee-select">Logged in as (dev stub — see ADR-0002):</label>
        <select id="employee-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          {SEEDED_EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>

      <nav style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #ddd' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'New Transfer Request' && <NewTransferRequest employeeId={employeeId} />}
      {tab === 'My Transfer Requests' && <MyTransferRequests employeeId={employeeId} />}
      {tab === 'Stakeholder Inbox' && <StakeholderInbox employeeId={employeeId} />}
    </div>
  );
}
