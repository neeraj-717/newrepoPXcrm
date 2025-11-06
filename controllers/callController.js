import Call from "../models/calls.js";

// Create Call
export const createCall = async (req, res) => {
  console.log(req.body);
  try {
    const call = await Call.create({
      lead: req.body.lead,
      duration: req.body.duration,
      outcome: req.body.outcome,
      notes: req.body.notes,
       user: req.user.id
    });
    call.save();
    res.status(201).json({ success: true, data: call });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get All Calls
export const getCalls = async (req, res) => {
  try {
    const calls = await Call.find({user:req.user.id});
    res.status(200).json({ success: true, data: calls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
   
// Delete Call
export const deleteCall = async (req, res) => {
  try {
    const call = await Call.findByIdAndDelete(req.params.id);
    if (!call) return res.status(404).json({ success: false, message: "Call not found" });
    res.status(200).json({ success: true, message: "Call deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
