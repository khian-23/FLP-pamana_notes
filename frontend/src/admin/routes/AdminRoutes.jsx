import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/Dashboard";
import PendingNotes from "../pages/PendingNotes";
import Users from "../pages/Users";
import ModeratedNotes from "../pages/ModeratedNotes";
import { getAccessToken, isAdmin } from "../../services/auth";

export default function AdminRoutes() {
  const token = getAccessToken();

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* INDEX = /admin */}
        <Route index element={<Dashboard />} />

        {/* /admin/notes */}
        <Route path="notes" element={<PendingNotes />} />

        {/* /admin/users */}
        <Route path="users" element={<Users />} />

        {/* /admin/moderated-notes */}
        <Route path="moderated-notes" element={<ModeratedNotes />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}