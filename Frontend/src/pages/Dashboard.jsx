import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext"; // ✅ FIX
import { Role } from "../types"; // ✅ make sure src/types.js exists

import {
  Users,
  CheckCircle,
  Clock,
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth(); // ✅ now defined
  const [dash, setDash] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // ✅ if your api() already uses base "/api", then "/dashboard" is correct
        // else change to: await api("/api/dashboard")
        const data = await api("/dashboard");
        setDash(data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setDash(null);
      }
    })();
  }, []);

  if (!dash) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
      </div>
    );
  }

  const isAdmin = dash.isAdmin || user?.role === Role.ADMIN;

  const stats = isAdmin
    ? [
        {
          label: "Total Interns",
          value: dash.stats?.totalInterns ?? 0,
          icon: Users,
          color: "bg-slate-800",
        },
        {
          label: "Pending Reports",
          value: dash.stats?.pendingReportsCount ?? 0,
          icon: Clock,
          color: "bg-slate-600",
        },
        {
          label: "Tasks Completed",
          value: dash.stats?.tasksCompleted ?? 0,
          icon: CheckCircle,
          color: "bg-emerald-600",
        },
        {
          label: "Upcoming Meetings",
          value: dash.stats?.upcomingMeetingsCount ?? 0,
          icon: Calendar,
          color: "bg-indigo-600",
        },
      ]
    : [
        {
          label: "My Total Tasks",
          value: dash.stats?.myTotalTasks ?? 0,
          icon: CheckCircle,
          color: "bg-slate-800",
        },
        {
          label: "In Progress",
          value: dash.stats?.myInProgress ?? 0,
          icon: Clock,
          color: "bg-slate-500",
        },
        {
          label: "Report Status",
          value: dash.stats?.todayReportStatus ?? "Not Submitted",
          icon: MessageSquare,
          color:
            dash.stats?.todayReportStatus &&
            dash.stats?.todayReportStatus !== "Not Submitted"
              ? "bg-emerald-600"
              : "bg-rose-500",
        },
        {
          label: "Meetings",
          value: dash.stats?.myMeetingsCount ?? 0,
          icon: Calendar,
          color: "bg-indigo-600",
        },
      ];

  const chartData = dash.chartData || [];
  const announcements = dash.announcements || [];
  const nextMeeting = dash.nextMeeting || null;
  const activity = dash.activity || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-gray-400 text-sm">
            Overview of current internship activities.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm flex items-center">
          <Calendar size={14} className="mr-2" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4"
          >
            <div className={`p-2.5 rounded-lg ${stat.color} text-white`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-xl font-extrabold text-slate-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              Tasks Distribution
            </h2>
            <TrendingUp size={16} className="text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="value"
                  fill="#1e293b"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center">
            <AlertCircle size={16} className="mr-2 text-slate-400" />
            Announcements
          </h2>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id || ann._id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <h3 className="text-xs font-bold text-slate-800">
                  {ann.title}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                  {ann.message}
                </p>
              </div>
            ))}

            {announcements.length === 0 && (
              <p className="text-gray-400 text-xs italic">No new notices.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center">
            <Calendar size={16} className="mr-2 text-slate-400" />
            Upcoming Event
          </h2>

          {nextMeeting ? (
            <div className="flex gap-4">
              <div className="w-16 h-16 flex flex-col justify-center items-center bg-slate-900 text-white rounded-xl shadow-lg flex-shrink-0">
                <span className="text-xl font-bold">
                  {new Date(nextMeeting.meetingDateTime).getDate()}
                </span>
                <span className="text-[10px] uppercase font-medium">
                  {new Date(nextMeeting.meetingDateTime).toLocaleString(
                    "en-US",
                    {
                      month: "short",
                    }
                  )}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-md font-bold text-slate-900">
                  {nextMeeting.title}
                </h3>

                <div className="flex items-center mt-1 text-[11px] text-slate-500 font-medium">
                  <Clock size={12} className="mr-1" />
                  <span>
                    {new Date(nextMeeting.meetingDateTime).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="uppercase">{nextMeeting.status}</span>
                </div>

                {nextMeeting.meetingLink && (
                  <a
                    href={nextMeeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center mt-3 text-xs font-bold text-slate-900 hover:underline"
                  >
                    Join Session <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-xs">No upcoming sessions.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">
            {isAdmin ? "Intern Activity" : "Recent Work"}
          </h2>

          <div className="space-y-3">
            {activity.slice(0, 4).map((item) => {
              const isGood =
                item.status === "DONE" ||
                item.status === "APPROVED" ||
                item.reviewStatus === "APPROVED";

              return (
                <div
                  key={item.id || item._id}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isGood ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {item.title || item.summary}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.userName || item.reportDate || item.dueDate}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isGood
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status || item.reviewStatus}
                  </span>
                </div>
              );
            })}

            {activity.length === 0 && (
              <p className="text-gray-400 text-xs italic">
                No recent activity yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
