import Deal from "../models/desl.js";

//  Create Deal
export const createDeal = async (req, res) => {
    console.log(req.body)
  try {
    const deal = await Deal.create({
        Deal_title: req.body.Deal_title,
        Value: req.body.Value,
        Close_date: req.body.Close_date,
        description: req.body.description,
        stage: req.body.stage,
        user: req.user.id
    });
    res.status(201).json({ success: true, data: deal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//  Get All Deals
export const getDeals = async (req, res) => {
  try {
    const deals = await Deal.findById({user:req.user.id});
    res.status(200).json({ success: true, data: deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Delete Deal
export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    res.status(200).json({ success: true, message: "Deal deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateDeal = async (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  try {
    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      { stage: req.body.stage },
      { new: true }
    );
    res.json(updatedDeal);
  } catch (err) {
    res.status(500).json({ message: "Error updating deal" });
  }
};

