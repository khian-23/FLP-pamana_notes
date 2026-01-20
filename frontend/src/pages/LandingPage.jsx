import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import CPSULogo from "./assets/CPSU_Logo_NoBackground.png";
import BSIT from "./assets/bsit-logo.png";
import BSAB from "./assets/bsab-logo.png";
import BSHM from "./assets/bshm-logo.png";
import BSED from "./assets/bsed-beed-logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0b6623 0%, #0f8a3b 50%, #054d19 100%)",
        color: "white"
      }}
    >
      {/* HEADER */}
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={3}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ letterSpacing: 1 }}
          >
            Pamana Notes
          </Typography>
          <Box component="img" src={CPSULogo} sx={{ width: 70 }} />
        </Box>
      </Container>

      {/* HERO */}
      <Container maxWidth="lg">
        <Grid
          container
          spacing={6}
          alignItems="center"
          py={{ xs: 6, md: 10 }}
        >
          {/* TEXT */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography
                variant="h3"
                fontWeight="bold"
                lineHeight={1.2}
              >
                Your Academic Knowledge,
                <br />
                <Box component="span" sx={{ color: "#b9f6ca" }}>
                  Preserved & Shared
                </Box>
              </Typography>

              <Typography
                fontSize={17}
                color="rgba(255,255,255,0.9)"
              >
                Pamana Notes is a centralized academic platform for
                CPSU Hinigaran students. Share notes, access learning
                materials, and help build a legacy of knowledge.
              </Typography>

              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  size="large"
                  variant="contained"
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#0b6623",
                    fontWeight: "bold",
                    px: 4,
                    borderRadius: 999,
                    "&:hover": {
                      bgcolor: "#e8f5e9"
                    }
                  }}
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </Button>

                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(255,255,255,0.6)",
                    color: "white",
                    px: 4,
                    borderRadius: 999,
                    "&:hover": {
                      borderColor: "#ffffff",
                      bgcolor: "rgba(255,255,255,0.1)"
                    }
                  }}
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* FLOATING LOGOS */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                overflow: "hidden",
                backdropFilter: "blur(12px)",
                background:
                  "rgba(255,255,255,0.08)",
                borderRadius: 4,
                p: 3
              }}
            >
              <motion.div
                style={{
                  display: "flex",
                  gap: "32px",
                  width: "max-content"
                }}
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  duration: 20,
                  ease: "linear",
                  repeat: Infinity
                }}
              >
                {[BSIT, BSAB, BSHM, BSED, BSIT, BSAB, BSHM, BSED].map(
                  (logo, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={logo}
                      sx={{
                        width: 90,
                        opacity: 0.95,
                        transition: "0.3s",
                        "&:hover": {
                          transform: "scale(1.15)"
                        }
                      }}
                    />
                  )
                )}
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* FEATURES */}
      <Container maxWidth="lg">
        <Grid container spacing={4} py={8}>
          {[
            {
              title: "Centralized Notes",
              desc: "All subjects in one trusted platform."
            },
            {
              title: "Peer Collaboration",
              desc: "Learn faster by sharing quality notes."
            },
            {
              title: "Moderated Content",
              desc: "Only approved and verified materials."
            }
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  height: "100%",
                  p: 4,
                  borderRadius: 4,
                  backdropFilter: "blur(10px)",
                  background:
                    "rgba(255,255,255,0.1)",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.15)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-6px)"
                  }
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                >
                  {item.title}
                </Typography>
                <Typography
                  fontSize={14}
                  color="rgba(255,255,255,0.85)"
                >
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FOOTER */}
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />

      <Container maxWidth="lg">
        <Grid container spacing={4} py={5}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold">
              PAMANA NOTES
            </Typography>
            <Typography fontSize={14} color="rgba(255,255,255,0.85)">
              A peer-to-peer academic sharing platform for CPSU
              students. Built to preserve knowledge.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Support</Typography>
            <Typography fontSize={14}>About Us</Typography>
            <Typography fontSize={14}>Courses</Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Contact</Typography>
            <Typography fontSize={14}>
              📍 CPSU Hinigaran Campus
            </Typography>
            <Typography fontSize={14}>
              📧 example@gmail.com
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* COPYRIGHT */}
      <Box
        textAlign="center"
        py={2}
        sx={{ bgcolor: "rgba(0,0,0,0.25)" }}
      >
        <Typography fontSize={12} color="rgba(255,255,255,0.7)">
          © 2026 Pamana Notes. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}
