import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Chip,
  TextField,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleSaveNote } from "../../services/noteActions";

const API_BASE = "http://127.0.0.1:8000";

const NoteDetailModal = ({ open, onClose, note, token, onSaved }) => {
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [likeAnim, setLikeAnim] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!note) return;
    setSaved(Boolean(note.is_saved));
    setLiked(Boolean(note.is_liked));
    setLikesCount(Number(note.likes_count) || 0);
  }, [note]);

  /* ---------- LOAD COMMENTS ---------- */
  useEffect(() => {
    if (!open || !note || !token) return;

    axios
      .get(`${API_BASE}/api/notes/notes/${note.id}/comments/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data?.comments ?? res.data ?? [];
        setComments(Array.isArray(list) ? list : []);
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

  /* ---------- LIKE ---------- */
  const toggleLike = () =>
    requireLogin(async () => {
      const res = await axios.post(
        `${API_BASE}/api/notes/notes/${note.id}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);

      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 180);
    });

  /* ---------- SAVE ---------- */
  const toggleSave = async () => {
    if (!token) return navigate("/login");

    const res = await toggleSaveNote(note.id);
    setSaved(res.saved);
    onSaved?.();
  };

  /* ---------- ADD COMMENT (OPTIMISTIC) ---------- */
  const submitComment = () =>
    requireLogin(async () => {
      if (!text.trim()) return;

      const optimistic = {
        id: `tmp-${Date.now()}`,
        content: text,
        created_at: new Date().toISOString(),
        user_school_id: "You",
        can_delete: true,
        _optimistic: true,
      };

      setComments((prev) => [optimistic, ...prev]);
      setText("");

      try {
        const res = await axios.post(
          `${API_BASE}/api/notes/notes/${note.id}/comments/`,
          { content: optimistic.content },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setComments((prev) =>
          prev.map((c) => (c.id === optimistic.id ? res.data : c))
        );
      } catch {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      }
    });

  /* ---------- DELETE COMMENT ---------- */
  const deleteComment = async (id) => {
    await axios.delete(`${API_BASE}/api/notes/comments/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const formatTime = (value) =>
    new Date(value).toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{note.title}</DialogTitle>

      <DialogContent>
        <Chip label={note.visibility.toUpperCase()} size="small" sx={{ mb: 2 }} />

        <Typography>Subject: {note.subject}</Typography>
        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
          Uploaded by {note.author_school_id}
        </Typography>

        {/* ❤️ LIKE BAR */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={toggleLike}
            color="error"
            sx={{
              transform: likeAnim ? "scale(1.35)" : "scale(1)",
              transition: "transform 0.15s ease-out",
            }}
          >
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>

          <Typography>{likesCount} likes</Typography>

          <Button size="small" variant="outlined" onClick={toggleSave}>
            {saved ? "Saved" : "Save"}
          </Button>
        </Box>

        {/* 💬 COMMENTS */}
        <Box sx={{ mt: 3 }}>
          <Typography fontWeight="bold">Comments</Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Button size="small" onClick={submitComment}>
            Post
          </Button>

          {!comments.length && (
            <Typography variant="caption">No comments yet.</Typography>
          )}

          {comments.map((c) => (
            <Box
              key={c.id}
              sx={{
                mt: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "#f5f5f5",
                opacity: c._optimistic ? 0.6 : 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight="bold">
                  {c.user_school_id || "Unknown"}
                </Typography>

                {c.can_delete && !c._optimistic && (
                  <IconButton
                    size="small"
                    onClick={() => deleteComment(c.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Typography>{c.content}</Typography>

              <Typography variant="caption" color="text.secondary">
                {formatTime(c.created_at)}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDetailModal;
