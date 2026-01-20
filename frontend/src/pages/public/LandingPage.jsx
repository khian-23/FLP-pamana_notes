import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import BSIT from "../../assets/bsit-logo.png";
import BSAB from "../../assets/bsab-logo.png";
import BSHM from "../../assets/bshm-logo.png";
import BSED from "../../assets/bsed-beed-logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Grid container spacing={5} alignItems="center" py={8}>
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Typography variant="h5">
              Welcome to Pamana Notes, Cenpilians!
            </Typography>

            <Typography color="text.secondary">
              Pamana Notes is a centralized hub for academic resources at
              CPSU Hinigaran. Download lecture materials, PDFs, and study
              guides shared by fellow students.
            </Typography>

            <Button
              variant="contained"
              size="large"
              sx={{ width: 180 }}
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            display="flex"
            gap={3}
            justifyContent="center"
            flexWrap="wrap"
            p={3}
            sx={{ backgroundColor: "background.paper" }}
          >
            {[BSIT, BSAB, BSHM, BSED].map((logo, i) => (
              <Box
                key={i}
                component="img"
                src={logo}
                sx={{
                  width: 80,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.15)" }
                }}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
