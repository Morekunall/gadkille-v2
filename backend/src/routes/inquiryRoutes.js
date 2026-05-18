const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createInquiry, listInquiries } = require('../controllers/inquiryController');

const router = express.Router();

// Public create endpoints
router.post('/', createInquiry);

// Admin list endpoint
router.get('/', protect, adminOnly, listInquiries);

module.exports = router;
