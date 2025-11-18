import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    phone: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          // Allow formats: 9999999999, +919999999999, 919999999999
          const cleaned = v.replace(/\D/g, '');
          return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
        },
        message: 'Phone number must be a valid 10-digit Indian mobile number'
      }
    },
    source: { type: String },
    industry: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      default: "New",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
