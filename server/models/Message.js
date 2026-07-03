const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'voice', 'file'],
      default: 'text'
    },
    text: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    mediaMeta: {
      fileName: String,
      size: Number,
      duration: Number
    },
    viewOnce: { type: Boolean, default: false },
    viewed: { type: Boolean, default: false },
    viewedAt: { type: Date, default: null },
    reactions: [
      {
        username: { type: String, required: true },
        emoji: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
