require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const profileRoutes = require('./routes/profile');
const registerChatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);

// Serve the frontend (public folder is a sibling of server/)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Unknown API routes get a JSON 404, everything else gets the custom 404 page
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

registerChatSocket(io);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server chal raha hai, port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connect nahi hua:', err.message);
    process.exit(1);
  });
