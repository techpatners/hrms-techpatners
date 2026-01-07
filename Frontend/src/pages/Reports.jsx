// Frontend/src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Role, ReportStatus } from "../data/constants";
import {
  Send,
  Clock,
  Github,
  Check,
  XCircle,
  MessageSquare,
  Calendar,
  X,
  Trash2,
  ExternalLink,
  DownloadCloud,
} from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const [reports, setReports] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewComment, setReviewComment] = useState("");

  const [newReport, setNewReport] = useState({
    summary: "",
    hoursSpent: 8,
    githubLink: "",
    attachmentsFiles: [], // local File objects
  });

  const fetchReports = async () => {
    try {
      const res = await api("/reports");
      setReports(res.reports || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // helper: upload files to server
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return [];
    const form = new FormData();
    for (let i = 0; i < files.length; i++) form.append("files", files[i]);

    const res = await api("/reports/upload", {
      method: "POST",
      body: form,
    });
    return res.urls || [];
  };

  // create report
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    try {
      // 1) upload attachments first
      let attachmentUrls = [];
      if (newReport.attachmentsFiles?.length > 0) {
        attachmentUrls = await uploadFiles(newReport.attachmentsFiles);
      }

      // 2) create report
      await api("/reports", {
        method: "POST",
        body: {
          reportDate: new Date().toISOString().split("T")[0],
          summary: newReport.summary,
          hoursSpent: newReport.hoursSpent,
          githubLinks: newReport.githubLink ? [newReport.githubLink] : [],
          attachments: attachmentUrls,
        },
      });

      setShowSubmitModal(false);
      setNewReport({ summary: "", hoursSpent: 8, githubLink: "", attachmentsFiles: [] });
      fetchReports();
    } catch (err) {
      console.error("Failed to submit report:", err);
      // if server returned readable message -> show it
      alert(err.message || "Failed to submit report");
    }
  };

  // review
  const handleReview = async (reportId, status) => {
    try {
      await api(`/reports/${reportId}/review`, {
        method: "PATCH",
        body: {
          reviewStatus: status,
          adminComment: reviewComment,
        },
      });
      setSelectedReport(null);
      setReviewComment("");
      fetchReports();
    } catch (err) {
      console.error("Failed to review report:", err);
      alert("Failed to review");
    }
  };

  // delete
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await api(`/reports/${reportId}`, { method: "DELETE" });
      fetchReports();
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert(err.message || "Failed to delete report");
    }
  };

  const filteredReports = isAdmin
    ? reports
    : reports.filter((r) => String(r.userId) === String(user?.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work Journals</h1>
          <p className="text-xs text-gray-400">Daily progress reports and effort tracking.</p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm font-bold"
          >
            <Send size={16} className="mr-2" />
            Submit Journal
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                {isAdmin && <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intern</th>}
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Summary</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Effort</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id || report._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">{report.reportDate}</td>

                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white font-extrabold text-[9px] mr-2">
                          {(report.userName || "IN").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium">{report.userName}</span>
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate font-medium">{report.summary}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">{report.hoursSpent}h</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 inline-flex text-[9px] font-extrabold rounded-full border uppercase ${
                        report.reviewStatus === ReportStatus.APPROVED
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : report.reviewStatus === ReportStatus.NEEDS_CHANGES
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-slate-50 text-slate-600 border-slate-100"
                      }`}
                    >
                      {report.reviewStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                    <div className="flex justify-end gap-4 items-center">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setReviewComment(report.adminComment || "");
                        }}
                        className="text-slate-900 hover:underline"
                      >
                        {isAdmin ? "Review" : "View"}
                      </button>

                      {isAdmin && (
                        <button onClick={() => handleDeleteReport(report.id || report._id)} className="text-rose-500 hover:text-rose-700" title="Delete Report">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-10 text-center text-sm text-slate-400">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-sm font-bold uppercase tracking-widest">Work Record</h2>
              <button onClick={() => setSelectedReport(null)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b pb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-lg mr-4">{(selectedReport.userName || "I").substring(0, 1)}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Intern</p>
                    <p className="text-lg font-bold">{selectedReport.userName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Journal Date</p>
                  <p className="text-lg font-bold">{selectedReport.reportDate}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Daily Summary</h3>
                <div className="bg-slate-50 p-6 rounded-xl border text-sm whitespace-pre-wrap">{selectedReport.summary}</div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <h3 className="text-[10px] font-bold uppercase mb-2">Total Effort</h3>
                  <div className="flex items-center font-extrabold"><Clock size={16} className="mr-2" />{selectedReport.hoursSpent} Hours</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border">
                  <h3 className="text-[10px] font-bold uppercase mb-2">Deliverables</h3>
                  {selectedReport.githubLinks?.length > 0 ? (
                    selectedReport.githubLinks.map((l, i) => (
                      <a key={l + i} href={l} target="_blank" rel="noreferrer" className="flex items-center text-xs font-bold hover:underline"><Github size={12} className="mr-2" />Source Link {i + 1}</a>
                    ))
                  ) : (
                    <p className="text-xs italic text-slate-400">No links provided</p>
                  )}

                  {/* attachments */}
                  {selectedReport.attachments?.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {selectedReport.attachments.map((a) => (
                          <div key={a} className="flex items-center justify-between bg-white p-2 rounded-md border">
                            <a href={a} target="_blank" rel="noreferrer" className="text-xs font-medium truncate max-w-[80%]">
                              <ExternalLink size={12} className="inline mr-2" />
                              {a.split("/").pop()}
                            </a>
                            <a href={a} download className="text-slate-500 hover:text-slate-900"><DownloadCloud size={16} /></a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedReport.adminComment && (
                <div className="bg-slate-900 p-5 rounded-xl text-white">
                  <h3 className="text-[10px] font-bold uppercase mb-2 flex items-center"><MessageSquare size={12} className="mr-2" />Management Feedback</h3>
                  <p className="text-sm">{selectedReport.adminComment}</p>
                </div>
              )}

              {isAdmin && selectedReport.reviewStatus === ReportStatus.PENDING && (
                <div className="border-t pt-8 space-y-4">
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Provide constructive feedback..." />

                  <div className="flex gap-4">
                    <button onClick={() => handleReview(selectedReport.id || selectedReport._id, ReportStatus.NEEDS_CHANGES)} className="flex-1 py-3 border rounded-xl font-bold"><XCircle size={16} className="inline mr-2" />Revise</button>
                    <button onClick={() => handleReview(selectedReport.id || selectedReport._id, ReportStatus.APPROVED)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold"><Check size={16} className="inline mr-2" />Approve</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">New Journal Entry</h2>
              <button onClick={() => setShowSubmitModal(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">What did you achieve today?</label>
                <textarea required rows={4} value={newReport.summary} onChange={(e) => setNewReport({ ...newReport, summary: e.target.value })} className="w-full px-4 py-3 border rounded-xl" placeholder="Focus on results and outcomes..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Effort (Hours)</label>
                  <input type="number" required min="1" max="24" value={newReport.hoursSpent} onChange={(e) => setNewReport({ ...newReport, hoursSpent: parseInt(e.target.value || "0", 10) })} className="w-full px-4 py-3 border rounded-xl" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Entry Date</label>
                  <div className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-400 text-sm font-bold flex items-center"><Calendar size={14} className="mr-2" />{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deliverable URL</label>
                <input type="url" value={newReport.githubLink} onChange={(e) => setNewReport({ ...newReport, githubLink: e.target.value })} className="w-full px-4 py-3 border rounded-xl" placeholder="https://github.com/..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Attachments (optional)</label>
                <input type="file" multiple onChange={(e) => setNewReport({ ...newReport, attachmentsFiles: Array.from(e.target.files) })} className="w-full" />
                <p className="text-xs text-slate-400 mt-1">You can attach PDF, ZIP, images etc. (optional)</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 border rounded-xl">Discard</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold">Submit Journal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
