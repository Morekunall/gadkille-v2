const express = require('express');
const mongoose = require('mongoose');
const Fort = require('../models/Fort');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  MAHARASHTRA_DISTRICTS,
  extractDistrictFromLocation,
  buildDistrictFilter,
} = require('../utils/fortDistrict');

const router = express.Router();

const FORT_LIST_FIELDS = 'name slug location description images district';

const requireFortId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid fort id' });
  }
  next();
};

const buildFortFilter = ({ q, district }) => {
  const clauses = [];

  if (q) {
    const regex = { $regex: q, $options: 'i' };
    clauses.push({ $or: [{ name: regex }, { location: regex }, { description: regex }] });
  }

  if (district && district !== 'all') {
    if (district === 'Other') {
      const knownPattern = MAHARASHTRA_DISTRICTS.join('|');
      clauses.push({ location: { $not: { $regex: knownPattern, $options: 'i' } } });
    } else {
      const districtFilter = buildDistrictFilter(district);
      if (districtFilter) clauses.push(districtFilter);
    }
  }

  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
};

// @route   GET /api/forts/meta/districts
// @desc    District counts for filter chips
router.get('/meta/districts', async (req, res) => {
  try {
    const forts = await Fort.find({}).select('location district').lean();
    const counts = {};

    for (const fort of forts) {
      const key =
        fort.district?.trim() || extractDistrictFromLocation(fort.location || '');
      counts[key] = (counts[key] || 0) + 1;
    }

    const districts = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    res.json({ total: forts.length, districts });
  } catch (error) {
    console.error('Get fort districts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/forts
// @desc    List forts — paginated when ?page= is set, full list otherwise (admin/dropdowns)
router.get('/', async (req, res) => {
  try {
    const { q, district, page } = req.query;
    const filter = buildFortFilter({ q, district });

    if (page) {
      const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48);
      const pageNum = Math.max(Number(page) || 1, 1);
      const skip = (pageNum - 1) * limit;

      const [items, total] = await Promise.all([
        Fort.find(filter)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .select(FORT_LIST_FIELDS),
        Fort.countDocuments(filter),
      ]);

      return res.json({
        items,
        total,
        page: pageNum,
        pages: Math.max(Math.ceil(total / limit), 1),
        limit,
      });
    }

    const forts = await Fort.find(filter).sort({ name: 1 });
    res.json(forts);
  } catch (error) {
    console.error('Get forts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin CRUD (register before GET /:slug)

// @route   POST /api/forts
// @desc    Create fort
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, slug, location } = req.body;
    if (!name || !slug || !location) {
      return res.status(400).json({ message: 'Name, slug and location are required' });
    }
    const exists = await Fort.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: 'Slug already in use' });
    }
    const payload = { ...req.body };
    if (!payload.district?.trim()) {
      payload.district = extractDistrictFromLocation(payload.location || '');
    }
    const fort = await Fort.create(payload);
    res.status(201).json(fort);
  } catch (error) {
    console.error('Create fort error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/forts/:id
// @desc    Update fort
router.put('/:id', protect, adminOnly, requireFortId, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.location && !payload.district?.trim()) {
      payload.district = extractDistrictFromLocation(payload.location);
    }
    const fort = await Fort.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!fort) return res.status(404).json({ message: 'Fort not found' });
    res.json(fort);
  } catch (error) {
    console.error('Update fort error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/forts/:id
// @desc    Delete fort
router.delete('/:id', protect, adminOnly, requireFortId, async (req, res) => {
  try {
    const fort = await Fort.findByIdAndDelete(req.params.id);
    if (!fort) return res.status(404).json({ message: 'Fort not found' });
    res.json({ message: 'Fort deleted', id: fort._id });
  } catch (error) {
    console.error('Delete fort error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/forts/:slug
// @desc    Get single fort by slug
router.get('/:slug', async (req, res) => {
  try {
    const fort = await Fort.findOne({ slug: req.params.slug });
    if (!fort) return res.status(404).json({ message: 'Fort not found' });
    res.json(fort);
  } catch (error) {
    console.error('Get fort error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

