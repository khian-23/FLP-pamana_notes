import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";

import Dashboard from "../pages/Dashboard";
import PendingNotes from "../pages/PendingNotes";
import Users from "../pages/Users";
import ModeratedNotes from "../pages/ModeratedNotes";

import { isAuthenticated, isAdmin } from "../../services/auth";

const AdminRoutes = () => {
  // 🔒 Not logged in or token expired
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Logged in but not admin
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Notes moderation */}
        <Route path="notes" element={<PendingNotes />} />
        <Route path="moderated-notes" element={<ModeratedNotes />} />

        {/* User management */}
        <Route path="users" element={<Users />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
