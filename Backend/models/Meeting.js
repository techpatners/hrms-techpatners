const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  title: String,
  description: String,
  meetingDateTime: Date,
  durationMin: Number,
  meetingLink: String,
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, default: "Scheduled" }
}, { timestamps: true });

MeetingSchema.set("toJSON", {
  transform(doc, ret) { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; }
});

module.exports = mongoose.model("Meeting", MeetingSchema);
