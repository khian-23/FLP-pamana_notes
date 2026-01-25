// src/app/layout/StudentTopbar.jsx

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { logout, getUserRole, getUserCourse } from "../../services/auth";

export default function StudentTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const role = getUserRole();
  const course = getUserCourse();

  const handleLogout = () => {
    logout();
    navigate("/");
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
      <Toolbar sx={{ justifyContent: "space-between", minHeight: 64 }}>
        {/* LEFT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography fontWeight={700} letterSpacing="0.04em">
            PAMANA NOTES
          </Typography>

          {role === "moderator" && (
            <>
              <Chip
                label="Moderator"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              {course && (
                <Chip
                  label={course}
                  size="small"
                  variant="outlined"
                  sx={{ opacity: 0.85 }}
                />
              )}
            </>
          )}
        </Box>

        {/* RIGHT */}
        <Button
          variant="outlined"
          color="success"
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
