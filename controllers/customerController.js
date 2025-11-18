import Customer from "../models/customer.js";
import CallLog from "../models/callLog.js";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Get all customers with pagination, search, and filters
export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', active, type, groups } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { primaryContact: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    if (groups) {
      query.groups = { $in: groups.split(',') };
    }
    
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Customer.countDocuments(query);
    
    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single customer
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create customer
export const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Make call
export const makeCall = async (req, res) => {
  try {
    const { phone, customerId } = req.body;
    
    const call = await client.calls.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.PUBLIC_URL}/api/customers/call/twiml`
    });
    
    // Create call log
    const callLog = new CallLog({
      customerId,
      phone,
      twilioSid: call.sid,
      status: 'initiated'
    });
    await callLog.save();
    
    res.json({ callSid: call.sid, message: "Call initiated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TwiML response
export const getTwiML = (req, res) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting your call from ProjectPixelCRM.</Say>
  <Dial>${req.query.phone || ''}</Dial>
</Response>`;
  
  res.type('text/xml');
  res.send(twiml);
};

// Call status webhook
export const callStatusWebhook = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    
    await CallLog.findOneAndUpdate(
      { twilioSid: CallSid },
      {
        status: CallStatus,
        duration: CallDuration || 0,
        endedAt: new Date()
      }
    );
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get call logs for customer
export const getCallLogs = async (req, res) => {
  try {
    const callLogs = await CallLog.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 });
    res.json(callLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};