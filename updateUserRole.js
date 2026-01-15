// Quick script to update user role from "user" to "admin"
require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function updateRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users with role "user" to "admin"
    const result = await User.updateMany(
      { role: 'user' },
      { $set: { role: 'admin' } }
    );

    console.log(`Updated ${result.modifiedCount} user(s) from "user" to "admin"`);
    
    // Show all users
    const users = await User.find({}, 'email role');
    console.log('\nAll users:');
    users.forEach(u => console.log(`  ${u.email}: ${u.role}`));

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateRole();
