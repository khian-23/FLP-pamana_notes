import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { apiFetch } from "../services/api";

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 🚫 hard guard
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchNote = async () => {
      try {
        const data = await apiFetch(`/api/notes/notes/${id}/`);
        setNote(data);
      } catch (err) {
        setError("Unable to load note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, token, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!note) {
    return <Typography>No note found.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {note.title}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Subject: {note.subject || "N/A"}
      </Typography>

      <Typography variant="body2">
        Uploaded by: {note.author_school_id}
      </Typography>

      {note.file && (
        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={() => window.open(note.file, "_blank")}
        >
          Open File
        </Button>
      )}
    </Box>
  );
};

export default NoteDetail;
