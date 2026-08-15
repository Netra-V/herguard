const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    sms: {
      success: Boolean,
      error: String,
      sid: String,
    },
  },
  { _id: false }
);

const sosLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    contactsNotified: [{ name: String, phone: String }],
    channels: [{ type: String, enum: ['sms'] }],
    deliveryStatus: {
      type: String,
      enum: ['sent', 'partial', 'failed'],
      default: 'failed',
    },
    delivery: [deliverySchema],
    status: {
      type: String,
      enum: ['active', 'safe', 'false_alarm', 'cancelled'],
      default: 'active',
    },
    message: String,
    triggeredAt: { type: Date, default: Date.now },
    resolvedAt: Date,
  },
  { timestamps: true }
);

sosLogSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOSLog', sosLogSchema);
