import { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { fetchStudentDashboard } from "../../services/studentApi";
import NoteCard from "../components/NoteCard"; // adjust path if needed

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStudentDashboard()
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <Typography sx={{ p: 3 }}>
        Loading dashboard…
      </Typography>
    );
  }

  const cards = [
    { label: "My Notes", value: stats.my_notes },
    { label: "Approved", value: stats.approved },
    { label: "Pending", value: stats.pending },
    { label: "Rejected", value: stats.rejected },
  ];

  return (
    <Box sx={{ px: { xs: 1, md: 2 } }}>
      {/* ===== DASHBOARD STATS ===== */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {c.label}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {c.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ===== NOTES FEED ===== */}
      <Typography
        variant="h6"
        fontWeight={600}
        sx={{ mb: 2 }}
      >
        Latest Notes
      </Typography>

      {!stats.notes?.length ? (
        <Typography color="text.secondary">
          No notes available yet.
        </Typography>
      ) : (
        <Grid
          container
          spacing={3}
          sx={{
            pb: 4,
          }}
        >
          {stats.notes.map((note) => (
            <Grid
              item
              key={note.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              display="flex"
            >
              <NoteCard
                note={note}
                onView={() =>
                  (window.location.href = `/app/notes/${note.id}`)
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
