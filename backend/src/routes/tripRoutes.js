const express = require('express');
const Trip = require('../models/Trip');
const { protect, adminOnly, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

const populateFort = { path: 'fort', select: 'name slug location images' };

const listAllTripsAdmin = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate(populateFort)
      .sort({ featuredOrder: 1, startDate: 1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

router.get('/admin/all', protect, adminOnly, listAllTripsAdmin);

router.get('/', optionalProtect, async (req, res) => {
  try {
    if (req.query.all === 'true') {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access only' });
      }
      return listAllTripsAdmin(req, res);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const filter = { isPublished: true, endDate: { $gte: now } };
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.type) filter.tripType = req.query.type;
    const trips = await Trip.find(filter)
      .populate(populateFort)
      .sort({ featuredOrder: 1, startDate: 1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const trip = await Trip.findOne({
      slug: req.params.slug,
      isPublished: true,
      endDate: { $gte: now }
    }).populate(populateFort);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = buildTripPayload(req.body);
    const { title, slug, fort, duration, pricePerPerson, startDate, endDate } = payload;
    if (!title || !slug || !fort || !duration || !pricePerPerson || !startDate || !endDate) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    const exists = await Trip.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug already exists' });
    const trip = await Trip.create(payload);
    const populated = await Trip.findById(trip._id).populate(populateFort);
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

const parseOriginalPrice = (value) => {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const buildTripPayload = (body) => {
  const payload = {};
  const assign = (key, transform = (v) => v) => {
    if (body[key] !== undefined) payload[key] = transform(body[key]);
  };

  assign('title', (v) => String(v).trim());
  assign('slug', (v) => String(v).trim().toLowerCase());
  assign('fort');
  assign('tripType');
  assign('duration', (v) => String(v).trim());
  assign('pricePerPerson', (v) => Number(v));
  assign('originalPrice', parseOriginalPrice);
  assign('seatsAvailable', (v) => Number(v));
  assign('startDate');
  assign('endDate');
  assign('description', (v) => String(v).trim());
  assign('highlights', (v) => (Array.isArray(v) ? v : []));
  assign('coverImage', (v) => String(v || '').trim());
  assign('isPublished', (v) => !!v);
  assign('isFeatured', (v) => !!v);
  assign('featuredOrder', (v) => Number(v) || 0);

  return payload;
};

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const payload = buildTripPayload(req.body);
    const update = {};

    if (Object.keys(payload).length > 0) {
      update.$set = payload;
    }

    if (req.body.originalPrice === '' || req.body.originalPrice === null) {
      update.$unset = { originalPrice: 1 };
      if (update.$set?.originalPrice !== undefined) {
        delete update.$set.originalPrice;
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    if (payload.slug) {
      const conflict = await Trip.findOne({
        slug: payload.slug,
        _id: { $ne: req.params.id },
      });
      if (conflict) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    const trip = await Trip.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
      overwrite: false,
    }).populate(populateFort);

    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
