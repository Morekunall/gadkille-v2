const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'images');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/stay-images', protect, adminOnly, upload.array('images', 8), (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const urls = (req.files || []).map((file) => `${baseUrl}/images/${file.filename}`);
  res.status(201).json({ urls });
});

module.exports = router;
