// Backend/controllers/reportsController.js
const path = require("path");
const fs = require("fs").promises;
const Report = require("../models/Report");

/* ================= UPLOAD FILES (multer provides req.files) ================= */
exports.uploadFiles = async (req, res) => {
  try {
    const files = req.files || [];
    // build absolute URL for each file
    const urls = files.map((f) => {
      // public URL: http(s)://host/uploads/reports/filename
      const base = `${req.protocol}://${req.get("host")}`;
      return `${base}/uploads/reports/${f.filename}`;
    });
    res.json({ urls });
  } catch (err) {
    console.error("Upload files error:", err);
    res.status(500).json({ message: "Failed to upload files" });
  }
};

/* ================= LIST ================= */
exports.listReports = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "ADMIN";
    const filter = isAdmin ? {} : { userId: req.user.id };
    const reports = await Report.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ reports });
  } catch (err) {
    console.error("List reports error:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

/* ================= CREATE ================= */
exports.createReport = async (req, res) => {
  try {
    const { reportDate, summary, hoursSpent, githubLinks, attachments } = req.body || {};

    if (!summary || !hoursSpent) {
      return res.status(400).json({ message: "summary & hours required" });
    }

    // avoid duplicate entry (same user + same date)
    const existing = await Report.findOne({ userId: req.user.id, reportDate }).lean();
    if (existing) {
      return res.status(409).json({ message: "You have already submitted a report for this date" });
    }

    const report = new Report({
      userId: req.user.id,
      userName: req.user.name,
      reportDate,
      summary,
      hoursSpent,
      githubLinks: githubLinks || [],
      attachments: attachments || [],
    });

    await report.save();
    res.json({ report: report.toJSON() });
  } catch (err) {
    console.error("Create report error:", err);
    // fallback for duplicate index (just in case)
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already submitted a report for this date" });
    }
    res.status(500).json({ message: "Failed to submit report" });
  }
};

/* ================= DELETE ================= */
// Admin only route (but check again defensively)
exports.deleteReport = async (req, res) => {
  try {
    const id = req.params.id;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // delete files from disk if attachments are present and point to /uploads
    if (Array.isArray(report.attachments) && report.attachments.length > 0) {
      for (const url of report.attachments) {
        try {
          // convert URL to local path if it points to /uploads
          // e.g. http://localhost:5000/uploads/reports/160000_file.zip -> /path/to/backend/uploads/reports/160000_file.zip
          const uploadsIndex = url.indexOf("/uploads/");
          if (uploadsIndex !== -1) {
            const relPath = url.substring(uploadsIndex); // "/uploads/reports/..."
            const fullPath = path.join(__dirname, "..", relPath);
            // only attempt unlink if file exists
            await fs.unlink(fullPath).catch(() => {});
          }
        } catch (e) {
          // don't block delete if a file removal fails; just log
          console.warn("Failed to remove attached file:", url, e.message || e);
        }
      }
    }

    await report.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ message: "Failed to delete report" });
  }
};

/* ================= REVIEW (ADMIN) ================= */
exports.reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStatus, adminComment } = req.body || {};

    const r = await Report.findById(id);
    if (!r) return res.status(404).json({ message: "Not found" });

    r.reviewStatus = reviewStatus;
    r.adminComment = adminComment;
    await r.save();

    res.json({ report: r.toJSON() });
  } catch (err) {
    console.error("Review report error:", err);
    res.status(500).json({ message: "Failed to review report" });
  }
};
