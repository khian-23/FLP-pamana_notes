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

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  // reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadNotes = async () => {
    try {
      const data = await apiFetch("/notes/api/pending/");
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const approveNote = async (id) => {
    setProcessingId(id);
    await apiFetch(`/notes/api/approve/${id}/`, { method: "POST" });
    setPreviewOpen(false);
    loadNotes();
    setProcessingId(null);
  };

  const openRejectDialog = (note) => {
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
    setPreviewOpen(false);
    loadNotes();
    setProcessingId(null);
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

      {/* PREVIEW DIALOG */}
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
              title="PDF Preview"
            />
          ) : /\.(png|jpe?g|webp)$/i.test(previewUrl || "") ? (
            <img src={previewUrl} style={{ width: "100%" }} />
          ) : (
            <Typography>
              Preview not available.
              <br /><br />
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                Download file
              </a>
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            color="success"
            variant="contained"
            onClick={() => approveNote(selectedNote.id)}
          >
            Approve
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => openRejectDialog(selectedNote)}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* REJECT DIALOG */}
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
            disabled={!rejectReason.trim()}
            onClick={rejectNote}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PendingNotes;
