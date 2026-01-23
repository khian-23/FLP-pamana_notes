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
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        color: "#0b6623",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography fontWeight="bold">
            Pamana Notes
          </Typography>

          {role === "moderator" && (
            <>
              <Chip
                label="Moderator"
                size="small"
                color="success"
                variant="outlined"
              />
              {course && (
                <Chip
                  label={course}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              )}
            </>
          )}
        </Box>

        <Button
          variant="outlined"
          color="success"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
