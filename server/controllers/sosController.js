const SOSLog = require('../models/SOSLog');
const EmergencyContact = require('../models/EmergencyContact');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSMS } = require('../utils/smsService');
const crypto = require('crypto');


// Public emergency entry point used by the Login page.
// It does not require JWT authentication; the random SOS token identifies the account.
exports.triggerPublicSOS = async (req, res) => {
  try {
    const { sosToken, latitude, longitude } = req.body;

    if (!sosToken || typeof sosToken !== 'string') {
      return res.status(400).json({ message: 'Emergency SOS token is required.' });
    }

    if (
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      return res.status(400).json({
        message: 'A valid browser location is required before activating SOS.',
      });
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(sosToken)
      .digest('hex');

    const user = await User.findOne({ sosTokenHash: tokenHash });

    if (!user) {
      return res.status(401).json({
        message: 'This device does not have a valid Emergency SOS token. Please log in once to activate SOS on this device.',
      });
    }

    const contacts = await EmergencyContact.find({ userId: user._id });

    if (!contacts.length) {
      return res.status(400).json({
        message: 'No emergency contact is registered for this SOS account.',
      });
    }

    const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message =
      `HERGUARD SOS ALERT\n\n` +
      `${user.name} has activated an emergency SOS.\n\n` +
      `Location:\n${mapLink}\n\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Please contact them immediately.`;

    const channels = new Set();
    const notified = [];
    const delivery = [];

    for (const contact of contacts) {
      const sms = await sendSMS(contact.phone, message);

      if (sms.success) {
        channels.add('sms');
        notified.push({ name: contact.name, phone: contact.phone });
      }

      delivery.push({
        name: contact.name,
        phone: contact.phone,
        sms: {
          success: sms.success,
          error: sms.error,
          sid: sms.sid,
        },
      });
    }

    const successCount = notified.length;
    const deliveryStatus =
      successCount === contacts.length
        ? 'sent'
        : successCount > 0
          ? 'partial'
          : 'failed';

    const log = await SOSLog.create({
      userId: user._id,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
      contactsNotified: notified,
      channels: [...channels],
      deliveryStatus,
      delivery,
      message,
      status: deliveryStatus === 'failed' ? 'cancelled' : 'active',
    });

    await Notification.create({
      userId: user._id,
      type: 'sos',
      title: deliveryStatus === 'failed' ? 'SOS notification failed' : 'SOS Alert Sent',
      message:
        deliveryStatus === 'failed'
          ? 'SOS was recorded, but no SMS could be delivered. Check your Twilio SMS configuration and verified recipient number.'
          : `Alert delivered to ${successCount} of ${contacts.length} contact(s).`,
    });

    if (deliveryStatus === 'failed') {
      return res.status(502).json({
        message: 'SOS was recorded, but no SMS could be delivered. Check your Twilio SMS configuration and verified recipient number.',
      });
    }

    return res.status(201).json({
      message:
        deliveryStatus === 'sent'
          ? 'Emergency SOS activated.'
          : `Emergency SOS activated. Alert delivered to ${successCount} of ${contacts.length} contact(s).`,
    });
  } catch (err) {
    console.error('Public SOS trigger error:', err);
    return res.status(500).json({ message: 'Unable to activate SOS. Please try again.' });
  }
};

exports.triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      return res.status(400).json({
        message: 'A valid GPS location is required before sending SOS.',
      });
    }

    const contacts = await EmergencyContact.find({ userId: req.user._id });

    if (!contacts.length) {
      return res.status(400).json({
        message: 'Add at least one emergency contact before triggering SOS.',
      });
    }

    const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message =
      `HERGUARD SOS ALERT\n\n` +
      `${req.user.name} has activated an emergency SOS.\n\n` +
      `Location:\n${mapLink}\n\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Please contact them immediately.`;

    const channels = new Set();
    const notified = [];
    const delivery = [];

    for (const contact of contacts) {
      const sms = await sendSMS(contact.phone, message);

      if (sms.success) {
        channels.add('sms');
        notified.push({
          name: contact.name,
          phone: contact.phone,
        });
      }

      delivery.push({
        name: contact.name,
        phone: contact.phone,
        sms: {
          success: sms.success,
          error: sms.error,
          sid: sms.sid,
        },
      });
    }

    const successCount = notified.length;

    const deliveryStatus =
      successCount === contacts.length
        ? 'sent'
        : successCount > 0
          ? 'partial'
          : 'failed';

    const log = await SOSLog.create({
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
      contactsNotified: notified,
      channels: [...channels],
      deliveryStatus,
      delivery,
      message,
      status: deliveryStatus === 'failed' ? 'cancelled' : 'active',
    });

    await Notification.create({
      userId: req.user._id,
      type: 'sos',
      title:
        deliveryStatus === 'failed'
          ? 'SOS notification failed'
          : 'SOS Alert Sent',
      message:
        deliveryStatus === 'failed'
          ? 'SOS was recorded, but no SMS could be delivered. Check your Twilio SMS configuration and verified recipient number.'
          : `Alert delivered to ${successCount} of ${contacts.length} contact(s).`,
    });

    if (deliveryStatus === 'failed') {
      return res.status(502).json({
        message:
          'SOS was recorded, but no SMS notification could be delivered. Check your Twilio configuration and verify the emergency contact number.',
        log,
        delivery,
      });
    }

    return res.status(201).json({
      log,
      delivery,
      message:
        deliveryStatus === 'sent'
          ? `SOS sent to all ${contacts.length} emergency contact(s).`
          : `SOS delivered to ${successCount} of ${contacts.length} emergency contact(s).`,
    });
  } catch (err) {
    console.error('SOS trigger error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.resolveSOS = async (req, res) => {
  try {
    const { status } = req.body;

    const log = await SOSLog.findOneAndUpdate(
      { userId: req.user._id, status: 'active' },
      { status, resolvedAt: new Date() },
      { new: true, sort: { createdAt: -1 } }
    );

    return res.json(log || { message: 'No active SOS' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getSOSLogs = async (req, res) => {
  try {
    const logs = await SOSLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getActiveSOS = async (req, res) => {
  try {
    const log = await SOSLog.findOne({
      userId: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    return res.json(log);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
