import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../services/auth";

export default function AdminProtectedRoute({ children }) {
  // Not logged in
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  // Admin user
  return children;
}
