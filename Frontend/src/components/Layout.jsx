import React, { useMemo, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users as UsersIcon,
  Calendar,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Role } from "../constants/enums";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
        roles: [Role.ADMIN, Role.INTERN],
      },
      {
        name: "Tasks",
        path: "/tasks",
        icon: CheckSquare,
        roles: [Role.ADMIN, Role.INTERN],
      },
      {
        name: "Reports",
        path: "/reports",
        icon: FileText,
        roles: [Role.ADMIN, Role.INTERN],
      },
      { name: "Users", path: "/users", icon: UsersIcon, roles: [Role.ADMIN] },
      {
        name: "Meetings",
        path: "/meetings",
        icon: Calendar,
        roles: [Role.ADMIN, Role.INTERN],
      },
      {
        name: "Announcements",
        path: "/announcements",
        icon: Bell,
        roles: [Role.ADMIN, Role.INTERN],
      },
    ],
    []
  );

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">
            techpatners<span className="text-slate-400">HRMS</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div
            className="flex items-center p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <img
              src={user?.avatar || "https://picsum.photos/200"}
              alt="Avatar"
              className="w-8 h-8 rounded-full mr-3 border-2 border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={16} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <h1 className="text-lg font-bold">
          techpatners<span className="text-slate-400">HRMS</span>
        </h1>
        <button onClick={() => setIsMobileMenuOpen((v) => !v)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-40 pt-20 px-6">
          <nav className="space-y-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center text-xl text-slate-100"
                >
                  <Icon size={24} className="mr-4" />
                  {item.name}
                </NavLink>
              );
            })}
            <div className="pt-8 border-t border-slate-800 space-y-4">
              <NavLink
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center text-xl text-slate-100"
              >
                <UserIcon size={24} className="mr-4" />
                My Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center text-xl text-red-400"
              >
                <LogOut size={24} className="mr-4" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
