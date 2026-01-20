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
  Checkbox,
} from "@mui/material";

import { apiFetch } from "../../services/api";

export default function PendingNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  /* =========================
     LOAD
  ========================= */
  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/notes/api/pending/");
      setNotes(data);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  /* =========================
     ACTIONS
  ========================= */
  const approveNote = async (id) => {
    setProcessingId(id);
    await apiFetch(`/notes/api/approve/${id}/`, { method: "POST" });
    await loadNotes();
    setProcessingId(null);
  };

  const bulkApprove = async () => {
    for (const id of selectedIds) {
      await apiFetch(`/notes/api/approve/${id}/`, { method: "POST" });
    }
    await loadNotes();
  };

  const openReject = (note) => {
    setSelectedNote(note);
    setRejectReason("");
    setRejectOpen(true);
  };

  const rejectNote = async () => {
    if (!rejectReason.trim()) return;

    setProcessingId(selectedNote.id);
    await apiFetch(`/notes/api/reject/${selectedNote.id}/`, {
      method: "POST",
      body: JSON.stringify({ reason: rejectReason }),
    });

    setRejectOpen(false);
    setProcessingId(null);
    await loadNotes();
  };

  /* =========================
     UI
  ========================= */
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Pending Notes
      </Typography>

      {selectedIds.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={bulkApprove}
          >
            Approve Selected ({selectedIds.length})
          </Button>
        </Stack>
      )}

      {loading && <Typography>Loading...</Typography>}

      {!loading && notes.length === 0 && (
        <Typography>No pending notes</Typography>
      )}

      {!loading && notes.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.length === notes.length}
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < notes.length
                    }
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? notes.map(n => n.id) : []
                      )
                    }
                  />
                </TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {notes.map(note => (
                <TableRow key={note.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(note.id)}
                      onChange={() =>
                        setSelectedIds(prev =>
                          prev.includes(note.id)
                            ? prev.filter(id => id !== note.id)
                            : [...prev, note.id]
                        )
                      }
                    />
                  </TableCell>

                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.author_school_id}</TableCell>
                  <TableCell>{note.subject || "—"}</TableCell>
                  <TableCell>
                    {new Date(note.uploaded_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedNote(note);
                          setPreviewUrl(note.file);
                          setPreviewOpen(true);
                        }}
                      >
                        View
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={processingId === note.id}
                        onClick={() => approveNote(note.id)}
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => openReject(note)}
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

      {/* PREVIEW */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Note Preview</DialogTitle>
        <DialogContent dividers>
          {previewUrl?.endsWith(".pdf") ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="600"
              title="PDF"
            />
          ) : /\.(png|jpe?g|webp)$/i.test(previewUrl) ? (
            <img src={previewUrl} style={{ width: "100%" }} />
          ) : (
            <Typography>
              Preview not available.
              <br />
              <a href={previewUrl} target="_blank" rel="noreferrer">
                Download file
              </a>
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* REJECT */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth>
        <DialogTitle>Reject Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={rejectNote}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
