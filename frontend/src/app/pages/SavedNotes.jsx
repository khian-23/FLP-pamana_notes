import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { toggleSaveNote } from "../../services/noteActions";

export default function SavedNotes() {
  const { savedVersion, setSavedVersion } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    const res = await apiFetch("/api/notes/student/saved/");
    setNotes(res.notes || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, [savedVersion]);

  const removeSaved = async (noteId) => {
    await toggleSaveNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setSavedVersion((v) => v + 1);
  };

if (loading) {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: "#0b6623",
          }}
        >
          Loading your saved notes
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Please wait while we prepare your collection
        </Typography>
      </Box>
    </Box>
  );
}

if (!notes.length) {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0b6623",
          }}
        >
          No saved notes yet
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: 14,
            color: "#64748b",
            maxWidth: 420,
          }}
        >
          Notes you save will appear here for quick access.
          Browse the notes feed and save the materials you
          find useful.
        </Typography>
      </Box>
    </Box>
  );
}



  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mb: 3, color: "#0b6623" }}
      >
        Saved Notes
      </Typography>

      <Stack spacing={3}>
        {notes.map((note) => (
          <Card
            key={note.id}
            sx={{
              position: "relative",
              p: 3.5,
              borderRadius: 4,
              background:
                "linear-gradient(180deg, #ffffff 0%, #f8fbf9 100%)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              transition: "all 0.25s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 18px 55px rgba(0,0,0,0.14)",
              },
            }}
          >
            {/* LEFT ACCENT RAIL */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: 6,
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                bgcolor: "#0b6623",
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
                  Uploaded by{" "}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {note.author_school_id}
                  </Box>
                </Typography>

                {note.subject && (
                  <Chip
                    label={note.subject}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeSaved(note.id)}
                >
                  Remove
                </Button>

                <Button
                  variant="contained"
                  onClick={() => window.open(note.file, "_blank")}
                >
                  Open
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }} />
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
