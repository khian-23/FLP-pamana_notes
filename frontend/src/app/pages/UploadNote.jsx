import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Paper,
  Autocomplete,
} from "@mui/material";
import axios from "axios";

const UploadNote = () => {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: null,
    visibility: "school",
    file: null,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");

    axios.get("http://127.0.0.1:8000/api/subjects/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => setSubjects(res.data))
    .catch(() => setSubjects([]));
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access");
    const data = new FormData();

    data.append("title", form.title);
    data.append("description", form.description);
    data.append("subject", form.subject?.id);
    data.append("visibility", form.visibility);
    data.append("file", form.file);

    try {
      await axios.post(
        "http://127.0.0.1:8000/notes/api/student/upload/",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Note uploaded successfully");
    } catch {
      setError("Upload failed");
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Upload Note
      </Typography>

      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          required
          sx={{ mb: 2 }}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Autocomplete
          options={subjects}
          getOptionLabel={(opt) => opt.name}
          onChange={(_, value) => setForm({ ...form, subject: value })}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Subject"
              required
              sx={{ mb: 2 }}
            />
          )}
        />

        <TextField
          select
          label="Visibility"
          fullWidth
          sx={{ mb: 2 }}
          value={form.visibility}
          onChange={(e) => setForm({ ...form, visibility: e.target.value })}
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="school">School</MenuItem>
          <MenuItem value="course">Course</MenuItem>
        </TextField>

        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
          Select File
          <input
            hidden
            type="file"
            onChange={(e) =>
              setForm({ ...form, file: e.target.files[0] })
            }
          />
        </Button>

        <br />

        <Button type="submit" variant="contained">
          Upload
        </Button>
      </Box>
    </Paper>
  );
};

export default UploadNote;
