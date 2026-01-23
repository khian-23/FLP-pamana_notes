import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
} from "@mui/material";

const visibilityColor = {
  public: "success",
  school: "info",
  course: "secondary",
};

export default function NoteCard({ note, onView }) {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "0.2s",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Typography variant="h6" noWrap>
          {note.title}
        </Typography>

        {/* VISIBILITY */}
        <Chip
          label={note.visibility.toUpperCase()}
          size="small"
          color={visibilityColor[note.visibility]}
          sx={{ mt: 1, mb: 1 }}
        />

        {/* MODERATOR BADGE */}
        {note.author_role === "moderator" && (
          <Chip
            label="Moderator"
            size="small"
            color="warning"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        )}

        <Typography variant="body2">
          Subject: {note.subject || "—"}
        </Typography>

        <Typography variant="caption" display="block">
          Uploaded by {note.author_school_id}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onView(note)}
          >
            View
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
