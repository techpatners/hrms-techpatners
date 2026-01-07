import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Meetings from "./pages/Meetings";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import { Role } from "./constants/enums";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="reports" element={<Reports />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="profile" element={<Profile />} />

            <Route
              path="users"
              element={
                <ProtectedRoute roles={[Role.ADMIN]}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
