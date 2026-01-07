import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { UserPlus, Mail, Calendar, Trash2, Search } from "lucide-react";

export default function Users() {
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    batch: "",
    team: "",
    avatar: "",
  });

  async function loadInterns() {
    setLoading(true);
    try {
      const res = await api("/admin/interns");
      setInterns(res.interns || []);
    } catch (e) {
      console.error(e);
      setInterns([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadInterns();
  }, []);

  const filtered = interns.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function createIntern(e) {
    e.preventDefault();
    const res = await api("/admin/interns", { method: "POST", body: form });

    setCreatedCreds({
      email: res.intern.email,
      tempPassword: res.tempPassword,
    });

    setShowModal(false);
    setForm({
      name: "",
      email: "",
      password: "",
      batch: "",
      team: "",
      avatar: "",
    });
    loadInterns();
  }

  async function deleteIntern(id) {
    if (!confirm("Delete this intern?")) return;
    await api(`/admin/interns/${id}`, { method: "DELETE" });
    loadInterns();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Talent Pool
          </h1>
          <p className="text-xs text-gray-400">
            Admin creates interns. No public register.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm font-bold"
        >
          <UserPlus size={16} className="mr-2" />
          Onboard Intern
        </button>
      </div>

      {createdCreds && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-sm">
          <p className="font-bold text-emerald-800">Intern Created ✅</p>
          <p className="text-emerald-700 mt-1">
            Email: <b>{createdCreds.email}</b> | Temp Password:{" "}
            <b>{createdCreds.tempPassword}</b>
          </p>
          <button
            onClick={() => setCreatedCreds(null)}
            className="mt-2 text-emerald-800 underline text-xs font-bold"
          >
            Hide
          </button>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 outline-none text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Intern
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-slate-400" colSpan="4">
                    Loading...
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      <Mail size={12} className="inline mr-2 text-slate-400" />
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      <Calendar
                        size={12}
                        className="inline mr-2 text-slate-400"
                      />
                      {new Date(u.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteIntern(u._id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-sm text-slate-400" colSpan="4">
                    No interns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-sm font-bold uppercase tracking-widest">
                Create Intern
              </h2>
              <button onClick={() => setShowModal(false)} className="font-bold">
                X
              </button>
            </div>
            <form onSubmit={createIntern} className="p-6 space-y-4">
              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Password (optional)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Batch (optional)"
                value={form.batch}
                onChange={(e) => setForm({ ...form, batch: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Team (optional)"
                value={form.team}
                onChange={(e) => setForm({ ...form, team: e.target.value })}
              />

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
