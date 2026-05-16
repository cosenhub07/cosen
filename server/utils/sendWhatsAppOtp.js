const axios = require('axios');

/**
 * Send an OTP via Meta's WhatsApp Cloud API
 * @param {string} phone - The recipient phone number (including country code, no +)
 * @param {string} otp - The 6-digit OTP to send
 */
const sendWhatsAppOtp = async (phone, otp) => {
  // Ensure you add these variables to your server/.env file
  const WA_ACCESS_TOKEN = process.env.META_WA_ACCESS_TOKEN;
  const WA_PHONE_NUMBER_ID = process.env.META_WA_PHONE_NUMBER_ID;

  if (!WA_ACCESS_TOKEN || !WA_PHONE_NUMBER_ID) {
    console.error('Meta WhatsApp credentials missing in .env');
    throw new Error('WhatsApp API configuration missing');
  }

  // Format phone number to remove any non-digit characters (like + or spaces)
  const cleanPhone = phone.replace(/\D/g, '');

  const url = `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: `Your Cosen verification code is: *${otp}*.\n\nThis code is valid for exactly 5 minutes. Do not share this code with anyone.`,
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`WhatsApp OTP sent to ${cleanPhone}:`, response.data);
    return response.data;
  } catch (error) {
    // Log detailed error from Meta API
    if (error.response) {
      console.error('Meta API Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('WhatsApp sending failed:', error.message);
    }
    throw new Error('Failed to send WhatsApp message');
  }
};

module.exports = sendWhatsAppOtp;
