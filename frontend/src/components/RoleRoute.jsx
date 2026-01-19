import { Navigate } from "react-router-dom";
import { hasRole } from "../services/auth";

function RoleRoute({ role, children }) {
  return hasRole(role) ? children : <Navigate to="/dashboard" replace />;
}

export default RoleRoute;
