import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  isAuthenticated,
  refreshAccessToken,
  logout,
} from "../services/auth";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      // ✅ Access token exists and valid
      if (isAuthenticated()) {
        setAllowed(true);
        setChecking(false);
        return;
      }

      // 🔄 Try refresh once
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        setAllowed(true);
      } else {
        logout();
        setAllowed(false);
      }

      setChecking(false);
    }

    verifyAuth();
  }, []);

  // ⏳ Prevent page flash while checking auth
  if (checking) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 🔒 Not authenticated → login
  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
