import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import PendingNotes from "./admin/pages/PendingNotes";
import Users from "./admin/pages/Users";
import ModeratedNotes from "./admin/pages/ModeratedNotes";

import AdminGuard from "./components/AdminGuard";
import { isAuthenticated } from "./services/auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/admin" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED ADMIN */}
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="notes" element={<PendingNotes />} />
            <Route path="moderated-notes" element={<ModeratedNotes />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
