import twilio from 'twilio';
import Lead from '../models/lead.js';
import Call from '../models/calls.js';

// Initialize Twilio client only if credentials are provided
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid') {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Make a call to lead
export const makeCall = async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: "Twilio not configured" });
    }

    if (!process.env.BASE_URL) {
      return res.status(500).json({ error: "BASE_URL not configured" });
    }

    const { leadId, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    const baseUrl = process.env.BASE_URL.replace(/\/+$/, "");

    const call = await client.calls.create({
      to: formattedPhoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${baseUrl}/api/lead-manager/twiml`,
      statusCallback: `${baseUrl}/api/lead-manager/call-status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      record: true,
    });

    const callRecord = new Call({
      leadId,
      phoneNumber: formattedPhoneNumber,
      callSid: call.sid,
      status: "initiated",
      userId: req.user?.id,
    });

    await callRecord.save();

    res.json({ success: true, callSid: call.sid, message: "Call initiated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// TwiML response for calls
export const getTwiML = (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Hello, this is a call from your CRM system. Please hold while we connect you.');
  twiml.dial('+919876543210'); // Your agent number
  
  res.type('text/xml');
  res.send(twiml.toString());
};

// Handle call status updates
export const handleCallStatus = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    
    await Call.findOneAndUpdate(
      { callSid: CallSid },
      { 
        status: CallStatus,
        duration: CallDuration || 0,
        endTime: new Date()
      }
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get call history
export const getCallHistory = async (req, res) => {
  try {
    const calls = await Call.find({ userId: req.user.id })
      .populate('leadId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Format phone number to E.164 format
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 91, it's already country code
  if (cleaned.startsWith('91')) {
    return '+' + cleaned;
  }
  
  // If 10 digit number, add India country code
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  // If already has country code but no +
  if (cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  return phoneNumber; // Return as is if format not recognized
};

// Send SMS to lead
export const sendSMS = async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }
    
    const { leadId, phoneNumber, message } = req.body;
    
    // Format phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    
    console.log('Original phone:', phoneNumber);
    console.log('Formatted phone:', formattedPhoneNumber);
    
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhoneNumber
    });

    // Save SMS record
    const smsRecord = new Call({
      leadId,
      phoneNumber: formattedPhoneNumber,
      message,
      messageSid: sms.sid,
      status: 'sent',
      type: 'sms',
      userId: req.user.id
    });
    await smsRecord.save();

    res.json({ success: true, messageSid: sms.sid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 // Get SMS history
export const getSmsHistory = async (req, res) => {
  try {
    const smsHistory = await Call.find({ 
      userId: req.user.id,
      type: 'sms'
    })
      .populate('leadId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(smsHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get lead manager dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const todayCalls = await Call.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    
    const recentCalls = await Call.find({ userId: req.user.id })
      .populate('leadId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalLeads,
      todayCalls,
      recentCalls
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};