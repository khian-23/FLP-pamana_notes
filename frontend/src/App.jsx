import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import NoteDetail from "./pages/NoteDetail";

import AdminLayout from "./admin/layout/AdminLayout";
import AdminGuard from "./components/AdminGuard";

import StudentLayout from "./app/layout/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./app/pages/Home";
import MyNotes from "./app/pages/MyNotes";
import UploadNote from "./app/pages/UploadNote";
import Bookmarks from "./app/pages/Bookmarks";
import FreedomWall from "./app/pages/FreedomWall";
import Profile from "./app/pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* STUDENT (PROTECTED) */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="my-notes" element={<MyNotes />} />
          <Route path="upload" element={<UploadNote />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="freedom-wall" element={<FreedomWall />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
