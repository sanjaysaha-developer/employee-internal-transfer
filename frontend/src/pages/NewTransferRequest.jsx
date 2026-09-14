import React, { useState } from 'react';
import { api } from '../api.js';

// employee-internal-transfer.T07 — client-side mirrors AC2/AC3, but the
// backend remains the source of truth (constitution.md: never trust client
// validation alone).
const MIN_NOTICE_DAYS = 14;

function minEffectiveDate() {
  const d = new Date();
  d.setDate(d.getDate() + MIN_NOTICE_DAYS);
  return d.toISOString().slice(0, 10);
}

export default function NewTransferRequest({ employeeId }) {
  const [form, setForm] = useState({
    proposedDepartment: '', proposedLocation: '', proposedRole: '', effectiveDate: '', reason: '',
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function validateClientSide() {
    const fields = {};
    if (!form.proposedDepartment.trim()) fields.proposedDepartment = 'required';
    if (!form.proposedLocation.trim()) fields.proposedLocation = 'required';
    if (!form.proposedRole.trim()) fields.proposedRole = 'required';
    if (!form.effectiveDate) {
      fields.effectiveDate = 'required';
    } else if (form.effectiveDate < minEffectiveDate()) {
      fields.effectiveDate = `must be at least ${MIN_NOTICE_DAYS} days out`;
    }
    return fields;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    const clientErrors = validateClientSide();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await api.submitTransferRequest(employeeId, {
        ...form,
        reason: form.reason || null,
      });
      setResult({ ok: true, data: res });
      setForm({ proposedDepartment: '', proposedLocation: '', proposedRole: '', effectiveDate: '', reason: '' });
    } catch (err) {
      if (err.status === 400 && err.body && err.body.fields) {
        setErrors(err.body.fields);
      } else {
        setResult({ ok: false, message: `${err.message}${err.body && err.body.activeRequestId ? ` (active request: ${err.body.activeRequestId})` : ''}` });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h3>New Transfer Request</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
        <Field label="Proposed Department" name="proposedDepartment" form={form} setForm={setForm} errors={errors} />
        <Field label="Proposed Location" name="proposedLocation" form={form} setForm={setForm} errors={errors} />
        <Field label="Proposed Role" name="proposedRole" form={form} setForm={setForm} errors={errors} />
        <Field label="Effective Date" name="effectiveDate" type="date" form={form} setForm={setForm} errors={errors} min={minEffectiveDate()} />
        <div>
          <label>Reason (optional)</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            style={{ width: '100%', minHeight: 60 }}
          />
        </div>
        <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
      </form>

      {result && result.ok && (
        <p style={{ color: 'green', marginTop: 12 }}>
          Submitted. Request id: <code>{result.data.id}</code>, status: {result.data.status}
        </p>
      )}
      {result && !result.ok && <p style={{ color: 'crimson', marginTop: 12 }}>{result.message}</p>}
    </div>
  );
}

function Field({ label, name, form, setForm, errors, type = 'text', min }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        min={min}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        style={{ width: '100%', padding: 6 }}
      />
      {errors[name] && <div style={{ color: 'crimson', fontSize: 13 }}>{errors[name]}</div>}
    </div>
  );
}
