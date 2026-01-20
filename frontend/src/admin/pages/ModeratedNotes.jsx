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
} from "@mui/material";

import { apiFetch } from "../../services/api";

const statusColor = {
  approved: "success",
  rejected: "error",
};

export default function ModeratedNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.id}>
                <TableCell>{note.title}</TableCell>
                <TableCell>{note.author_school_id}</TableCell>
                <TableCell>
                  <Chip
                    label={note.status.toUpperCase()}
                    color={statusColor[note.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {note.rejection_reason || "—"}
                </TableCell>
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
    </Paper>
  );
}
