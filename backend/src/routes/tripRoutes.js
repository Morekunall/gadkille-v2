const express = require('express');
const Trip = require('../models/Trip');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = req.query.type ? { tripType: req.query.type } : {};
    const trips = await Trip.find(filter).populate('fort', 'name slug location').sort({ startDate: 1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const trip = await Trip.findOne({ slug: req.params.slug }).populate('fort', 'name slug location images');
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
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
