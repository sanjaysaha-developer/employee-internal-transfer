// T11 (v1.3/v1.4 delta) — one-time Vitest setup: wires jest-dom's matchers
// (toBeInTheDocument, etc.) into Vitest's expect, and resets the jsdom DOM
// between tests so one test's rendered output can't leak into the next.
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});
