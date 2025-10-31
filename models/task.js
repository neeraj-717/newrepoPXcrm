import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: { type: String, default: "Call" },
    priority: { type: String, default: "Medium" },
    dueDate: { type: String },
    completed: { type: Boolean, default: false }, // ✅ new field
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
