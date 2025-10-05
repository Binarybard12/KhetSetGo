// SMS Service using Twilio
// This is a backend service that should be deployed separately
// For demo purposes, we'll simulate the SMS sending

const express = require('express');
// const twilio = require('twilio'); // Uncomment when you have Twilio credentials
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize Twilio client (uncomment when you have credentials)
// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// SMS sending endpoint
app.post('/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message, villageName } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    // Format phone number
    const formattedNumber = phoneNumber.replace(/\s+/g, '');
    
    // For demo purposes, we'll simulate SMS sending
    // In production, uncomment the actual Twilio code below
    
    console.log(`📱 SMS Sent to ${formattedNumber}:`);
    console.log(`Message: ${message}`);
    console.log(`Village: ${villageName}`);
    console.log('---');

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Actual Twilio SMS sending (uncomment for production)
    /*
    const smsResult = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log('SMS sent successfully:', smsResult.sid);
    */

    res.json({
      success: true,
      message: 'SMS sent successfully',
      messageId: `demo_${Date.now()}`,
      recipient: formattedNumber,
      village: villageName
    });

  } catch (error) {
    console.error('SMS sending failed:', error);
    res.json({
      success: false,
      error: 'Failed to send SMS',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'SMS Service is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`📱 SMS Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
