const express = require('express');
const asyncHandler = require('express-async-handler');
const History = require('../models/History');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/history
// @desc    Get all active history videos
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const histories = await History.find({ isActive: true })
      .populate('fort', 'name slug images')
      .sort('-createdAt');
    res.json(histories);
  })
);

// @route   GET /api/history/:id
// @desc    Get single history video
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const history = await History.findById(req.params.id).populate('fort', 'name slug images');
    if (!history) {
      return res.status(404).json({ message: 'History not found' });
    }
    res.json(history);
  })
);

// @route   GET /api/history/fort/:fortId
// @desc    Get all history videos for a specific fort
// @access  Public
router.get(
  '/fort/:fortId',
  asyncHandler(async (req, res) => {
    const histories = await History.find({ fort: req.params.fortId, isActive: true }).sort(
      '-createdAt'
    );
    res.json(histories);
  })
);

// @route   POST /api/history
// @desc    Create a new history video
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { fort, title, description, videoUrl, thumbnail, duration } = req.body;

    if (!fort || !title || !description || !videoUrl) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const history = new History({
      fort,
      title,
      description,
      videoUrl,
      thumbnail,
      duration,
      isActive: true
    });

    const saved = await history.save();
    const populated = await saved.populate('fort', 'name slug images');
    res.status(201).json(populated);
  })
);

// @route   PUT /api/history/:id
// @desc    Update a history video
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { fort, title, description, videoUrl, thumbnail, duration, isActive } = req.body;

    let history = await History.findById(req.params.id);
    if (!history) {
      return res.status(404).json({ message: 'History not found' });
    }

    if (fort) history.fort = fort;
    if (title) history.title = title;
    if (description) history.description = description;
    if (videoUrl) history.videoUrl = videoUrl;
    if (thumbnail) history.thumbnail = thumbnail;
    if (duration) history.duration = duration;
    if (isActive !== undefined) history.isActive = isActive;

    const updated = await history.save();
    const populated = await updated.populate('fort', 'name slug images');
    res.json(populated);
  })
);

// @route   DELETE /api/history/:id
// @desc    Delete a history video
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const history = await History.findByIdAndDelete(req.params.id);
    if (!history) {
      return res.status(404).json({ message: 'History not found' });
    }
    res.json({ message: 'History deleted successfully' });
  })
);

module.exports = router;
