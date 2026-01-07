const Meeting = require("../models/Meeting");

exports.list = async (req, res) => {
  const meetings = await Meeting.find().sort({ meetingDateTime: -1 }).lean();
  res.json({ meetings });
};

exports.create = async (req, res) => {
  const { title, description, meetingDateTime, durationMin, meetingLink, attendees } = req.body || {};
  const m = new Meeting({
    title, description, meetingDateTime, durationMin, meetingLink, attendees: attendees || []
  });
  await m.save();
  res.json({ meeting: m });
};
