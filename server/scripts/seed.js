require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Profile = require('../models/Profile');

async function seed() {
  await connectDB();

  const pairs = [
    { username: process.env.USER1_USERNAME, password: process.env.USER1_PASSWORD },
    { username: process.env.USER2_USERNAME, password: process.env.USER2_PASSWORD }
  ];

  for (const p of pairs) {
    if (!p.username || !p.password) {
      console.log('Skip: .env me username/password missing hai', p);
      continue;
    }
    const passwordHash = await bcrypt.hash(p.password, 10);
    await Profile.findOneAndUpdate(
      { username: p.username },
      { $setOnInsert: { username: p.username }, $set: { passwordHash } },
      { upsert: true }
    );
    console.log(`Seeded: ${p.username}`);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed fail ho gaya:', err.message);
  process.exit(1);
}); 