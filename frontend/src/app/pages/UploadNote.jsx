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
  Stack,
  Divider,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadNote = () => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
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

  useEffect(() => {
    if (form.subject?.type === "General" && form.visibility === "course") {
      setForm((prev) => ({ ...prev, visibility: "school" }));
    }
  }, [form.subject, form.visibility]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) return setError("Title is required.");
    if (!form.subject) return setError("Please select a subject.");
    if (!form.description.trim() && !form.file)
      return setError("Provide a description or upload a file.");
    if (form.file && form.file.size > MAX_FILE_SIZE)
      return setError("File size must be 10MB or less.");

    const token = localStorage.getItem("access");
    if (!token) return setError("Session expired.");

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
            setProgress(Math.round((e.loaded * 100) / e.total));
          },
        }
      );

      setSuccess("Note submitted successfully for review.");
      setTimeout(() => navigate("/app/my-notes"), 900);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.file ||
          "Upload failed."
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ color: "#0b6623", mb: 1 }}
        >
          Upload Academic Note
        </Typography>

        <Typography
          sx={{ fontSize: 15, color: "#64748b", mb: 3 }}
        >
          Submit learning materials to be reviewed and shared with
          students and faculty.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {progress > 0 && (
          <Box sx={{ my: 3 }}>
            <LinearProgress value={progress} variant="determinate" />
            <Typography
              variant="caption"
              sx={{ mt: 0.5, display: "block" }}
            >
              Uploading… {progress}%
            </Typography>
          </Box>
        )}

        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            placeholder="e.g. Midterm Review – Data Structures"
            fullWidth
            required
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            placeholder="Brief description or coverage of this material"
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
              <TextField {...params} label="Subject" required />
            )}
          />

          <TextField
            select
            label="Visibility"
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

          <Button
            variant="outlined"
            component="label"
            sx={{ alignSelf: "flex-start" }}
          >
            {form.file ? "Replace File" : "Attach File"}
            <input
              hidden
              type="file"
              onChange={(e) =>
                setForm({ ...form, file: e.target.files[0] })
              }
            />
          </Button>

          <Divider />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              py: 1.4,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Submit for Review
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UploadNote;
