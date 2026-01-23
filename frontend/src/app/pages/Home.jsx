import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Chip,
  Grid,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";

import NoteCard from "../components/NoteCard";
import NoteDetailModal from "./NoteDetailModal";

import {
  getUserRole,
  getUserCourse,
  getAccessToken,
} from "../../services/auth";
import { apiFetch } from "../../services/api";

export default function Home() {
  const token = getAccessToken();

  const role = getUserRole();
  const course = getUserCourse();
  const isModerator = role === "moderator";

  // ✅ SAFE outlet context
  const outletContext = useOutletContext();
  const setSavedVersion = outletContext?.setSavedVersion;

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

        const list = data.notes || [];
        setNotes(list);
        setFilteredNotes(list);
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

    if (setSavedVersion) {
      setSavedVersion((v) => v + 1);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Notes Feed
      </Typography>

      {/* ===== MODERATOR CONTEXT ===== */}
      {isModerator && (
        <Box sx={{ mb: 2 }}>
          {course && (
            <Chip
              label={`Course: ${course}`}
              size="small"
              color="info"
              sx={{ mr: 1 }}
            />
          )}
          <Chip
            label="Includes General Subjects"
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>
      )}

      <TextField
        fullWidth
        label="Search notes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {!filteredNotes.length && (
        <Typography>No notes found.</Typography>
      )}

      <Grid container spacing={2}>
        {filteredNotes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <NoteCard
              note={note}
              onView={() => openDetails(note)}
            />
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
