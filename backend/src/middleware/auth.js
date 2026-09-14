// Stub authentication — see ADR-0002. Trusts the x-employee-id header as the
// authenticated identity and the optional x-actor-role header as a claimed
// team role (HR|PAYROLL|IT|FACILITIES). This is a documented, top-ranked
// pre-production risk (assessment/08-security-assessment.md) — replacing this
// file with real SSO/OAuth2 verification is the only change needed; every
// authorization check downstream of req.employeeId/req.actorRole stays as-is.
const ACTOR_ROLES = ['HR', 'PAYROLL', 'IT', 'FACILITIES'];

function auth(req, res, next) {
  const employeeId = req.header('x-employee-id');
  if (!employeeId) {
    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  }
  const actorRole = req.header('x-actor-role') || null;
  if (actorRole && !ACTOR_ROLES.includes(actorRole)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', fields: { 'x-actor-role': 'unknown role' } });
  }
  req.employeeId = employeeId;
  req.actorRole = actorRole;
  return next();
}

module.exports = { auth, ACTOR_ROLES };
