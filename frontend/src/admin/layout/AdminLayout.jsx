import { useState } from "react";
import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const drawerWidth = 240;

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(prev => !prev);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {/* SIDEBAR */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          <AdminSidebar onNavigate={toggleDrawer} />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <AdminSidebar />
        </Drawer>
      )}

      {/* MAIN */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AdminTopbar isMobile={isMobile} onMenuClick={toggleDrawer} />

        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: "#f9fafb",
          }}
        >
          {/* 👇 THIS FIXES THE BLANK PAGE */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
