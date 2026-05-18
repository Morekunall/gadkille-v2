const asyncHandler = require('express-async-handler');
const Inquiry = require('../models/Inquiry');

const createInquiry = asyncHandler(async (req, res) => {
  const {
    category,
    tripType,
    name,
    phone,
    email,
    location,
    preferredDate,
    groupSize,
    organization,
    purpose,
    subject,
    message
  } = req.body;

  if (!category || !name || !phone || !email) {
    return res.status(400).json({ message: 'category, name, phone and email are required' });
  }

  if (!['plan_trip', 'group_tour', 'contact'].includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  if (category === 'plan_trip' && !location) {
    return res.status(400).json({ message: 'Location is required for plan trip' });
  }

  const inquiry = await Inquiry.create({
    category,
    tripType,
    name,
    phone,
    email,
    location,
    preferredDate: preferredDate || null,
    groupSize,
    organization,
    purpose,
    subject,
    message
  });

  res.status(201).json(inquiry);
});

const listInquiries = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(inquiries);
});

module.exports = {
  createInquiry,
  listInquiries
};
