import { Grid, Paper, Typography, Chip } from "@mui/material";

const notes = [
  { title: "Math Notes", status: "Approved" },
  { title: "Physics Reviewer", status: "Pending" },
  { title: "Chem Lab", status: "Rejected" },
];

const statusColor = {
  Approved: "success",
  Pending: "warning",
  Rejected: "error",
};

export default function MyNotes() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        My Notes
      </Typography>

      <Grid container spacing={2}>
        {notes.map((n, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
              <Typography>{n.title}</Typography>
              <Chip
                label={n.status}
                color={statusColor[n.status]}
                size="small"
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
