const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const createSOSToken = async () => {
  // A 12-digit numeric token is easy to demonstrate to a jury/user,
  // while only its SHA-256 hash is persisted in MongoDB.
  while (true) {
    const token = crypto
      .randomInt(0, 1000000000000)
      .toString()
      .padStart(12, '0');

    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const exists = await User.exists({ sosTokenHash: hash });
    if (!exists) return { token, hash };
  }
};

const ensureSOSToken = async (user) => {
  if (user.sosTokenHash) return null;

  const { token, hash } = createSOSToken();
  user.sosTokenHash = hash;
  await user.save();
  return token;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, emergencyContact } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (!emergencyContact?.name?.trim() || !emergencyContact?.phone?.trim()) {
      return res.status(400).json({
        message: 'Emergency contact name and phone are required to activate Emergency SOS.',
      });
    }

    const { token: sosToken, hash: sosTokenHash } = await createSOSToken();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || '',
      sosTokenHash,
    });

    await EmergencyContact.create({
      userId: user._id,
      name: emergencyContact.name.trim(),
      phone: emergencyContact.phone.trim(),
      relation: emergencyContact.relation?.trim() || 'Family',
      isPrimary: true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
      sosToken,
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    // Existing accounts created before the SOS-token feature receive a token
    // the next time they log in. Normal email/password authentication is unchanged.
    const sosToken = await ensureSOSToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      settings: user.settings,
      token: generateToken(user._id),
      sosToken: sosToken || undefined,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No user with that email' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    res.json({ message: 'Reset token generated', resetToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful', token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
