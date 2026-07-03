const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Profile = require('../models/Profile');

exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username aur password dono likho' });
  }
  const user = await Profile.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Username ya password ghalat hai' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Username ya password ghalat hai' });

  const other = await Profile.findOne({ username: { $ne: username } });
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username, otherUser: other ? other.username : null });
};

// Login page se direct call hota hai — koi JWT nahi chahiye,
// current password hi identity verify karta hai (login jaisa hi check).
exports.changePassword = async (req, res) => {
  const { username, currentPassword, newPassword } = req.body || {};

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Saari fields zaroori hain' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Naya password kam se kam 6 characters ka ho' });
  }

  const user = await Profile.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Username ya current password ghalat hai' });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Username ya current password ghalat hai' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password update ho gaya' });
};