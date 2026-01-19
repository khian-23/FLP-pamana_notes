import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import { apiFetch } from "../../services/api";

const PendingNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Reject dialog state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);

  const loadNotes = async () => {
    try {
      const data = await apiFetch("/notes/api/pending/");
      setNotes(data);
    } catch (err) {
      console.error("Failed to load pending notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const approveNote = async (id) => {
    setProcessingId(id);
    try {
      await apiFetch(`/notes/api/approve/${id}/`, { method: "POST" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Approve failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (note) => {
    setSelectedNote(note);
    setRejectReason("");
    setRejectOpen(true);
  };

  const rejectNote = async () => {
    if (!rejectReason.trim()) return;

    setProcessingId(selectedNote.id);
    try {
      await apiFetch(`/notes/api/reject/${selectedNote.id}/`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason }),
      });

      setNotes((prev) =>
        prev.filter((n) => n.id !== selectedNote.id)
      );
      setRejectOpen(false);
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Pending Notes
      </Typography>

      {loading && <Typography>Loading...</Typography>}

      {!loading && notes.length === 0 && (
        <Typography>No pending notes</Typography>
      )}

      {!loading && notes.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.author_school_id}</TableCell>
                  <TableCell>{note.subject || "—"}</TableCell>
                  <TableCell>
                    {new Date(note.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={processingId === note.id}
                        onClick={() => approveNote(note.id)}
                      >
                        Approve
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={processingId === note.id}
                        onClick={() => openRejectDialog(note)}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth>
        <DialogTitle>Reject Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            onClick={rejectNote}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PendingNotes;
