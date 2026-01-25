// src/admin/layout/Sidebar.jsx

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
        borderRadius: 2,
        mx: 1,
        my: 0.75,
        px: 2,
        py: 1.2,
        "&.Mui-selected": {
          bgcolor: "rgba(110,231,183,0.12)",
        },
        "&:hover": {
          bgcolor: "rgba(110,231,183,0.18)",
        },
      }}
    >
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontSize: "0.95rem", // 👈 slightly bigger
          fontWeight: 600,
        }}
      />
    </ListItemButton>
  );

  const isAdmin = role === "admin";
  const isModerator = role === "moderator";

  return (
    <Box sx={{ width: 260 }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700}>
          {isAdmin ? "Admin Panel" : "Moderator Panel"}
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1, mt: 1 }}>
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
