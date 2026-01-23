import {
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { getUserRole } from "../../services/auth";

const AdminSidebar = ({ onNavigate }) => {
  const location = useLocation();
  const role = getUserRole();

  const navItem = (to, label) => (
    <ListItemButton
      component={Link}
      to={to}
      selected={location.pathname.startsWith(to)}
      onClick={onNavigate}
      sx={{
        borderRadius: 1,
        mx: 1,
        my: 0.5,
      }}
    >
      <ListItemText primary={label} />
    </ListItemButton>
  );

  const isAdmin = role === "admin";
  const isModerator = role === "moderator";

  return (
    <Box sx={{ width: 240 }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          {isAdmin ? "Admin Panel" : "Moderator Panel"}
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1 }}>
        {/* ADMIN ONLY */}
        {isAdmin && navItem("/admin", "Dashboard")}

        {/* REVIEWER (ADMIN + MODERATOR) */}
        {(isAdmin || isModerator) && navItem("/admin/notes", "Pending Notes")}
        {(isAdmin || isModerator) &&
          navItem("/admin/moderated-notes", "Moderated Notes")}

        {/* ADMIN ONLY */}
        {isAdmin && navItem("/admin/users", "Users")}
        {isAdmin && navItem("/admin/reports", "Reports")}
        {isAdmin && navItem("/admin/settings", "Settings")}
      </List>
    </Box>
  );
};

export default AdminSidebar;
