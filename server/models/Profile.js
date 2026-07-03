const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },   // NEW
    avatarUrl: { type: String, default: '' },
    nicknameForOther: { type: String, default: '' },
    wallpaper: { type: String, default: 'default' },
    themeColor: { type: String, default: 'teal' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);