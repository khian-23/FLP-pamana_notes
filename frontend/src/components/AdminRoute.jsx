import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../services/auth";

export default function AdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/dashboard" />;
  return children;
}
