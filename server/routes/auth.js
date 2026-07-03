const router = require('express').Router();
const { login, changePassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/change-password', changePassword); // no requireAuth — login page se pehle bhi use hota hai

module.exports = router;