import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./admin/routes/AdminRoutes";

import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./services/auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/admin" />
              : <Navigate to="/login" />
          }
        />


        {/* Public */}
        <Route path="/login" element={<LoginPage />} />


        {/* ✅ NEW ADMIN SYSTEM (ONLY ONE) */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
