const Message = require('../models/Message');

// Strip media from a message if it was view-once and already viewed,
// so the media truly cannot be re-fetched from history.
function serialize(message) {
  const obj = message.toObject ? message.toObject() : message;
  if (obj.viewOnce && obj.viewed) {
    obj.mediaUrl = '';
  }
  return obj;
}

exports.getMessages = async (req, res) => {
  try {
    const me = req.user.username;
    const other = req.query.otherUser;

    if (!other) {
      return res.status(400).json({ message: 'otherUser query param zaroori hai' });
    }

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages.map(serialize));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Messages load nahi ho sakay' });
  }
};

exports.markViewed = async (req, res) => {
  try {
    const msg = await Message.findOneAndUpdate(
      { _id: req.params.id, viewOnce: true, viewed: false },
      { viewed: true, viewedAt: new Date() },
      { new: true }
    );

    if (!msg) {
      return res.status(400).json({ message: 'Ye message pehle hi dekha ja chuka hai ya mojood nahi' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('message_viewed', { id: req.params.id });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'View mark nahi ho saka' });
  }
};

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Koi file nahi mili' });
  }

  const mime = req.file.mimetype || '';
  const mediaType = mime.startsWith('image')
    ? 'image'
    : mime.startsWith('video')
    ? 'video'
    : mime.startsWith('audio')
    ? 'voice'
    : 'file';

  res.json({
    url: `/uploads/${req.file.filename}`,
    mediaType,
    fileName: req.file.originalname,
    size: req.file.size
  });
};
