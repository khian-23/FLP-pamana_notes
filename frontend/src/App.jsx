import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminRoutes from "./admin/routes/AdminRoutes";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

import AdminRoute from "./components/AdminRoute";
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

        {/* ADMIN (PROTECTED) */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminRoutes />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
