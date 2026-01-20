import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

export default function UploadNote() {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Upload Note
      </Typography>

      <Box maxWidth={520}>
        <Stack spacing={2}>
          {/* TITLE */}
          <TextField
            label="Title"
            placeholder="Enter note title"
            fullWidth
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            placeholder="Brief description of the note"
            fullWidth
            multiline
            rows={3}
          />

          {/* SUBJECT */}
          <TextField
            label="Subject"
            placeholder="e.g. Data Structures"
            fullWidth
          />

          {/* VISIBILITY */}
          <FormControl fullWidth>
            <InputLabel>Visibility</InputLabel>
            <Select label="Visibility" defaultValue="public">
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="school">School Only</MenuItem>
              <MenuItem value="course">Course Only</MenuItem>
            </Select>
          </FormControl>

          {/* FILE */}
          <Button
            variant="outlined"
            component="label"
          >
            Upload File
            <input type="file" hidden />
          </Button>

          {/* SUBMIT */}
          <Button
            variant="contained"
            sx={{ bgcolor: "#0b6623" }}
          >
            Submit for Review
          </Button>
        </Stack>
      </Box>
    </>
  );
}
