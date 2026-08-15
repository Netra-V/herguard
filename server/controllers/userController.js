const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const SOSLog = require('../models/SOSLog');
const Trip = require('../models/Trip');
const Incident = require('../models/Incident');

exports.getProfile = async (req, res) => {
  const contacts = await EmergencyContact.find({ userId: req.user._id });
  res.json({ user: req.user, contacts });
};

exports.updateProfile = async (req, res) => {
  try {
    const fields = ['name', 'phone', 'address', 'avatar'];
    fields.forEach((f) => { if (req.body[f] !== undefined) req.user[f] = req.body[f]; });
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!(await req.user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    req.user.password = newPassword;
    await req.user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    req.user.settings = { ...req.user.settings, ...req.body };
    await req.user.save();
    res.json(req.user.settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [contacts, sosCount, reports, activeTrips] = await Promise.all([
      EmergencyContact.countDocuments({ userId }),
      SOSLog.countDocuments({ userId }),
      Incident.countDocuments({ userId }),
      Trip.countDocuments({ userId, status: 'active' }),
    ]);
    res.json({ contacts, sosCount, reports, activeTrips, safetyScore: Math.min(100, 60 + contacts * 10) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};