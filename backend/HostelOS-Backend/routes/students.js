const express    = require('express');
const User       = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── GET /api/students ─────────────────────────────────────────────────────────
// Warden only — list all students
router.get('/', restrictTo('warden'), async (req, res) => {
  try {
    const { search, block } = req.query;
    const filter = { role: 'student' };

    if (block) filter.block = block;
    if (search) {
      filter.$or = [
        { name:   { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email:  { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/students/stats ───────────────────────────────────────────────────
// Warden only — dashboard stats
router.get('/stats', restrictTo('warden'), async (req, res) => {
  try {
    const total   = await User.countDocuments({ role: 'student' });
    const blockA  = await User.countDocuments({ role: 'student', block: 'A' });
    const blockB  = await User.countDocuments({ role: 'student', block: 'B' });
    res.status(200).json({ success: true, data: { total, blockA, blockB } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/students/:id ─────────────────────────────────────────────────────
// Warden sees any student; student sees only their own profile
router.get('/:id', async (req, res) => {
  try {
    if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/students/:id ───────────────────────────────────────────────────
// Warden only — update student details (room, block, etc.)
router.patch('/:id', restrictTo('warden'), async (req, res) => {
  try {
    const allowed = ['name', 'rollNo', 'department', 'batch', 'roomNumber', 'block', 'phone', 'isActive'];
    const updates = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      updates,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
