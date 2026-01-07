const User = require("../models/User");
const crypto = require("crypto");

function genTemp() {
  return crypto.randomBytes(3).toString("hex");
}

exports.listInterns = async (req, res) => {
  const interns = await User.find({ role: "INTERN" }).sort({ createdAt: -1 });
  res.json({ interns });
};

exports.createIntern = async (req, res) => {
  const { name, email, password, batch, team, avatar } = req.body || {};
  if (!name || !email) return res.status(400).json({ message: "name & email required" });
  let existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already used" });

  const tempPassword = password || genTemp();
  const intern = new User({
    name,
    email,
    password: tempPassword,
    role: "INTERN",
    batch,
    team,
    avatar: avatar || `https://picsum.photos/seed/${encodeURIComponent(email)}/200`
  });
  await intern.save();

  res.json({ intern: intern.toJSON(), tempPassword });
};

exports.deleteIntern = async (req, res) => {
  const id = req.params.id;
  await User.findByIdAndDelete(id);
  res.json({ ok: true });
};
