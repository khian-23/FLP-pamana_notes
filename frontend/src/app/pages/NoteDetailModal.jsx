import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NoteDetailModal = ({ open, onClose, note, token }) => {
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // 🔹 LOAD COMMENTS SAFELY
  useEffect(() => {
    if (!open || !note || !token) return;

    axios
      .get(
        `http://127.0.0.1:8000/notes/api/notes/${note.id}/comments/`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        // ✅ FIX: extract array properly
        setComments(res.data.comments || []);
      })
      .catch(() => setComments([]));
  }, [open, note, token]);

  if (!note) return null;

  const requireLogin = (fn) => {
    if (!token) {
      navigate("/login");
      return;
    }
    fn();
  };

  const toggleLike = () =>
    requireLogin(() =>
      axios
        .post(
          `http://127.0.0.1:8000/notes/api/notes/${note.id}/like/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => setLiked(res.data.liked))
    );

  const toggleSave = () =>
    requireLogin(() =>
      axios
        .post(
          `http://127.0.0.1:8000/notes/api/notes/${note.id}/save/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => setSaved(res.data.saved))
    );

  const submitComment = () =>
    requireLogin(() =>
      axios
        .post(
          `http://127.0.0.1:8000/notes/api/notes/${note.id}/comments/`,
          { content: text },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => {
          setComments([res.data, ...comments]);
          setText("");
        })
    );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{note.title}</DialogTitle>

      <DialogContent>
        <Chip
          label={(note.visibility || "public").toUpperCase()}
          size="small"
          sx={{ mb: 2 }}
        />

        <Typography>Subject: {note.subject}</Typography>
        <Typography variant="caption">
          Uploaded by {note.author_school_id}
        </Typography>

        {note.description && (
          <Typography sx={{ mt: 2 }}>{note.description}</Typography>
        )}

        {/* COMMENTS */}
        <Box sx={{ mt: 3 }}>
          <Typography fontWeight="bold">Comments</Typography>

          {token && (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                sx={{ mt: 1, mb: 1 }}
              />

              <Button size="small" onClick={submitComment}>
                Post
              </Button>
            </>
          )}

          {comments.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              No comments yet.
            </Typography>
          )}

          {comments.map((c) => (
            <Typography key={c.id} sx={{ mt: 1 }}>
              <b>{c.user_school_id}</b>: {c.content}
            </Typography>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={toggleLike} variant="outlined">
          {liked ? "Unlike" : "Like"}
        </Button>

        <Button onClick={toggleSave} variant="outlined">
          {saved ? "Saved" : "Save"}
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            requireLogin(() => window.open(note.file, "_blank"))
          }
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDetailModal;
