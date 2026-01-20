import { Typography, Paper } from "@mui/material";

export default function FreedomWall() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Freedom Wall
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Freedom Wall feature coming soon.
        </Typography>
      </Paper>
    </>
  );
}
