import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Role, TaskStatus } from "../data/constants";
import {
  Plus,
  Search,
  Github,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  // ✅ Load from backend
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]); // FIXED: proper useState for interns
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
  });

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const res = await api("/tasks");
      setTasks(res.tasks || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    }
  };

  // Fetch interns (users) for assign dropdown
  const fetchInterns = async () => {
    try {
      // admin route returning { interns: [...] }
      // If your backend exposes a different endpoint, change this path accordingly.
      const res = await api("/admin/interns");
      // handle both { interns } and plain array responses
      const list = res.interns || res.users || res || [];
      setInterns(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load interns:", err);
      setInterns([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchInterns();
    } else {
      // non-admins don't need interns list; but we can still try (harmless)
      // fetchInterns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAssignedToName = (task) => {
    // backend might supply assignedToName OR assignedTo id
    if (task?.assignedToName) return task.assignedToName;
    const match = interns.find(
      (i) => String(i.id || i._id) === String(task?.assignedTo)
    );
    return match ? match.name : "";
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesRole = isAdmin ? true : String(t.assignedTo) === String(user?.id || user?._id);

    const matchesFilter = filter === "All" ? true : t.status === filter;

    const title = (t.title || "").toLowerCase();
    const description = (t.description || "").toLowerCase();
    const q = (search || "").toLowerCase();

    const matchesSearch = title.includes(q) || description.includes(q);

    return matchesRole && matchesFilter && matchesSearch;
  });

  // Create task (Admin)
  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      // basic validation
      if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
        alert("Please fill title, assignee and due date.");
        return;
      }

      await api("/tasks", {
        method: "POST",
        body: {
          title: newTask.title,
          description: newTask.description,
          assignedTo: newTask.assignedTo,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
        },
      });

      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "Medium",
      });

      await fetchTasks();
    } catch (err) {
      console.error("Failed to create task:", err);
      alert(err?.message || "Failed to create task");
    }
  };

  // Update status (Intern/Admin)
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      await fetchTasks();
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Failed to update status");
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "High":
        return "text-rose-600 bg-rose-50";
      case "Medium":
        return "text-slate-600 bg-slate-50";
      case "Low":
        return "text-gray-500 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const filterOptions = ["All", ...Object.values(TaskStatus)];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tasks Management
          </h1>
          <p className="text-xs text-gray-400">Manage and track internship tasks.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm font-bold"
          >
            <Plus size={16} className="mr-2" />
            New Assignment
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {filterOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {s === TaskStatus.PENDING ? "Pending" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => {
          const assignedName = getAssignedToName(task);
          const initials =
            (assignedName && assignedName.substring(0, 2).toUpperCase()) ||
            (task?.assignedToName && task.assignedToName.substring(0, 2).toUpperCase()) ||
            "IT";

          const taskId = task.id || task._id;

          return (
            <div
              key={taskId}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col group border-t-4 border-t-slate-900"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>

                <div className="flex items-center text-[10px] text-gray-400 font-medium">
                  <Calendar size={10} className="mr-1" />
                  {task.dueDate}
                </div>
              </div>

              <h3 className="text-md font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                {task.title}
              </h3>
              <p className="text-xs text-slate-400 mb-6 flex-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-extrabold text-[10px]">
                      {initials}
                    </div>
                    <span className="ml-2 text-[10px] font-bold text-slate-600">
                      {assignedName}
                    </span>
                  </div>

                  {task.githubLink && (
                    <a
                      href={task.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <Github size={16} />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-1 rounded-lg">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(taskId, e.target.value)}
                    className={`text-[10px] font-bold py-1 px-3 rounded-md border-none focus:ring-0 cursor-pointer bg-white shadow-sm ${
                      task.status === TaskStatus.DONE
                        ? "text-emerald-600"
                        : task.status === TaskStatus.IN_PROGRESS
                        ? "text-indigo-600"
                        : "text-slate-600"
                    }`}
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <option key={s} value={s}>
                        {s === TaskStatus.PENDING ? "Pending" : s}
                      </option>
                    ))}
                  </select>

                  <div className="pr-2">
                    {task.status === TaskStatus.DONE ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : task.status === TaskStatus.IN_PROGRESS ? (
                      <Clock size={16} className="text-indigo-500" />
                    ) : (
                      <AlertTriangle size={16} className="text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-slate-400 text-sm">
            No tasks match your filters.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">New Assignment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="e.g. Implement Sidebar Navigation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="Describe project requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Assign To
                  </label>
                  <select
                    required
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  >
                    <option value="">Select Intern</option>
                    {interns.map((i) => (
                      <option key={i.id || i._id} value={i.id || i._id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Priority Level
                </label>
                <div className="flex gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {["Low", "Medium", "High"].map((p) => (
                    <label key={p} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={newTask.priority === p}
                        onChange={() => setNewTask({ ...newTask, priority: p })}
                        className="mr-2 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-600">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm shadow-lg"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
