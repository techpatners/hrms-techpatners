// Backend/routes/reports.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const reportsCtrl = require("../controllers/reportsController");
const { auth, adminOnly } = require("../middlewares/authMiddleware");

// storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, "..", "uploads", "reports");
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ts = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${ts}_${safeName}`);
  },
});
const upload = multer({ storage });

// All routes require auth
router.use(auth);

// upload files (authenticated users)
router.post("/upload", upload.array("files", 10), reportsCtrl.uploadFiles);

// list/create
router.get("/", reportsCtrl.listReports);
router.post("/", reportsCtrl.createReport);

// admin delete and review
router.delete("/:id", auth, adminOnly, reportsCtrl.deleteReport);
router.patch("/:id/review", auth, adminOnly, reportsCtrl.reviewReport);

module.exports = router;
