const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tasksController");
const { auth, adminOnly } = require("../middlewares/authMiddleware");

// 🔐 All task routes require login
router.use(auth);

// 👀 Admin → all tasks | Intern → only assigned tasks
router.get("/", ctrl.listTasks);

// ➕ Create task (ADMIN only)
router.post("/", adminOnly, ctrl.createTask);

// 🔄 Update task status (ADMIN or assigned INTERN)
router.patch("/:id/status", ctrl.updateStatus);

module.exports = router;
