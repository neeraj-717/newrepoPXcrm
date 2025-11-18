import Lead from "../models/lead.js";
import user from "../models/user.js";

// Format phone number to standard format
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return phoneNumber;
  
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If 10 digit number, keep as is (Indian mobile number)
  if (cleaned.length === 10) {
    return cleaned;
  }
  
  // If starts with 91 and has 12 digits, remove country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.substring(2);
  }
  
  return phoneNumber; // Return as is if format not recognized
};

export const createLead = async (req, res) => {
    console.log(req.body)
    try {
        const lead = await Lead.create({
            company: req.body.company,
            contact: req.body.contact,
            email: req.body.email,
            phone: formatPhoneNumber(req.body.phone),
            source: req.body.source,
            industry: req.body.industry,
            notes: req.body.notes,
             user: req.user.id
        });
        await lead.save();
        res.status(201).json(lead);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all Leads
export const getLeads = async (req, res) => {
    console.log(req.user)
    try {
        const leads = await Lead.find({ user: req.user.id });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single Lead
export const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        res.json(lead);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Lead
export const updateLead = async (req, res) => {
    try {
        // Format phone number if provided
        if (req.body.phone) {
            req.body.phone = formatPhoneNumber(req.body.phone);
        }
        
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json(lead);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Lead
export const deleteLead = async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ message: "Lead deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
