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

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);

  /* LOAD */
  const loadNotes = async () => {
    setLoading(true);
    const data = await apiFetch("/notes/api/pending/");
    setNotes(data);
    setSelectedIds([]);
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  /* ACTIONS */
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

  const openRejectDialog = (note = null) => {
    setSelectedNote(note);
    setRejectReason("");
    setRejectOpen(true);
  };

  const rejectNote = async () => {
    await apiFetch(`/notes/api/reject/${selectedNote.id}/`, {
      method: "POST",
      body: JSON.stringify({ reason: rejectReason }),
    });
    setRejectOpen(false);
    await loadNotes();
  };

  const bulkReject = async () => {
    // Disabled: backend endpoint does not exist
    return;
  };

  /* UI */
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Pending Notes
      </Typography>

      {selectedIds.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button color="success" variant="contained" onClick={bulkApprove}>
            Approve Selected ({selectedIds.length})
          </Button>
          <Button color="error" variant="contained" disabled>
            Reject Selected (Disabled)
          </Button>
        </Stack>
      )}

      {loading && <Typography>Loading...</Typography>}

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
                          setPreviewUrl(note.file);
                          setPreviewOpen(true);
                        }}
                      >
                        View
                      </Button>

                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        onClick={() => approveNote(note.id)}
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        variant="contained"
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

      {/* PREVIEW */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Note Preview</DialogTitle>
        <DialogContent dividers>
          {previewUrl?.endsWith(".pdf") ? (
            <iframe src={previewUrl} width="100%" height="600" />
          ) : /\.(png|jpe?g|webp)$/i.test(previewUrl) ? (
            <img src={previewUrl} style={{ width: "100%" }} />
          ) : (
            <a href={previewUrl} target="_blank">Download file</a>
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
            onClick={selectedIds.length ? undefined : rejectNote}
            disabled={selectedIds.length > 0}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
