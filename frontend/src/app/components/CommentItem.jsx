import {
  Box,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

export default function CommentItem({ comment }) {
  if (!comment) return null;

  const isModerator = comment.author_role === "moderator";

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 2,
        bgcolor: "#f9fafb",
      }}
    >
      {/* AUTHOR + BADGE */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" fontWeight="bold">
          {comment.author_name || comment.author_school_id}
        </Typography>

        {isModerator && (
          <Chip
            label="Moderator"
            size="small"
            color="success"
            variant="outlined"
          />
        )}
      </Stack>

      {/* COMMENT CONTENT */}
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {comment.content}
      </Typography>

      {/* DATE (OPTIONAL) */}
      {comment.created_at && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {new Date(comment.created_at).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
}
