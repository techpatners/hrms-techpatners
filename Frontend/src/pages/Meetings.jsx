import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Role, MeetingStatus } from "../data/constants";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Users as UsersIcon,
  ExternalLink,
  X,
} from "lucide-react";

export default function Meetings() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    dateTime: "",
    duration: 30,
    link: "",
  });

  /* ================= LOAD ================= */
  const fetchMeetings = async () => {
    try {
      const res = await api("/meetings");
      setMeetings(res.meetings || []);
    } catch (e) {
      console.error("Failed to load meetings", e);
      setMeetings([]);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  /* ================= CREATE (ADMIN) ================= */
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      await api("/meetings", {
        method: "POST",
        body: {
          title: newMeeting.title,
          description: newMeeting.description,
          meetingDateTime: newMeeting.dateTime,
          durationMin: newMeeting.duration,
          meetingLink: newMeeting.link,
        },
      });

      setShowModal(false);
      setNewMeeting({
        title: "",
        description: "",
        dateTime: "",
        duration: 30,
        link: "",
      });

      fetchMeetings();
    } catch (e) {
      console.error("Failed to create meeting", e);
    }
  };

  const visibleMeetings = isAdmin ? meetings : meetings.filter(() => true); // interns see all

  const getAttendeesCount = (m) => {
    if (Array.isArray(m.attendees)) return m.attendees.length;
    if (typeof m.attendeesCount === "number") return m.attendeesCount;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Meeting Schedule
          </h1>
          <p className="text-xs text-gray-400">
            Synchronous sessions and review meetings.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm font-bold"
          >
            <Plus size={16} className="mr-2" />
            Schedule Session
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMeetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all"
          >
            <div className="bg-slate-50 p-6 flex items-center justify-between border-b">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Video size={20} />
              </div>

              <span className="inline-flex items-center justify-center h-7 text-[9px] font-extrabold uppercase px-3 rounded-full bg-slate-900 text-white leading-none">
                {meeting.status || MeetingStatus.SCHEDULED}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <h3 className="font-bold">{meeting.title}</h3>
              <p className="text-xs text-slate-400">{meeting.description}</p>

              <div className="text-xs text-slate-600 font-bold space-y-2">
                <div className="flex items-center">
                  <Calendar size={12} className="mr-2" />
                  {new Date(meeting.meetingDateTime).toLocaleDateString()}
                </div>

                <div className="flex items-center">
                  <Clock size={12} className="mr-2" />
                  {meeting.durationMin} min
                </div>

                <div className="flex items-center">
                  <UsersIcon size={12} className="mr-2" />
                  {getAttendeesCount(meeting)} Participants
                </div>
              </div>

              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
                >
                  Join Meeting <ExternalLink size={10} className="ml-1.5" />
                </a>
              )}
            </div>
          </div>
        ))}

        {visibleMeetings.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-slate-400 text-sm">
            No meetings found.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-slate-900 px-6 py-4 flex justify-between text-white">
              <h2 className="font-bold text-sm uppercase">Schedule Meeting</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-8 space-y-5">
              <input
                className="w-full border p-2.5 rounded-xl"
                placeholder="Title"
                value={newMeeting.title}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, title: e.target.value })
                }
                required
              />
              <textarea
                className="w-full border p-2.5 rounded-xl"
                placeholder="Agenda"
                value={newMeeting.description}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, description: e.target.value })
                }
                required
              />
              <input
                type="datetime-local"
                className="w-full border p-2.5 rounded-xl"
                value={newMeeting.dateTime}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, dateTime: e.target.value })
                }
                required
              />
              <input
                type="number"
                className="w-full border p-2.5 rounded-xl"
                value={newMeeting.duration}
                onChange={(e) =>
                  setNewMeeting({
                    ...newMeeting,
                    duration: parseInt(e.target.value, 10),
                  })
                }
                required
              />
              <input
                className="w-full border p-2.5 rounded-xl"
                placeholder="Meeting Link"
                value={newMeeting.link}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, link: e.target.value })
                }
              />

              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">
                Schedule Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
