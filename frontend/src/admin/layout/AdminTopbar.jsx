import { AppBar, Toolbar, IconButton, Button, Typography } from "@mui/material";
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
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography sx={{ flexGrow: 1 }} variant="h6">
          Admin Panel
        </Typography>

        <Button color="error" variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
