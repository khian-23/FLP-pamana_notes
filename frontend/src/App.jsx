import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import NoteDetail from "./pages/NoteDetail";

import AdminRoutes from "./admin/routes/AdminRoutes";
import ModeratorRoutes from "./moderator/routes/ModeratorRoutes";

import StudentLayout from "./app/layout/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./app/pages/Home";
import Dashboard from "./app/pages/Dashboard";
import MyNotes from "./app/pages/MyNotes";
import UploadNote from "./app/pages/UploadNote";
import SavedNotes from "./app/pages/SavedNotes";
import FreedomWall from "./app/pages/FreedomWall";
import Profile from "./app/pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ================= STUDENT ================= */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="my-notes" element={<MyNotes />} />
          <Route path="upload" element={<UploadNote />} />
          <Route path="bookmarks" element={<SavedNotes />} />
          <Route path="freedom-wall" element={<FreedomWall />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ================= MODERATOR (FACULTY) ================= */}
        <Route
          path="/moderator/*"
          element={
            <ProtectedRoute allowedRoles={["moderator", "admin"]}>
              <ModeratorRoutes />
            </ProtectedRoute>
          }
        />


        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
