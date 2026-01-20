import { Grid, Paper, Typography } from "@mui/material";

export default function Home() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        All Notes
      </Typography>

      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((n) => (
          <Grid key={n} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight="bold">
                Sample Note {n}
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                Subject • Uploaded by student
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
