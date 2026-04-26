const express = require('express');
const asyncHandler = require('express-async-handler');
const Vendor = require('../models/Vendor');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: list vendors for a fort (optionally by serviceType)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { fortId, serviceType } = req.query;
    const filter = {};
    if (fortId) filter.fort = fortId;
    if (serviceType) filter.serviceType = serviceType;
    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    res.json(vendors);
  })
);

// Admin: create vendor
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const vendor = await Vendor.create(req.body);
    res.status(201).json(vendor);
  })
);

// Admin: update vendor
router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  })
);

// Admin: delete vendor
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ message: 'Vendor removed' });
  })
);

module.exports = router;

