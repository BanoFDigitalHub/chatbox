const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { getMessages, markViewed, uploadFile } = require('../controllers/messageController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const allowedMime = /^(image|video|audio)\//;

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sirf image, video ya audio files allowed hain'));
    }
  }
});

router.get('/', requireAuth, getMessages);
router.patch('/:id/view', requireAuth, markViewed);

router.post('/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload fail ho gaya' });
    }
    uploadFile(req, res);
  });
});

module.exports = router;
