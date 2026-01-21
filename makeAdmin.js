// Run this to make yourself admin
require('dotenv').config();
const mongoose = require('mongoose');

async function makeAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Replace with your email
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'your-email@gmail.com' },
    { $set: { role: 'admin' } }
  );
  
  console.log('Updated:', result.modifiedCount, 'user(s) to admin');
  await mongoose.connection.close();
}

makeAdmin();