import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Chip,
} from "@mui/material";
import NoteDetailModal from "./NoteDetailModal";
import { apiFetch } from "../../services/api";
import { getAccessToken } from "../../services/auth";
import { useOutletContext } from "react-router-dom";

const visibilityColor = {
  public: "success",
  school: "info",
  course: "secondary",
};

export default function Home() {
  const token = getAccessToken();
  const { setSavedVersion } = useOutletContext();

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailNote, setDetailNote] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        let data;
        try {
          data = await apiFetch("/api/notes/student/dashboard/");
        } catch {
          data = await apiFetch("/api/notes/public/");
        }
        setNotes(data.notes || []);
        setFilteredNotes(data.notes || []);
      } catch {
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredNotes(
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subject?.toLowerCase().includes(q)
      )
    );
  }, [search, notes]);

  const openDetails = (note) => {
    setDetailNote(note);
    setDetailOpen(true);
  };

  const handleSaved = (noteId, saved) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, is_saved: saved } : n
      )
    );
    setSavedVersion((v) => v + 1);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Notes Feed
      </Typography>

      <TextField
        fullWidth
        label="Search notes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {!filteredNotes.length && <Typography>No notes found.</Typography>}

      <Grid container spacing={2}>
        {filteredNotes.map((note) => (
          <Grid xs={12} sm={6} md={4} key={note.id}>
            <Card
              sx={{
                height: "100%",
                transition: "0.2s",
                "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" noWrap>
                  {note.title}
                </Typography>

                <Chip
                  label={note.visibility.toUpperCase()}
                  size="small"
                  color={visibilityColor[note.visibility]}
                  sx={{ mt: 1, mb: 1 }}
                />

                <Typography variant="body2">
                  Subject: {note.subject}
                </Typography>

                <Typography variant="caption" display="block">
                  Uploaded by {note.author_school_id}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => openDetails(note)}
                >
                  View
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <NoteDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        note={detailNote}
        token={token}
        onSaved={handleSaved}
      />
    </Box>
  );
}
