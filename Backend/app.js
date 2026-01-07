const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const tasksRoutes = require("./routes/tasks");
const reportsRoutes = require("./routes/reports");
const meetingsRoutes = require("./routes/meetings");
const announcementsRoutes = require("./routes/announcements");
const dashboardRoutes = require("./routes/dashboard");

const { ensureAdminExists } = require("./controllers/authController");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "20mb" })); // increased limit for base64 if needed
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// serve uploaded files

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

ensureAdminExists().catch(console.error);

module.exports = app;
