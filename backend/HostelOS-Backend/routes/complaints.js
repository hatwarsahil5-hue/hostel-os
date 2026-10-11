const express   = require('express');
const Complaint = require('../models/Complaint');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ── GET /api/complaints ───────────────────────────────────────────────────────
// Warden: all complaints | Student: only their own
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user._id } : {};
    const complaints = await Complaint.find(filter)
      .populate('student', 'name rollNo roomNumber block')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/complaints ──────────────────────────────────────────────────────
// Student only — raise a complaint
router.post('/', restrictTo('student'), async (req, res) => {
  try {
    const { category, subject, description, priority } = req.body;
    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, message: 'category, subject and description are required' });
    }
    const complaint = await Complaint.create({
      student: req.user._id,
      category, subject, description,
      priority: priority || 'Normal',
    });
    await complaint.populate('student', 'name rollNo roomNumber block');
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/complaints/:id/status ─────────────────────────────────────────
// Warden only — update status (In Progress / Resolved)
router.patch('/:id/status', restrictTo('warden'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const update = { status };
    if (status === 'Resolved') update.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('student', 'name rollNo roomNumber block');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/complaints/:id ────────────────────────────────────────────────
// Student can delete their own Pending complaint
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'student') {
      if (complaint.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (complaint.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Can only delete a Pending complaint' });
      }
    }
    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
