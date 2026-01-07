// Backend/models/Report.js
const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  reportDate: String,
  summary: String,
  hoursSpent: Number,
  githubLinks: [String],
  attachments: [String],
  reviewStatus: { type: String, enum: ["Pending", "Approved", "Needs Changes"], default: "Pending" },
  adminComment: String
}, { timestamps: true });

// optional unique compound index to prevent accidental duplicates
ReportSchema.index({ userId: 1, reportDate: 1 }, { unique: true });

ReportSchema.set("toJSON", {
  transform(doc, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; }
});

module.exports = mongoose.model("Report", ReportSchema);
