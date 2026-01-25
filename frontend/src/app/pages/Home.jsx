import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Chip,
  Stack,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";

import NoteCard from "../components/NoteCard";
import NoteDetailModal from "./NoteDetailModal";

import { getUserRole, getUserCourse } from "../../services/auth";
import { apiFetch } from "../../services/api";

export default function Home() {
  const role = getUserRole();
  const course = getUserCourse();
  const isModerator = role === "moderator";

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

    setSavedVersion?.((v) => v + 1);
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  /* ================= UI ================= */

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
      {/* ===== HEADER / SEARCH ===== */}
      <Box
        sx={{
          mb: 5,
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(180deg, #ffffff, #f7faf8)",
          boxShadow: "0 10px 32px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{ color: "#0b6623", mb: 1 }}
        >
          Notes Feed
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "#5f6f67", mb: 2 }}
        >
          Browse and search shared academic notes
        </Typography>

        {isModerator && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {course && (
              <Chip
                label={`Course: ${course}`}
                size="small"
                color="info"
              />
            )}
            <Chip
              label="Includes General Subjects"
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        )}

        <TextField
          fullWidth
          placeholder="Search by title or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            sx: {
              height: 56,
              fontSize: 20,
              borderRadius: 2,
              backgroundColor: "#9da8a3",
              "& fieldset": {
                borderColor: "#0b0b0b",
              },
              "&:hover fieldset": {
                borderColor: "#0b6623",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#0b6623",
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>

      {/* ===== EMPTY STATE ===== */}
      {!filteredNotes.length && (
        <Typography
          sx={{
            textAlign: "center",
            color: "#6b6b6b",
            mt: 6,
          }}
        >
          No notes found.
        </Typography>
      )}

      {/* ===== NOTES FEED ===== */}
      <Stack spacing={3}>
        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onView={() => openDetails(note)}
          />
        ))}
      </Stack>

      <NoteDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        note={detailNote}
        onSaved={handleSaved}
      />
    </Box>
  );
}
