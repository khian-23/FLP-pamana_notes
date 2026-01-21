import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import axios from "axios";

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://127.0.0.1:8000/notes/api/notes/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setNote(res.data))
      .catch(() => navigate("/app/home"))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!note) {
    return <Alert severity="error">Note not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {note.title}
      </Typography>

      <Typography>Subject: {note.subject}</Typography>
      <Typography>Uploaded by: {note.author_school_id}</Typography>
      <Typography>Visibility: {note.visibility}</Typography>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => window.open(note.file, "_blank")}
      >
        View PDF
      </Button>
    </Box>
  );
};

export default NoteDetail;
