const { normalizePhoneNumber } = require('./smsService');

const sendWhatsApp = async (to, message) => {
    const destination = normalizePhoneNumber(to);

    if (!destination) {
        return {
            success: false,
            configured: false,
            error: 'Emergency contact phone number is empty or invalid.',
            waLink: null
        };
    }

    // WhatsApp is intentionally not sent automatically.
    // Twilio WhatsApp requires a properly configured ContentSid/template.
    const waLink = `https://wa.me/${destination.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    return {
        success: false,
        configured: false,
        error: 'WhatsApp automatic delivery is disabled. Use the WhatsApp link or configure a Twilio ContentSid.',
        waLink
    };
};

module.exports = { sendWhatsApp };
