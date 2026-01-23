import { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { toggleSaveNote } from "../../services/noteActions";

export default function SavedNotes() {
  const { savedVersion, setSavedVersion } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    const res = await apiFetch("/api/notes/student/saved/");
    setNotes(res.notes || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, [savedVersion]);

  const removeSaved = async (noteId) => {
    // Toggle save → this UNSAVES
    await toggleSaveNote(noteId);

    // Optimistic UI update
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    // Sync other pages (Home, etc.)
    setSavedVersion((v) => v + 1);
  };

  if (loading) {
    return <Typography>Loading saved notes...</Typography>;
  }

  if (!notes.length) {
    return <Typography>No saved notes yet.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Saved Notes
      </Typography>

      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid xs={12} sm={6} md={4} key={note.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.2s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" noWrap>
                  {note.title}
                </Typography>

                <Chip
                  label={note.subject}
                  size="small"
                  sx={{ mt: 1 }}
                />

                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  Uploaded by {note.author_school_id}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => removeSaved(note.id)}
                >
                  Remove
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  onClick={() => window.open(note.file, "_blank")}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
