import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
} from "@mui/material";

const visibilityColor = {
  public: "#2e7d32",
  school: "#0288d1",
  course: "#6a1b9a",
};

export default function NoteCard({ note, onView }) {
  return (
    <Box
      sx={{
        width: "100%",
        p: 3,
        borderRadius: 3,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: 3,
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        borderLeft: `6px solid ${visibilityColor[note.visibility]}`,
        transition: "0.25s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* MAIN CONTENT */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: "#1b1b1b" }}
          noWrap
        >
          {note.title}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 0.5, flexWrap: "wrap" }}
        >
          <Typography variant="body2" sx={{ fontSize: 15, opacity: 0.9,color: "#000000" }}>
            Subject: <b>{note.subject || "—"}</b>
          </Typography>

          <Typography variant="body2" sx={{fontSize: 13,opacity: 0.75, mt: 0.5, color: "#6b6b6b" }}>
            Uploaded by {note.author_school_id}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip
            label={note.visibility.toUpperCase()}
            size="small"
            sx={{
              bgcolor: visibilityColor[note.visibility],
              color: "#fff",
              fontWeight: 600,
            }}
          />

          {note.author_role === "moderator" && (
            <Chip
              label="MODERATOR"
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>

      {/* ACTION */}
      <Button
        onClick={() => onView(note)}
        variant="contained"
        sx={{
          fontSize: 16,
          px: 4,
          borderRadius: 999,
          fontWeight: 600,
          backgroundColor: "#0b6623",
          "&:hover": {
            backgroundColor: "#0f8a3b",
          },
        }}
      >
        View
      </Button>
    </Box>
  );
}
