import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/Dashboard";
import PendingNotes from "../pages/PendingNotes";
import Users from "../pages/Users";
import ModeratedNotes from "../pages/ModeratedNotes";

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes" element={<PendingNotes />} />
        <Route path="/users" element={<Users />} />
        <Route path="moderated-notes" element={<ModeratedNotes />} />

      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
