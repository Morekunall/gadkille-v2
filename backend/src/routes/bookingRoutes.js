const express = require('express');
const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a booking (stay / guide / vehicle)
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { fortId, tripId, bookingType, date, details } = req.body;
    if (!fortId || !bookingType || !date) {
      return res.status(400).json({ message: 'fortId, bookingType and date are required' });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      fortId,
      tripId: tripId || null,
      bookingType,
      date,
      requestStatus: 'pending',
      paymentStatus: 'pending',
      details: details || {}
    });

    res.status(201).json(booking);
  })
);

// @route   PUT /api/bookings/:id/status
// @desc    Admin: accept/reject booking request
router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { requestStatus } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(requestStatus)) {
      return res.status(400).json({ message: 'Invalid requestStatus' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { requestStatus },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('fortId', 'name location slug');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  })
);

// @route   GET /api/bookings/my
// @desc    Get logged-in user bookings
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('fortId', 'name location slug')
      .sort({ createdAt: -1 });
    res.json(bookings);
  })
);

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking (user can cancel own, admin can cancel any)
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to cancel this booking' });
    }

    booking.paymentStatus = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  })
);

// Admin: list all bookings
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('fortId', 'name location slug')
      .sort({ createdAt: -1 });
    res.json(bookings);
  })
);

module.exports = router;

