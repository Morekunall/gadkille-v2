const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const imagesDir = path.join(process.cwd(), 'uploads', 'images');
const videosDir = path.join(process.cwd(), 'uploads', 'videos');
fs.mkdirSync(imagesDir, { recursive: true });
fs.mkdirSync(videosDir, { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videosDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  },
});

const publicBaseUrl = (req) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  return `${proto}://${req.get('host')}`;
};

router.post('/stay-images', protect, adminOnly, imageUpload.array('images', 8), (req, res) => {
  const baseUrl = publicBaseUrl(req);
  const urls = (req.files || []).map((file) => `${baseUrl}/images/${file.filename}`);
  res.status(201).json({ urls });
});

router.post('/fort-videos', protect, adminOnly, videoUpload.array('videos', 4), (req, res) => {
  const baseUrl = publicBaseUrl(req);
  const urls = (req.files || []).map((file) => `${baseUrl}/uploads/videos/${file.filename}`);
  res.status(201).json({ urls });
});

module.exports = router;
