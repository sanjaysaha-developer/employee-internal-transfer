import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Separate from vite.config.js (which stays dev/build-only, per T11) so the
// test runner's jsdom environment and setup file never leak into the dev
// server or production build config.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: false,
  },
});
