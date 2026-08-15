const EmergencyContact = require('../models/EmergencyContact');

exports.getContacts = async (req, res) => {
  const contacts = await EmergencyContact.find({ userId: req.user._id }).sort({ isPrimary: -1 });
  res.json(contacts);
};

exports.createContact = async (req, res) => {
  try {
    const count = await EmergencyContact.countDocuments({ userId: req.user._id });
    if (count >= 5) return res.status(400).json({ message: 'Maximum 5 contacts allowed' });
    const contact = await EmergencyContact.create({ ...req.body, userId: req.user._id });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContact = async (req, res) => {
  const contact = await EmergencyContact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!contact) return res.status(404).json({ message: 'Contact not found' });
  res.json({ message: 'Contact deleted' });
};

exports.setPrimary = async (req, res) => {
  await EmergencyContact.updateMany({ userId: req.user._id }, { isPrimary: false });
  const contact = await EmergencyContact.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isPrimary: true },
    { new: true }
  );
  res.json(contact);
};