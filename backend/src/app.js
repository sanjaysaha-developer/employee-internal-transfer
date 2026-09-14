const express = require('express');
const cors = require('cors');
const { auth } = require('./middleware/auth');
const transferRequestsRouter = require('./routes/transferRequests');
const { ServiceError } = require('./services/transferService');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.status(200).json({ ok: true }));

  app.use('/api/v1', auth, transferRequestsRouter);

  // Centralised error mapping — no PII/stack traces leak into responses
  // (constitution.md Security Posture); full error is logged server-side only,
  // and never includes request bodies (which could carry a `reason` field).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ServiceError) {
      return res.status(err.status).json(err.body);
    }
    // eslint-disable-next-line no-console
    console.error('[unhandled]', err.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  });

  return app;
}

module.exports = { createApp };

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 5002;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`employee-internal-transfer backend listening on :${port}`);
  });
}
