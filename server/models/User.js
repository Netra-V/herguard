const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    // Random SOS bearer token is stored only as a SHA-256 hash in MongoDB.
    sosTokenHash: { type: String, unique: true, sparse: true, index: true },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    settings: {
      darkMode: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
      privacy: { type: Boolean, default: true },
      language: { type: String, default: 'en' },
      locationSharing: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);