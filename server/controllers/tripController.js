const Trip = require('../models/Trip');
const Notification = require('../models/Notification');

exports.startTrip = async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, userId: req.user._id, status: 'active' });
    await Notification.create({
      userId: req.user._id, type: 'trip', title: 'Trip Started',
      message: `Trip from ${req.body.origin} to ${req.body.destination} started`,
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTrips = async (req, res) => {
  const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(trips);
};

exports.getActiveTrip = async (req, res) => {
  const trip = await Trip.findOne({ userId: req.user._id, status: { $in: ['active', 'paused'] } });
  res.json(trip);
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, remainingDistance } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.liveLocation = { lat, lng };
    trip.travelledRoute.push({ lat, lng });
    if (remainingDistance !== undefined) trip.remainingDistance = remainingDistance;
    await trip.save();
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.pauseTrip = async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id }, { status: 'paused' }, { new: true }
  );
  res.json(trip);
};

exports.endTrip = async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status: 'completed', endedAt: new Date() },
    { new: true }
  );
  res.json(trip);
};

exports.emergencyStop = async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id }, { status: 'emergency' }, { new: true }
  );
  res.json(trip);
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed trips can be deleted.' });
    }
    await Trip.deleteOne({ _id: trip._id });
    res.json({ message: 'Completed trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
