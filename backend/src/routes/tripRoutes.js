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
    const { title, slug, fort, duration, pricePerPerson, startDate, endDate } = req.body;
    if (!title || !slug || !fort || !duration || !pricePerPerson || !startDate || !endDate) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    const exists = await Trip.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug already exists' });
    const trip = await Trip.create(req.body);
    const populated = await Trip.findById(trip._id).populate(populateFort);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      populateFort
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
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
