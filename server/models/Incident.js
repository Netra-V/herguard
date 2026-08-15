const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['harassment', 'theft', 'assault', 'unsafe_area', 'road_issue', 'poor_lighting', 'suspicious', 'other'],
      required: true,
    },
    description: { type: String, required: true },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: String,
    },
    severity: { type: Number, min: 1, max: 5, default: 3 },
    photo: { type: String, default: '' },
    anonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'under_review', 'verified', 'resolved'], default: 'under_review' },
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);