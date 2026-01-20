import { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { fetchStudentDashboard } from "../../services/studentApi";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStudentDashboard()
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return null;

  const cards = [
    { label: "My Notes", value: stats.my_notes },
    { label: "Approved", value: stats.approved },
    { label: "Pending", value: stats.pending },
    { label: "Rejected", value: stats.rejected },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((c) => (
        <Grid item xs={12} md={3} key={c.label}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1">{c.label}</Typography>
            <Typography variant="h4">{c.value}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
