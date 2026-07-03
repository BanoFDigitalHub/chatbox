const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

// Only ever 2 people use this app, so a simple in-memory map is enough.
const onlineUsers = new Map(); // username -> { socketId, lastSeen }

function registerChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) throw new Error('No token');
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.username = payload.username;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const username = socket.username;
    onlineUsers.set(username, { socketId: socket.id, lastSeen: null });

    // Tell everyone currently connected who's online, and tell this
    // new socket the current status of everyone else.
    io.emit('presence', { username, online: true });
    for (const [name, info] of onlineUsers.entries()) {
      socket.emit('presence', { username: name, online: !!info.socketId, lastSeen: info.lastSeen });
    }

    socket.on('send_message', async (payload, ack) => {
      try {
        const { text, type, mediaUrl, mediaMeta, viewOnce, receiver, tempId } = payload || {};

        if (!receiver) {
          if (ack) ack({ ok: false, error: 'Receiver missing hai' });
          return;
        }
        if ((!text || !text.trim()) && !mediaUrl) {
          if (ack) ack({ ok: false, error: 'Khali message nahi bhej saktay' });
          return;
        }

        const message = await Message.create({
          sender: username,
          receiver,
          type: type || 'text',
          text: text || '',
          mediaUrl: mediaUrl || '',
          mediaMeta: mediaMeta || {},
          viewOnce: !!viewOnce
        });

        io.emit('new_message', { ...message.toObject(), tempId });
        if (ack) ack({ ok: true, id: message._id });
      } catch (err) {
        console.error('send_message error:', err.message);
        if (ack) ack({ ok: false, error: 'Message save nahi hua' });
      }
    });

    socket.on('view_once_open', async ({ messageId } = {}) => {
      try {
        if (!messageId) return;
        const msg = await Message.findOneAndUpdate(
          { _id: messageId, viewOnce: true, viewed: false },
          { viewed: true, viewedAt: new Date() },
          { new: true }
        );
        if (msg) {
          io.emit('message_viewed', { id: messageId });
        }
      } catch (err) {
        console.error('view_once_open error:', err.message);
      }
    });

    socket.on('typing', () => {
      socket.broadcast.emit('typing', { username });
    });

    socket.on('stop_typing', () => {
      socket.broadcast.emit('stop_typing', { username });
    });

    socket.on('react_message', async ({ messageId, emoji } = {}, ack) => {
      try {
        if (!messageId || !emoji) {
          if (ack) ack({ ok: false, error: 'Reaction data missing hai' });
          return;
        }
        const msg = await Message.findById(messageId);
        if (!msg) {
          if (ack) ack({ ok: false, error: 'Message nahi mila' });
          return;
        }
        const existingIdx = msg.reactions.findIndex((r) => r.username === username);
        if (existingIdx >= 0 && msg.reactions[existingIdx].emoji === emoji) {
          msg.reactions.splice(existingIdx, 1); // tap same emoji again -> remove
        } else if (existingIdx >= 0) {
          msg.reactions[existingIdx].emoji = emoji; // switch reaction
        } else {
          msg.reactions.push({ username, emoji });
        }
        await msg.save();
        io.emit('reaction_updated', { id: messageId, reactions: msg.reactions });
        if (ack) ack({ ok: true });
      } catch (err) {
        console.error('react_message error:', err.message);
        if (ack) ack({ ok: false, error: 'Reaction save nahi hui' });
      }
    });

    socket.on('disconnect', () => {
      const lastSeen = new Date();
      onlineUsers.set(username, { socketId: null, lastSeen });
      io.emit('presence', { username, online: false, lastSeen });
    });
  });
}

module.exports = registerChatSocket;
