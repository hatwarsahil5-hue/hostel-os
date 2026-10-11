const express = require('express');
const Leave   = require('../models/Leave');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ── GET /api/leaves ───────────────────────────────────────────────────────────
// Warden: all leaves | Student: their own
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user._id } : {};
    if (req.query.status) filter.status = req.query.status;

    const leaves = await Leave.find(filter)
      .populate('student', 'name rollNo roomNumber block')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/leaves ──────────────────────────────────────────────────────────
// Student only
router.post('/', restrictTo('student'), async (req, res) => {
  try {
    const { type, fromDate, toDate, reason, parentContact } = req.body;
    if (!type || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: 'type, fromDate, toDate and reason are required' });
    }
    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ success: false, message: 'fromDate must be before toDate' });
    }
    const leave = await Leave.create({
      student: req.user._id,
      type, fromDate, toDate, reason, parentContact,
    });
    await leave.populate('student', 'name rollNo roomNumber block');
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/leaves/:id/status ─────────────────────────────────────────────
// Warden only — approve or reject
router.patch('/:id/status', restrictTo('warden'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'Approved' or 'Rejected'" });
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user._id },
      { new: true }
    )
      .populate('student', 'name rollNo roomNumber block')
      .populate('approvedBy', 'name');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
