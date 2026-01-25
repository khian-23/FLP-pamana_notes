import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Divider,
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
  const logos = [BSIT, BSAB, BSHM, BSED];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "white",
        background: `
          radial-gradient(circle at top right, rgba(185,246,202,0.15), transparent 40%),
          radial-gradient(circle at bottom left, rgba(14,122,47,0.25), transparent 45%),
          linear-gradient(135deg, #0b6623 0%, #0f8a3b 50%, #054d19 100%)
        `,
      }}
    >
      {/* HEADER */}
      <Container maxWidth="xl">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={4}
        >
          <Typography variant="h4" fontWeight={800} letterSpacing={1.5}>
            PAMANA NOTES
          </Typography>
          <Box component="img" src={CPSULogo} sx={{ width: 80 }} />
        </Box>
      </Container>

      {/* HERO */}
      <Container maxWidth="xl">
        <Grid
          container
          spacing={8}
          alignItems="center"
          py={{ xs: 8, md: 14 }}
        >
          {/* TEXT */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Typography
                variant="h2"
                fontWeight={800}
                lineHeight={1.1}
              >
                Your Academic Knowledge,
                <br />
                <Box component="span" sx={{ color: "#b9f6ca" }}>
                  Preserved & Shared
                </Box>
              </Typography>

              <Typography
                fontSize={20}
                lineHeight={1.7}
                color="rgba(255,255,255,0.92)"
                maxWidth={620}
              >
                PAMANA Notes is a centralized academic platform designed
                for students and faculty of CPSU Hinigaran Campus. It
                enables structured sharing, access, and preservation of
                verified learning materials.
              </Typography>

              <Stack direction="row" spacing={3} mt={3}>
                <Button
                  size="large"
                  variant="contained"
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#0b6623",
                    fontWeight: 700,
                    px: 5,
                    py: 1.6,
                    fontSize: 16,
                    borderRadius: 999,
                    "&:hover": { bgcolor: "#e8f5e9" },
                  }}
                  onClick={() => navigate("/home")}
                >
                  Get Started
                </Button>

                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(255,255,255,0.7)",
                    color: "white",
                    px: 5,
                    py: 1.6,
                    fontSize: 16,
                    borderRadius: 999,
                    "&:hover": {
                      borderColor: "#ffffff",
                      bgcolor: "rgba(255,255,255,0.12)",
                    },
                  }}
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* LOGOS */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(14px)",
                background: "rgba(255,255,255,0.12)",
                borderRadius: 5,
                p: 4,

                /* Fade edges */
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
              }}
            >
              <motion.div
                style={{
                  display: "flex",
                  gap: 48,
                  width: "max-content",
                }}
                animate={{ x: [-0, -((110 + 48) * logos.length)] }}
                transition={{
                  duration: 18,
                  ease: "linear",
                  repeat: Infinity,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = "paused";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = "running";
                }}
              >
                {[...logos, ...logos, ...logos].map((logo, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={logo}
                    sx={{
                      width: 110,
                      opacity: 0.95,
                      flexShrink: 0,
                      transition: "0.3s",
                      "&:hover": {
                        transform: "scale(1.15)",
                      },
                    }}
                  />
                ))}
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* FEATURES */}
      <Container maxWidth="xl">
        <Grid container spacing={5} py={10}>
          {[
            {
              title: "Centralized Notes",
              desc:
                "All academic materials organized in one trusted and accessible platform.",
            },
            {
              title: "Collaborative Learning",
              desc:
                "Encourage peer-to-peer knowledge sharing across programs and courses.",
            },
            {
              title: "Moderated Content",
              desc:
                "All notes are reviewed to ensure accuracy, relevance, and academic integrity.",
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  height: "100%",
                  p: 5,
                  borderRadius: 5,
                  backdropFilter: "blur(12px)",
                  background: "rgba(255,255,255,0.14)",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
                  transition: "0.35s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {item.title}
                </Typography>
                <Typography
                  fontSize={16}
                  lineHeight={1.7}
                  color="rgba(255,255,255,0.9)"
                >
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ABOUT US */}
{/* ABOUT US */}
<Container maxWidth="xl">
  <Box py={10}>
    <Typography
      variant="h3"
      fontWeight={800}
      textAlign="center"
      gutterBottom
    >
      About PAMANA Notes
    </Typography>

    <Typography
      textAlign="center"
      maxWidth={900}
      mx="auto"
      mb={8}
      fontSize={18}
      lineHeight={1.8}
      color="rgba(255,255,255,0.9)"
    >
      PAMANA Notes is an academic knowledge-sharing platform built
      for students and faculty of CPSU Hinigaran Campus. It aims to
      preserve institutional knowledge, promote collaboration, and
      ensure access to high-quality, moderated learning materials
      for present and future learners.
    </Typography>

    <Grid
      container
      spacing={5}
      justifyContent="center"   // 👈 centers cards row
    >
      {[
        {
          title: "Academic Purpose",
          desc:
            "To support academic excellence by providing structured access to course-related materials across academic programs.",
        },
        {
          title: "Mission",
          desc:
            "To preserve, share, and elevate academic knowledge through a secure and community-driven digital platform.",
        },
        {
          title: "Quality & Moderation",
          desc:
            "All uploaded notes undergo faculty moderation to ensure accuracy, relevance, and academic integrity.",
        },
      ].map((item, index) => (
        <Grid
          item
          xs={12}
          md={4}
          key={index}
          sx={{
            display: "flex",
            justifyContent: "center", // 👈 centers each card
          }}
        >
          <Box
            sx={{
              maxWidth: 360,          // 👈 prevents cards from stretching too wide
              width: "100%",
              p: 5,
              borderRadius: 5,
              backdropFilter: "blur(12px)",
              background: "rgba(255,255,255,0.14)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
              textAlign: "center",   // 👈 center card text
            }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {item.title}
            </Typography>
            <Typography
              fontSize={16}
              lineHeight={1.7}
              color="rgba(255,255,255,0.9)"
            >
              {item.desc}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
</Container>


      {/* FOOTER */}
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.25)" }} />

      <Container maxWidth="xl">
        <Grid container spacing={4} py={6}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700}>
              PAMANA NOTES
            </Typography>
            <Typography fontSize={15} color="rgba(255,255,255,0.85)">
              A centralized academic platform for CPSU students and
              faculty, built to preserve institutional knowledge.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Support</Typography>
            <Typography fontSize={15}>About Us</Typography>
            <Typography fontSize={15}>Courses</Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Contact</Typography>
            <Typography fontSize={15}>📍 CPSU Hinigaran Campus</Typography>
            <Typography fontSize={15}>📧 example@gmail.com</Typography>
          </Grid>
        </Grid>
      </Container>

      {/* COPYRIGHT */}
      <Box
        textAlign="center"
        py={3}
        sx={{ bgcolor: "rgba(0,0,0,0.3)" }}
      >
        <Typography fontSize={13} color="rgba(255,255,255,0.75)">
          © 2026 PAMANA Notes. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}
