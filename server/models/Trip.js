const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    originCoords: { lat: Number, lng: Number },
    destCoords: { lat: Number, lng: Number },
    route: [{ lat: Number, lng: Number }],
    travelledRoute: [{ lat: Number, lng: Number }],
    liveLocation: { lat: Number, lng: Number },
    status: { type: String, enum: ['active', 'paused', 'completed', 'emergency'], default: 'active' },
    estimatedTime: { type: Number, default: 30 },
    checkInInterval: { type: Number, default: 10 },
    remainingDistance: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);