import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  primaryContact: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  groups: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    enum: ['Lead', 'Customer', 'Partner', 'Vendor'],
    default: 'Lead'
  },
  capacity: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  whatsappEnabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Customer", customerSchema);