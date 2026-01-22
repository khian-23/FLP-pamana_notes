import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import NoteDetail from "./pages/NoteDetail";

import AdminLayout from "./admin/layout/AdminLayout";
import AdminGuard from "./components/AdminGuard";

import StudentLayout from "./app/layout/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./app/pages/Home";       // public notes feed
import Dashboard from "./app/pages/Dashboard";
import MyNotes from "./app/pages/MyNotes";
import UploadNote from "./app/pages/UploadNote";
import Bookmarks from "./app/pages/Bookmarks";
import FreedomWall from "./app/pages/FreedomWall";
import Profile from "./app/pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />      {/* public dashboard */}
        <Route path="/login" element={<LoginPage />} />

        {/* ================= STUDENT ================= */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          {/* ✅ THIS FIXES THE BLANK PAGE */}
          <Route index element={<Dashboard />} />

          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="my-notes" element={<MyNotes />} />
          <Route path="upload" element={<UploadNote />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="freedom-wall" element={<FreedomWall />} />
          <Route path="profile" element={<Profile />} />

          {/* safety redirect */}
          <Route path="home" element={<Navigate to="/app" replace />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
