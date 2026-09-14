// Applies every .sql file in src/migrations, in filename order. Idempotent —
// migrations use IF NOT EXISTS / ON CONFLICT DO NOTHING, so this is safe to
// run on every container start (employee-internal-transfer.T10).
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`[migrate] applying ${file}`);
    await pool.query(sql);
  }
}

if (require.main === module) {
  migrate()
    .then(async () => {
      // eslint-disable-next-line no-console
      console.log('[migrate] done');
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      // eslint-disable-next-line no-console
      console.error('[migrate] failed', err);
      await pool.end();
      process.exit(1);
    });
}

module.exports = { migrate };
