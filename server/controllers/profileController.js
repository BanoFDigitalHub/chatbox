const Profile = require('../models/Profile');

function otherUsernameOf(me) {
  const pairs = [process.env.USER1_USERNAME, process.env.USER2_USERNAME];
  return pairs.find((u) => u !== me);
}

async function getOrCreate(username) {
  return Profile.findOneAndUpdate(
    { username },
    { $setOnInsert: { username } },
    { new: true, upsert: true }
  );
}

exports.getProfiles = async (req, res) => {
  try {
    const me = req.user.username;
    const other = otherUsernameOf(me);

    const [meProfile, otherProfile] = await Promise.all([
      getOrCreate(me),
      getOrCreate(other)
    ]);

    res.json({
      me: {
        username: me,
        avatarUrl: meProfile.avatarUrl,
        nicknameForOther: meProfile.nicknameForOther,
        wallpaper: meProfile.wallpaper,
        themeColor: meProfile.themeColor
      },
      other: {
        username: other,
        avatarUrl: otherProfile.avatarUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile load nahi ho saka' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const me = req.user.username;
    const { nicknameForOther, wallpaper, themeColor } = req.body || {};

    const update = {};
    if (typeof nicknameForOther === 'string') update.nicknameForOther = nicknameForOther.slice(0, 40);
    if (typeof wallpaper === 'string') update.wallpaper = wallpaper;
    if (typeof themeColor === 'string') update.themeColor = themeColor;

    const profile = await Profile.findOneAndUpdate(
      { username: me },
      { $set: update, $setOnInsert: { username: me } },
      { new: true, upsert: true }
    );

    res.json({
      nicknameForOther: profile.nicknameForOther,
      wallpaper: profile.wallpaper,
      themeColor: profile.themeColor
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Settings save nahi hui' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Koi image nahi mili' });
    }
    const me = req.user.username;
    const url = `/uploads/${req.file.filename}`;

    await Profile.findOneAndUpdate(
      { username: me },
      { $set: { avatarUrl: url }, $setOnInsert: { username: me } },
      { new: true, upsert: true }
    );

    const io = req.app.get('io');
    if (io) io.emit('profile_updated', { username: me, avatarUrl: url });

    res.json({ avatarUrl: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile picture save nahi hui' });
  }
};
