const User = require("../models/User");
const Task = require("../models/Task");
const Report = require("../models/Report");
const Meeting = require("../models/Meeting");
const Announcement = require("../models/Announcement");

exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "ADMIN";

    const totalInterns = await User.countDocuments({ role: "INTERN" });
    const pendingReportsCount = await Report.countDocuments({
      reviewStatus: "Pending",
    });

    const tasksCompleted = await Task.countDocuments({ status: "Done" });

    const upcomingMeetingsCount = await Meeting.countDocuments({
      meetingDateTime: { $gte: new Date() },
    });

    // ✅ FIXED ENUM VALUES
    const chartData = [
      { name: "Pending", value: await Task.countDocuments({ status: "Pending" }) },
      {
        name: "In Progress",
        value: await Task.countDocuments({ status: "In Progress" }),
      },
      { name: "Done", value: await Task.countDocuments({ status: "Done" }) },
    ];

    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const nextMeeting = await Meeting.findOne({
      meetingDateTime: { $gte: new Date() },
    })
      .sort({ meetingDateTime: 1 })
      .lean();

    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const activity = [
      ...recentTasks.map((t) => ({ ...t, type: "TASK" })),
      ...recentReports.map((r) => ({ ...r, type: "REPORT" })),
    ].slice(0, 8);

    const stats = isAdmin
      ? {
          totalInterns,
          pendingReportsCount,
          tasksCompleted,
          upcomingMeetingsCount,
        }
      : {
          myTotalTasks: await Task.countDocuments({ assignedTo: user.id }),
          myInProgress: await Task.countDocuments({
            assignedTo: user.id,
            status: "In Progress",
          }),
          todayReportStatus: (await Report.findOne({
            userId: user.id,
            reportDate: new Date().toISOString().split("T")[0],
          }))
            ? "Submitted"
            : "Not Submitted",
          myMeetingsCount: await Meeting.countDocuments({
            attendees: user.id,
          }),
        };

    res.json({
      isAdmin,
      stats,
      chartData,
      announcements,
      nextMeeting,
      activity,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};
