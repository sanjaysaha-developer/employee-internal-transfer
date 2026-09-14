// employee-internal-transfer.AC17/UT18 — T14 (v1.3 delta). Vitest + React
// Testing Library (constitution.md Testing rules — "anything with real
// logic"). Mocks api.js so this is a pure frontend unit test; API07's
// contract itself is unaffected (AC17 note in the spec).
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StakeholderInbox from '../../src/pages/StakeholderInbox.jsx';
import { api } from '../../src/api.js';

vi.mock('../../src/api.js', () => ({
  api: {
    listMyPendingActions: vi.fn(),
    decideAction: vi.fn(),
  },
}));

beforeEach(() => {
  api.listMyPendingActions.mockReset();
  api.listMyPendingActions.mockResolvedValue({ items: [] });
});

describe('employee-internal-transfer.AC17/UT18 — "Acting as" resets when "Logged in as" changes', () => {
  it('resets the Acting as selector to Myself when the employeeId prop changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<StakeholderInbox employeeId="EMP1005" />);

    // Pick "Acting as: PAYROLL team" while logged in as EMP1005 (HR person).
    // Queried by role, not label text: the "Acting as" <label> isn't
    // programmatically associated with the <select> (no htmlFor/wrapping)
    // in the current markup, and this AC doesn't ask us to change that.
    await user.selectOptions(screen.getByRole('combobox'), 'PAYROLL');
    expect(screen.getByRole('combobox')).toHaveValue('PAYROLL');

    // Simulate switching "Logged in as" in App.jsx — StakeholderInbox only
    // gets a new employeeId prop, it does not unmount.
    rerender(<StakeholderInbox employeeId="EMP1006" />);

    // AC17: must not silently keep showing the previous employee's chosen
    // team-role queue — it should reset to "Myself" (value '').
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('reloads the pending-items list for the new identity as itself, not the stale role', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<StakeholderInbox employeeId="EMP1005" />);
    await user.selectOptions(screen.getByRole('combobox'), 'PAYROLL');

    api.listMyPendingActions.mockClear();
    rerender(<StakeholderInbox employeeId="EMP1006" />);

    // AC16 or AC17 is not affected: refresh() must be called for the new
    // employeeId with actorRole undefined (acting as "Myself"), not 'PAYROLL'
    // — and exactly once, not once with the stale role first (see the
    // ref-guard comment in StakeholderInbox.jsx for why that matters).
    expect(api.listMyPendingActions).toHaveBeenCalledTimes(1);
    expect(api.listMyPendingActions).toHaveBeenCalledWith('EMP1006', undefined);
  });
});
