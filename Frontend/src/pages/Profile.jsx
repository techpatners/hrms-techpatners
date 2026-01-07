import React from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Calendar, Shield, MapPin, Briefcase } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="h-40 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="p-1.5 bg-white rounded-[2rem] shadow-2xl">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-[1.8rem] object-cover bg-slate-100"
              />
            </div>

            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-xs shadow-lg transform active:scale-95">
              Update Profile
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {user.name}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              {user.role} | techpatners CORE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-10 border-t border-slate-100">
            <div className="space-y-8">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                <span className="w-8 h-[1px] bg-slate-200 mr-3" />
                Credentials
              </h2>

              <div className="space-y-6">
                <div className="flex items-center group">
                  <div className="p-3 bg-slate-50 rounded-2xl mr-5 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                      Email Address
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center group">
                  <div className="p-3 bg-slate-50 rounded-2xl mr-5 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                      Onboarded Since
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {new Date(user.joinDate).toLocaleDateString("en-US", {
                        dateStyle: "long",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center group">
                  <div className="p-3 bg-slate-50 rounded-2xl mr-5 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                      Access Level
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                <span className="w-8 h-[1px] bg-slate-200 mr-3" />
                Assignment
              </h2>

              <div className="space-y-6">
                <div className="flex items-center group">
                  <div className="p-3 bg-slate-50 rounded-2xl mr-5 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                      Active Unit
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {user.team || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center group">
                  <div className="p-3 bg-slate-50 rounded-2xl mr-5 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                      Cohort Group
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {user.batch || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Future: Update Profile Modal */}
        </div>
      </div>
    </div>
  );
}
