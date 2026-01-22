import { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
} from "@mui/material";
import { fetchStudentDashboard } from "../../services/studentApi";

const visibilityColor = {
  public: "success",
  school: "info",
  course: "secondary",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStudentDashboard()
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return <Typography>Loading...</Typography>;

  const cards = [
    { label: "My Notes", value: stats.my_notes },
    { label: "Approved", value: stats.approved },
    { label: "Pending", value: stats.pending },
    { label: "Rejected", value: stats.rejected },
  ];

  return (
    <Box>
      {/* ===== DASHBOARD STATS ===== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((c) => (
          <Grid item xs={12} md={3} key={c.label}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1">{c.label}</Typography>
              <Typography variant="h4">{c.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ===== STUDENT NOTES FEED ===== */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Latest Notes
      </Typography>

      {!stats.notes?.length && (
        <Typography>No notes available.</Typography>
      )}

      <Grid container spacing={2}>
        {stats.notes?.map((note) => (
          <Grid item xs={12} md={4} key={note.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{note.title}</Typography>

                <Chip
                  label={note.visibility.toUpperCase()}
                  color={visibilityColor[note.visibility] || "default"}
                  size="small"
                  sx={{ my: 1 }}
                />

                <Typography variant="body2">
                  Subject: {note.subject}
                </Typography>

                <Typography variant="caption" display="block">
                  Uploaded by: {note.author_school_id}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 2 }}
                  href={`/app/notes/${note.id}`}
                >
                  View
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
