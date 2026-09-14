const express = require('express');
const service = require('../services/transferService');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// employee-internal-transfer.API01
router.post('/transfer-requests', asyncHandler(async (req, res) => {
  const result = await service.createTransferRequest(req.employeeId, req.body || {});
  res.status(201).json(result);
}));

// employee-internal-transfer.API03 (must be registered before /:id routes
// only matters if id could collide with a literal path segment — it can't
// here since this is its own path, kept first for readability)
router.get('/transfer-requests', asyncHandler(async (req, res) => {
  const items = await service.listTransferRequestsForEmployee(req.employeeId);
  res.status(200).json({ items });
}));

// employee-internal-transfer.API02
router.get('/transfer-requests/:id', asyncHandler(async (req, res) => {
  const result = await service.getTransferRequestDetail(req.params.id, req.employeeId, req.actorRole);
  res.status(200).json(result);
}));

// employee-internal-transfer.API04
router.patch('/transfer-requests/:id/actions/:actionId', asyncHandler(async (req, res) => {
  const { decision, notes } = req.body || {};
  const result = await service.decideAction(
    req.params.id, req.params.actionId, req.employeeId, req.actorRole, decision, notes,
  );
  res.status(200).json(result);
}));

// employee-internal-transfer.API05
router.post('/transfer-requests/:id/confirm', asyncHandler(async (req, res) => {
  const result = await service.confirmRequest(req.params.id, req.employeeId);
  res.status(200).json(result);
}));

// employee-internal-transfer.API06
router.post('/transfer-requests/:id/cancel', asyncHandler(async (req, res) => {
  const result = await service.cancelRequest(req.params.id, req.employeeId);
  res.status(200).json(result);
}));

// employee-internal-transfer.API07
router.get('/stakeholder-actions', asyncHandler(async (req, res) => {
  const items = await service.listPendingActionsForActor(req.employeeId, req.actorRole);
  res.status(200).json({ items });
}));

module.exports = router;
