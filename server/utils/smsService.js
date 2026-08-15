const normalizePhoneNumber = (phone) => {
  const raw = String(phone || '').trim();
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '');

  // HerGuard defaults to India for 10-digit numbers.
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;

  return `+${digits}`;
};

const sendSMS = async (to, message) => {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
  } = process.env;

  const destination = normalizePhoneNumber(to);
  const sender = normalizePhoneNumber(TWILIO_PHONE_NUMBER);

  if (!destination) {
    return {
      success: false,
      configured: false,
      error: 'Emergency contact phone number is empty or invalid.',
    };
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return {
      success: false,
      configured: false,
      error:
        'SMS is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER to server/.env.',
    };
  }

  try {
    const twilio = require('twilio')(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN
    );

    console.log('Sending SMS...');
    console.log('From:', sender);
    console.log('To:', destination);

    const result = await twilio.messages.create({
      body: message,
      from: sender,
      to: destination,
    });

    console.log('SMS sent successfully:', result.sid);

    return {
      success: true,
      configured: true,
      sid: result.sid,
      to: destination,
    };
  } catch (err) {
    console.error('SMS error:', err.message);

    return {
      success: false,
      configured: true,
      error: err.message,
      to: destination,
    };
  }
};

module.exports = {
  sendSMS,
  normalizePhoneNumber,
};
