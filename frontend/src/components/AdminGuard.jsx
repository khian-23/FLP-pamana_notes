import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../services/auth";

export default function AdminGuard() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
