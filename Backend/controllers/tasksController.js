const Task = require("../models/Task");
const User = require("../models/User");

/* ================= GET TASKS ================= */
exports.listTasks = async (req, res) => {
  try {
    const isAdmin = req.user.role === "ADMIN";

    const filter = isAdmin
      ? {}
      : { assignedTo: req.user.id };

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // 🔥 Normalize response for frontend
    const normalizedTasks = tasks.map(t => ({
      ...t,
      id: t._id.toString(),
      assignedTo: t.assignedTo?.toString(),
      assignedBy: t.assignedBy?.toString(),
      assignedToName: t.assignedToName || "",
    }));

    res.json({ tasks: normalizedTasks });
  } catch (err) {
    console.error("List tasks error:", err);
    res.status(500).json({ message: "Failed to load tasks" });
  }
};

const ALLOWED_STATUS = ["Pending", "In Progress", "Done"];

exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({
      message: "Invalid status value",
    });
  }

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (
    req.user.role !== "ADMIN" &&
    String(task.assignedTo) !== String(req.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  task.status = status;
  await task.save();

  res.json({ ok: true });
};

/* ================= CREATE TASK (ADMIN) ================= */
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body || {};

    if (!title || !assignedTo) {
      return res.status(400).json({ message: "title & assignedTo required" });
    }

    // 🔥 validate assigned user
    const intern = await User.findById(assignedTo).lean();
    if (!intern) {
      return res.status(400).json({ message: "Invalid intern selected" });
    }

    const task = new Task({
      title,
      description,
      assignedTo: intern._id,
      assignedToName: intern.name,
      assignedBy: req.user.id,
      dueDate,
      priority,
    });

    await task.save();

    res.json({
      task: task.toJSON(), // already contains id
    });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};
