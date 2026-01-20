import { Grid, Paper, Typography } from "@mui/material";

export default function Bookmarks() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Saved Notes
      </Typography>

      <Grid container spacing={2}>
        {[1, 2].map((n) => (
          <Grid item xs={12} md={6} key={n}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight="bold">
                Bookmarked Note {n}
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                Subject • Approved
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
