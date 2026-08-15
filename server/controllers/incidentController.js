const Incident = require('../models/Incident');
const Notification = require('../models/Notification');

exports.createIncident = async (req, res) => {
  try {
    const { type, description, latitude, longitude, address, severity, anonymous } = req.body;
    const incident = await Incident.create({
      userId: req.user._id,
      type,
      description,
      location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)], address },
      severity: parseInt(severity) || 3,
      photo: req.file ? `/uploads/${req.file.filename}` : '',
      anonymous: anonymous === 'true',
    });

    if (req.user) {
      await Notification.create({
        userId: req.user._id, type: 'incident', title: 'Report Submitted',
        message: `Your ${type} report is under review`,
      });
    }
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIncidents = async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (type && type !== 'all') filter.type = type;
  const incidents = await Incident.find(filter).select('-userId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await Incident.countDocuments(filter);
  res.json({ incidents, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};

exports.getMyIncidents = async (req, res) => {
  const incidents = await Incident.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(incidents);
};

exports.getNearbyIncidents = async (req, res) => {
  const { lat, lng, radius = 8000 } = req.query;
  const incidents = await Incident.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius),
      },
    },
  }).select('-userId');
  res.json(incidents);
};

exports.getIncident = async (req, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ message: 'Not found' });
  res.json(incident);
};

exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!incident) return res.status(404).json({ message: 'Report not found or you do not have permission to delete it.' });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};