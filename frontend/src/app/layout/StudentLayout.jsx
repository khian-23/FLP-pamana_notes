import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import StudentSidebar from "./StudentSidebar";
import ModeratorSidebar from "../../moderator/layout/ModeratorSidebar";
import StudentTopbar from "./StudentTopbar";
import { getUserRole } from "../../services/auth";

export default function StudentLayout() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [open, setOpen] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);

  const role = getUserRole();
  const Sidebar =
    role === "moderator" ? ModeratorSidebar : StudentSidebar;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7f6" }}>
      {isMobile ? (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{ sx: { width: 260 } }}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </Drawer>
      ) : (
        <Sidebar />
      )}

      <Box sx={{ flexGrow: 1 }}>
        <StudentTopbar onMenuClick={() => setOpen(true)} />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet context={{ savedVersion, setSavedVersion }} />
        </Box>
      </Box>
    </Box>
  );
}
