import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/Dashboard";
import PendingNotes from "../pages/PendingNotes";
import Users from "../pages/Users";
import ModeratedNotes from "../pages/ModeratedNotes";
import { getAccessToken, isAdmin } from "../../services/auth";

const AdminRoutes = () => {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        {/* ✅ INDEX ROUTE */}
        <Route index element={<Dashboard />} />

        {/* ✅ NESTED ROUTES */}
        <Route path="notes" element={<PendingNotes />} />
        <Route path="users" element={<Users />} />
        <Route path="moderated-notes" element={<ModeratedNotes />} />

        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
