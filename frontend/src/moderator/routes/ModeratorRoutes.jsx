import { Routes, Route, Navigate } from "react-router-dom";

import PendingNotes from "../pages/PendingNotes";
import ModeratedNotes from "../pages/ModeratedNotes";

import StudentLayout from "../../app/layout/StudentLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { getUserRole } from "../../services/auth";

import Home from "../../app/pages/Home";
import UploadNote from "../../app/pages/UploadNote";
import SavedNotes from "../../app/pages/SavedNotes";
import FreedomWall from "../../app/pages/FreedomWall";
import Profile from "../../app/pages/Profile";

function ModeratorGuard({ children }) {
  const role = getUserRole();
  if (role !== "moderator") {
    return <Navigate to="/app/home" replace />;
  }
  return children;
}

export default function ModeratorRoutes() {
  return (
    <ProtectedRoute>
      <ModeratorGuard>
        <Routes>
          <Route element={<StudentLayout />}>
            {/* DEFAULT */}
            <Route index element={<Navigate to="home" replace />} />

            {/* STUDENT FEATURES */}
            <Route path="home" element={<Home />} />
            <Route path="upload" element={<UploadNote />} />
            <Route path="bookmarks" element={<SavedNotes />} />
            <Route path="freedom-wall" element={<FreedomWall />} />
            <Route path="profile" element={<Profile />} />

            {/* MODERATOR REVIEW */}
            <Route path="pending" element={<PendingNotes />} />
            <Route path="moderated" element={<ModeratedNotes />} />
          </Route>
        </Routes>
      </ModeratorGuard>
    </ProtectedRoute>
  );
}
