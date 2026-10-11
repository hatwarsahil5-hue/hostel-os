const express = require('express');
const Notice  = require('../models/Notice');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ── GET /api/notices ──────────────────────────────────────────────────────────
// All authenticated users can read notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/notices ─────────────────────────────────────────────────────────
// Warden only
router.post('/', restrictTo('warden'), async (req, res) => {
  try {
    const { title, body, type } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }
    const notice = await Notice.create({ postedBy: req.user._id, title, body, type: type || 'normal' });
    await notice.populate('postedBy', 'name');
    res.status(201).json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/notices/:id ───────────────────────────────────────────────────
// Warden only
router.delete('/:id', restrictTo('warden'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
