import { createBrowserRouter, Navigate } from "react-router";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";

import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";

import ResumeBuilder from "./features/resume/pages/ResumeBuilder";
import Dashboard from "./features/resume/pages/Dashboard";
import Templates from "./features/resume/pages/Templates";

import Mock from "./features/mock/pages/mock";

import AdminDashboard from "./features/admin/pages/AdminDashboard";

import UserDashboard from "./features/dashboard/pages/UserDashboard";
import ReportPage from "./features/dashboard/pages/ReportPage";

export const router = createBrowserRouter([
  // ================= AUTH =================
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // ================= HOME =================
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },

  // ================= INTERVIEW =================
  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />
      </Protected>
    ),
  },

  // ================= MOCK =================
  {
    path: "/mock",
    element: (
      <Protected>
        <Mock />
      </Protected>
    ),
  },
  {
    path: "/mock/:interviewId",
    element: (
      <Protected>
        <Mock />
      </Protected>
    ),
  },

  // ================= ADMIN =================
  {
    path: "/admin",
    element: (
      <Protected>
        <AdminDashboard />
      </Protected>
    ),
  },

  // ================= USER DASHBOARD =================
  {
    path: "/dashboard",
    element: (
      <Protected>
        <UserDashboard />
      </Protected>
    ),
  },

  {
    path: "/dashboard/report",
    element: (
      <Protected>
        <ReportPage />
      </Protected>
    ),
  },

  // ================= RESUME FEATURE =================

  // Resume Dashboard
  {
    path: "/resume-dashboard",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },

  // Resume Builder
  {
    path: "/resume",
    element: (
      <Protected>
        <ResumeBuilder />
      </Protected>
    ),
  },

  // Resume Builder with ID
  {
    path: "/resume/:id",
    element: (
      <Protected>
        <ResumeBuilder />
      </Protected>
    ),
  },

  // Resume Templates
  {
    path: "/templates",
    element: (
      <Protected>
        <Templates />
      </Protected>
    ),
  },

  // ================= FALLBACK =================
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);