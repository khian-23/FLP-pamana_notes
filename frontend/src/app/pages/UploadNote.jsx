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
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadNote = () => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: null,
    visibility: "school",
    file: null,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ✅ FETCH SUBJECTS (AUTH REQUIRED)
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/subjects/student/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubjects(res.data))
      .catch(() => setSubjects([]));
  }, []);

  // 🔒 AUTO-FORCE VISIBILITY FOR GENERAL SUBJECTS
  useEffect(() => {
    if (form.subject?.type === "General" && form.visibility === "course") {
      setForm((prev) => ({ ...prev, visibility: "school" }));
    }
  }, [form.subject, form.visibility]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ VALIDATION
    if (!form.title.trim()) {
      return setError("Title is required.");
    }

    if (!form.subject) {
      return setError("Please select a subject.");
    }

    if (!form.description.trim() && !form.file) {
      return setError("Provide a description or upload a file.");
    }

    if (form.file && form.file.size > MAX_FILE_SIZE) {
      return setError("File size must be 10MB or less.");
    }

    const token = localStorage.getItem("access");
    if (!token) {
      return setError("Session expired. Please log in again.");
    }

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("description", form.description.trim());
    data.append("subject", form.subject.id);
    data.append("visibility", form.visibility);
    if (form.file) data.append("file", form.file);

    try {
      setProgress(0);

      await axios.post(
        "http://127.0.0.1:8000/notes/api/student/upload/",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (e) => {
            if (!e.total) return;
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          },
        }
      );

      setProgress(100);
      setSuccess("Note uploaded successfully.");

      setForm({
        title: "",
        description: "",
        subject: null,
        visibility: "school",
        file: null,
      });

      setTimeout(() => navigate("/app/my-notes"), 800);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.file ||
          "Upload failed."
      );
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Upload Note
      </Typography>

      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {progress > 0 && (
        <Box sx={{ my: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption">{progress}%</Typography>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          required
          sx={{ mb: 2 }}
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <Autocomplete
          options={subjects}
          getOptionLabel={(opt) => `${opt.name} (${opt.type})`}
          value={form.subject}
          onChange={(_, value) =>
            setForm({ ...form, subject: value })
          }
          renderInput={(params) => (
            <TextField {...params} label="Subject" required sx={{ mb: 2 }} />
          )}
        />

        <TextField
          select
          label="Visibility"
          fullWidth
          sx={{ mb: 2 }}
          value={form.visibility}
          onChange={(e) =>
            setForm({ ...form, visibility: e.target.value })
          }
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="school">School</MenuItem>
          <MenuItem
            value="course"
            disabled={form.subject?.type === "General"}
          >
            Course
          </MenuItem>
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
