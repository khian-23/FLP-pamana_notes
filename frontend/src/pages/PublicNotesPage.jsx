import { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { getAccessToken } from "../services/auth";
import { apiFetch } from "../services/api";

export default function PublicNotesPage() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    apiFetch("/api/notes/public/")
      .then((data) => setNotes(data?.notes || []))
      .catch(console.error);
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Public Notes
      </Typography>

      <Grid container spacing={3}>
        {notes.map((note) => (
          <Grid item xs={12} md={4} key={note.id}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "#f5f5f5"
              }}
            >
              <Typography fontWeight="bold">
                {note.title}
              </Typography>

              <Typography fontSize={14}>
                {note.subject}
              </Typography>

              {!getAccessToken() && (
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  mt={1}
                >
                  Login to download or save this note
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
