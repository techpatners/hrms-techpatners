const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/announcementsController");
const { auth, adminOnly } = require("../middlewares/authMiddleware");

// ✅ PUBLIC (ADMIN + INTERN)
router.get("/", ctrl.list);

// 🔒 ADMIN ONLY
router.post("/", auth, adminOnly, ctrl.create);
router.delete("/:id", auth, adminOnly, ctrl.remove);

module.exports = router;
