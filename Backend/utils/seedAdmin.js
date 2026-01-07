require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const mongoose = require("mongoose");

async function run() {
  await connectDB();

  /* ================= ADMIN ================= */
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = new User({
      name: "Admin",
      email: adminEmail,
      role: "ADMIN",
      isActive: true,
    });
    admin.password = adminPassword;
    await admin.save();
    console.log("✅ Admin CREATED:", adminEmail, adminPassword);
  } else {
    // 🔥 FORCE reset password (VERY IMPORTANT)
    admin.password = adminPassword;
    admin.role = "ADMIN";
    admin.isActive = true;
    await admin.save();
    console.log("🔁 Admin password RESET:", adminEmail, adminPassword);
  }

  /* ================= INTERN ================= */
  const internEmail = "john@techpatners.com";
  const internPassword = "intern123";

  let intern = await User.findOne({ email: internEmail });

  if (!intern) {
    intern = new User({
      name: "John Intern",
      email: internEmail,
      role: "INTERN",
      isActive: true,
      batch: "1",
      team: "No-Broker",
    });
    intern.password = internPassword;
    await intern.save();
    console.log("✅ Intern CREATED:", internEmail, internPassword);
  } else {
    intern.password = internPassword;
    intern.role = "INTERN";
    intern.isActive = true;
    await intern.save();
    console.log("🔁 Intern password RESET:", internEmail, internPassword);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
