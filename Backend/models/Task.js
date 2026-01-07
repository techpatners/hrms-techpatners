const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,              // 🔥 MUST
  },
  assignedToName: String,

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  dueDate: String,
  priority: { type: String, default: "Medium" },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Done"],
    default: "Pending",
  },
}, { timestamps: true });

TaskSchema.set("toJSON", {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("Task", TaskSchema);
