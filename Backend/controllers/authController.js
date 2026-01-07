const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d"
  });
}

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email & password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: user.toJSON() });
};

// Ensure admin exists from .env credentials
exports.ensureAdminExists = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
      avatar: "https://picsum.photos/seed/admin/200"
    });
    await admin.save();
    console.log("Admin user created from env");
  } else {
    // make sure admin has ADMIN role
    if (admin.role !== "ADMIN") {
      admin.role = "ADMIN";
      await admin.save();
    }
  }
};
