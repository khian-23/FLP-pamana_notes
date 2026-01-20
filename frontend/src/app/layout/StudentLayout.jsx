import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";

export default function StudentLayout() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7f6" }}>
      {isMobile ? (
        <Drawer open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 260 } }}>
          <StudentSidebar onNavigate={() => setOpen(false)} />
        </Drawer>
      ) : (
        <StudentSidebar />
      )}

      <Box sx={{ flexGrow: 1 }}>
        <StudentTopbar onMenuClick={() => setOpen(true)} />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
