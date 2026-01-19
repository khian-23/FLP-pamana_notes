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

const AdminSidebar = ({ onNavigate }) => {
  const location = useLocation();

  const navItem = (to, label) => (
    <ListItemButton
      component={Link}
      to={to}
      selected={location.pathname === to}
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

  return (
    <Box sx={{ width: 240 }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Admin Panel
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1 }}>
        {navItem("/admin", "Dashboard")}
        {navItem("/admin/pending-notes", "Pending Notes")}
        {navItem("/admin/moderated-notes", "Moderated Notes")}
        {navItem("/admin/users", "Users")}
        {navItem("/admin/reports", "Reports")}
        {navItem("/admin/settings", "Settings")}
      </List>
    </Box>
  );
};

export default AdminSidebar;