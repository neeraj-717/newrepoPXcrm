import Lead from "../models/lead.js";
import user from "../models/user.js";

export const createLead = async (req, res) => {
    console.log(req.body)
    try {
        const lead = await Lead.create({
            company: req.body.company,
            contact: req.body.contact,
            email: req.body.email,
            phone: req.body.phone,
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
