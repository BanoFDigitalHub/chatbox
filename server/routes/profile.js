const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { getProfiles, updateProfile, uploadAvatar } = require('../controllers/profileController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `avatar-${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Sirf image allowed hai profile picture ke liye'));
  }
});

router.get('/', requireAuth, getProfiles);
router.patch('/', requireAuth, updateProfile);

router.post('/avatar', requireAuth, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload fail ho gaya' });
    uploadAvatar(req, res);
  });
});

module.exports = router;
