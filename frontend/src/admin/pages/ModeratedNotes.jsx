import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import { apiFetch } from "../../services/api";

const statusColor = {
  approved: "success",
  rejected: "error",
};

export default function ModeratedNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    apiFetch("/notes/api/moderated/")
      .then(setNotes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Moderated Notes
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          label="All"
          clickable
          color={filter === "all" ? "primary" : "default"}
          onClick={() => setFilter("all")}
        />
        <Chip
          label="Approved"
          clickable
          color={filter === "approved" ? "success" : "default"}
          onClick={() => setFilter("approved")}
        />
        <Chip
          label="Rejected"
          clickable
          color={filter === "rejected" ? "error" : "default"}
          onClick={() => setFilter("rejected")}
        />
      </Stack>

      {loading && <Typography>Loading...</Typography>}

      {!loading && notes.length === 0 && (
        <Typography>No moderated notes yet</Typography>
      )}

      {!loading && notes.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Uploader</TableCell>
              <TableCell align="right">Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {notes
              .filter((n) => filter === "all" || n.status === filter)
              .map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.author_school_id}</TableCell>

                  <TableCell align="right">
                    {note.file ? (
                      <Chip
                        label="View"
                        clickable
                        color="primary"
                        size="small"
                        onClick={() => setPreviewUrl(note.file)}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={note.status.toUpperCase()}
                      color={statusColor[note.status]}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>{note.rejection_reason || "—"}</TableCell>

                  <TableCell>
                    {note.uploaded_at
                      ? new Date(note.uploaded_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      {/* PREVIEW MODAL */}
      <Dialog
        open={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Note Preview</DialogTitle>
            <DialogContent dividers>
              {/\.(png|jpe?g|webp)$/i.test(previewUrl) ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ width: "100%" }}
                />
              ) : (
                <Typography>
                  Preview not available for this file type.
                  <br /><br />
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to download
                  </a>
                </Typography>
              )}
            </DialogContent>


      </Dialog>
    </Paper>
  );
}
