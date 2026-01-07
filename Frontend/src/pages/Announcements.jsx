import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Role } from "../data/constants";
import { Megaphone, Plus, Calendar, Trash2, X } from "lucide-react";

export default function Announcements() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", message: "" });

  /* ================= LOAD FROM BACKEND ================= */
  const fetchAnnouncements = async () => {
    try {
      const res = await api("/announcements"); // 🔥 PUBLIC API
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  /* ================= CREATE (ADMIN) ================= */
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api("/announcements", {
        method: "POST",
        body: {
          title: newAnn.title,
          message: newAnn.message,
        },
      });

      setShowModal(false);
      setNewAnn({ title: "", message: "" });
      fetchAnnouncements(); // 🔁 reload list
    } catch (err) {
      console.error("Create announcement failed:", err);
    }
  };

  /* ================= DELETE (ADMIN) ================= */
  const handleDelete = async (id) => {
    try {
      await api(`/announcements/${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (err) {
      console.error("Delete announcement failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Public Notices
          </h1>
          <p className="text-xs text-gray-400">
            Company-wide updates and important orientation info.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm font-bold"
          >
            <Plus size={16} className="mr-2" />
            New Notice
          </button>
        )}
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 relative group overflow-hidden border-l-4 border-l-slate-900"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-900 border border-slate-100 mr-5">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {ann.title}
                  </h3>
                  <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    <Calendar size={10} className="mr-1.5" />
                    {new Date(ann.createdAt).toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pl-[68px]">
              {ann.message}
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <p className="text-sm text-slate-400">
            No announcements found.
          </p>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold text-sm uppercase tracking-widest">
                Create Notice
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newAnn.title}
                  onChange={(e) =>
                    setNewAnn({ ...newAnn, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-slate-900 text-sm"
                  placeholder="Short, clear title..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={newAnn.message}
                  onChange={(e) =>
                    setNewAnn({ ...newAnn, message: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-slate-900 text-sm min-h-[150px]"
                  placeholder="Provide all necessary details..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-sm shadow-lg"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
