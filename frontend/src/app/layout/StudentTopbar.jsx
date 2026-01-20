import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";

export default function StudentTopbar({ onMenuClick }) {
  const navigate = useNavigate();

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
