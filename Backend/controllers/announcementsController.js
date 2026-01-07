const Announcement = require("../models/Announcement");

/* ================= LIST (PUBLIC) ================= */
exports.list = async (req, res) => {
  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .lean();

  res.json({ announcements });
};

/* ================= CREATE (ADMIN) ================= */
exports.create = async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: "Title & message required" });
  }

  const announcement = new Announcement({
    title,
    message,
    createdBy: req.user.id,
  });

  await announcement.save();
  res.json({ announcement: announcement.toJSON() });
};

/* ================= DELETE (ADMIN) ================= */
exports.remove = async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
