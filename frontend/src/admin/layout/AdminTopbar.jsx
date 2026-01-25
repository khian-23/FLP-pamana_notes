// src/admin/layout/AdminTopbar.jsx

import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";

export default function AdminTopbar({ isMobile, onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* LEFT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography fontWeight={700} letterSpacing="0.04em">
            PAMANA NOTES
          </Typography>

          <Chip
            label="Admin"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* RIGHT */}
        <Button
          color="error"
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            px: 2.5,
            fontWeight: 600,
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
