import { Outlet } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";

import CPSULogo from "../assets/CPSU_Logo_NoBackground.png";

export default function PublicLayout() {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      {/* HEADER */}
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={3}
        >
          <Typography variant="h4">Pamana Notes</Typography>
          <Box component="img" src={CPSULogo} sx={{ width: 80 }} />
        </Box>
      </Container>

      {/* PAGE CONTENT */}
      <Box flexGrow={1}>
        <Outlet />
      </Box>

      {/* FOOTER */}
      <Box
        textAlign="center"
        py={2}
        sx={{ backgroundColor: "background.paper" }}
      >
        <Typography fontSize={12} color="text.secondary">
          © 2026 Pamana Notes. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}
