import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
} from "@mui/material";

export default function Profile() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>

      <Box maxWidth={420}>
        <Stack spacing={2} alignItems="center">
          <Avatar sx={{ width: 80, height: 80 }} />

          <TextField
            label="School ID"
            value="2021-00001"
            fullWidth
            disabled
          />

          <TextField
            label="Email"
            placeholder="your@email.com"
            fullWidth
          />

          <TextField
            label="Full Name"
            placeholder="Juan Dela Cruz"
            fullWidth
          />

          <Button
            variant="contained"
            sx={{ bgcolor: "#0b6623" }}
          >
            Update Profile
          </Button>
        </Stack>
      </Box>
    </>
  );
}
