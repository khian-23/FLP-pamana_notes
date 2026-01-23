import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  TextField,
  Button,
  Stack,
  Link,
} from "@mui/material";
import { apiFetch } from "../../services/api";

const getStatus = (note) => {
  if (note.is_approved) return { label: "Approved", color: "success" };
  if (note.is_rejected) return { label: "Rejected", color: "error" };
  return { label: "Pending", color: "warning" };
};

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

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
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (file) formData.append("file", file);

      await apiFetch(`/api/notes/student/notes/${noteId}/`, {
        method: "PATCH",
        body: formData,
      });

      cancelEdit();
      fetchMyNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to update note.");
    }
  }

  async function deleteNote(noteId) {
    if (!confirm("Delete this note permanently?")) return;
    try {
      await apiFetch(`/api/notes/notes/${noteId}/`, {
        method: "DELETE",
      });
      fetchMyNotes();
    } catch {
      setError("Failed to delete note.");
    }
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!notes.length) return <Typography>No uploaded notes.</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Notes
      </Typography>

      <Grid container spacing={2}>
        {notes.map((note) => {
          const status = getStatus(note);

          return (
            <Grid key={note.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{note.title}</Typography>

                  <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />

                  {note.is_rejected && note.rejection_reason && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      Rejection reason: {note.rejection_reason}
                    </Typography>
                  )}

                  {note.file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      File:{" "}
                      <Link href={note.file} target="_blank">
                        Download
                      </Link>
                    </Typography>
                  )}

                  {editingId === note.id ? (
                    <Stack spacing={2} mt={2}>
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
                        onChange={(e) =>
                          setDescription(e.target.value)
                        }
                      />

                      <Button component="label" variant="outlined">
                        Replace File
                        <input
                          type="file"
                          hidden
                          onChange={(e) =>
                            setFile(e.target.files[0])
                          }
                        />
                      </Button>

                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          onClick={() => saveEdit(note.id)}
                        >
                          Save & Resubmit
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} mt={2}>
                      {!note.is_approved && (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={note.status === "approved"}
                        onClick={() => startEdit(note)}
                      >
                        Edit
                      </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteNote(note.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MyNotes;
