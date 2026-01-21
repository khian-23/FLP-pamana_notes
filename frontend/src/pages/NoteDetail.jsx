import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const NoteDetailModal = ({ open, onClose, note, token, navigate }) => {
  if (!note) return null;

  const requireLogin = () => navigate("/login");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{note.title}</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          Subject: {note.subject}
        </Typography>

        <Typography variant="body2">
          Uploaded by: {note.author_school_id}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body1">
          {note.description || "No description provided."}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ACTIONS */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            startIcon={<FavoriteBorderIcon />}
            onClick={token ? () => {} : requireLogin}
          >
            Like
          </Button>

          <Button
            startIcon={<BookmarkBorderIcon />}
            onClick={token ? () => {} : requireLogin}
          >
            Save
          </Button>

          <Button
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={token ? () => {} : requireLogin}
          >
            Comment
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>

        <Button
          variant="contained"
          onClick={() =>
            token
              ? window.open(note.file, "_blank")
              : navigate("/login")
          }
        >
          {token ? "Download File" : "Login to Download"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDetailModal;
