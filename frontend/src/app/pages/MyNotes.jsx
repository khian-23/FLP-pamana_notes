import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Chip,
  TextField,
  Button,
  Stack,
  Divider,
  Link,
} from "@mui/material";
import { apiFetch } from "../../services/api";

const getStatus = (note) => {
  if (note.is_approved) return { label: "Approved", color: "success" };
  if (note.is_rejected) return { label: "Rejected", color: "error" };
  return { label: "Pending Review", color: "warning" };
};

export default function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMyNotes();
  }, []);

  async function fetchMyNotes() {
    try {
      const data = await apiFetch("/api/notes/student/my-notes/");
      setNotes(data || []);
    } catch {
      setError("Failed to load your notes.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setDescription(note.description || "");
    setFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFile(null);
  }

  async function saveEdit(noteId) {
    if (actionLoading) return;
    try {
      setActionLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (file) formData.append("file", file);

      await apiFetch(`/api/notes/student/notes/${noteId}/`, {
        method: "PATCH",
        body: formData,
      });

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                title,
                description,
                is_approved: false,
                is_rejected: false,
                rejection_reason: "",
              }
            : n
        )
      );

      cancelEdit();
    } catch {
      setError("Failed to update note.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteNote(noteId) {
    if (!confirm("Delete this note permanently?")) return;

    try {
      setActionLoading(true);
      await apiFetch(`/api/notes/student/notes/${noteId}/`, {
        method: "DELETE",
      });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      setError("Failed to delete note.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!notes.length)
    return <Typography>No uploaded notes yet.</Typography>;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mb: 3, color: "#0b6623" }}
      >
        My Notes
      </Typography>

      <Stack spacing={3}>
        {notes.map((note) => {
          const status = getStatus(note);

          return (
<Card
  key={note.id}
  sx={{
    position: "relative",
    borderRadius: 4,
    p: 3.5,
    background:
      "linear-gradient(180deg, #ffffff 0%, #f8fbf9 100%)",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.08)",
    transition: "all 0.25s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow:
        "0 18px 55px rgba(0,0,0,0.14)",
    },
  }}
>
  {/* STATUS ACCENT BAR */}
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      width: 6,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      bgcolor:
        status.color === "success"
          ? "#16a34a"
          : status.color === "error"
          ? "#dc2626"
          : "#d97706",
    }}
  />

  {/* HEADER */}
  <Stack
    direction={{ xs: "column", md: "row" }}
    justifyContent="space-between"
    alignItems={{ md: "center" }}
    spacing={2}
    sx={{ pl: 1 }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1.25,
          color: "#0f172a",
        }}
      >
        {note.title}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 14,
          color: "#64748b",
        }}
      >
        Status:{" "}
        <Box component="span" sx={{ fontWeight: 600 }}>
          {status.label}
        </Box>
      </Typography>
    </Box>

    {note.file && (
      <Button
        component={Link}
        href={note.file}
        target="_blank"
        variant="outlined"
        size="small"
        sx={{
          borderRadius: 999,
          px: 3,
          fontWeight: 600,
        }}
      >
        Download
      </Button>
    )}
  </Stack>

  {/* REJECTION MESSAGE */}
  {note.is_rejected && note.rejection_reason && (
    <Box
      sx={{
        mt: 2.5,
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(220,38,38,0.08)",
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          color: "#991b1b",
          fontWeight: 600,
        }}
      >
        Rejection Reason
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          color: "#7f1d1d",
          mt: 0.5,
        }}
      >
        {note.rejection_reason}
      </Typography>
    </Box>
  )}

  <Divider sx={{ my: 3 }} />

  {/* EDIT MODE */}
  {editingId === note.id ? (
    <Stack spacing={2.5}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Stack direction="row" spacing={2}>
        <Button component="label" variant="outlined">
          Replace File
          <input
            hidden
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Button>

        <Button
          variant="contained"
          disabled={actionLoading}
          onClick={() => saveEdit(note.id)}
        >
          Save & Resubmit
        </Button>

        <Button variant="text" onClick={cancelEdit}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  ) : (
    <Stack direction="row" spacing={2}>
      <Button
        variant="outlined"
        onClick={() => startEdit(note)}
      >
        Edit
      </Button>
      <Button
        color="error"
        onClick={() => deleteNote(note.id)}
      >
        Delete
      </Button>
    </Stack>
  )}
</Card>

          );
        })}
      </Stack>
    </Box>
  );
}
