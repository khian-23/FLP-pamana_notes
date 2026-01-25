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
  Stack,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleSaveNote } from "../../services/noteActions";

const API_BASE = "http://127.0.0.1:8000";

const NoteDetailModal = ({ open, onClose, note, onSaved }) => {
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [likeAnim, setLikeAnim] = useState(false);
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    if (!note) return;
    setSaved(Boolean(note.is_saved));
    setLiked(Boolean(note.is_liked));
    setLikesCount(Number(note.likes_count) || 0);
    setDownloads(Number(note.downloads) || 0);
  }, [note]);

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
    if (!token) return navigate("/login");
    fn();
  };

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
      setTimeout(() => setLikeAnim(false), 160);
    });

  const toggleSave = async () => {
    if (!token) return navigate("/login");
    const res = await toggleSaveNote(note.id);
    setSaved(res.saved);
    onSaved?.();
  };

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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: "#8becad",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle sx={{ pr: 6 }}>
        <Typography
          fontSize={45}
          fontWeight={700}
          sx={{ color: "#000000" }}
        >

          {note.title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 4 }}>
        {/* META */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip label={note.visibility} size="small" />
          {note.subject && <Chip label={note.subject} size="small" />}
        </Stack>

        <Typography fontSize={16} color="#000000">
          Uploaded by <strong>{note.author_school_id}</strong>
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* DOWNLOAD */}
        {note.file && (
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: "#59cb87c5",
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
              mb: 3,
            }}
          >
            <Button
              fullWidth
              size="large"
              variant="contained"
              sx={{
                backgroundColor: "#568d6b",
                fontWeight: 600,
                py: 1.2,
                "&:hover": { backgroundColor: "#0f9724" },
              }}
              onClick={async () => {
                try {
                  const res = await axios.post(
                    `${API_BASE}/api/notes/notes/${note.id}/track-download/`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setDownloads(res.data.downloads);
                } catch {}
                window.open(note.file, "_blank");
              }}
            >
              Download Academic File
            </Button>

            <Typography
              variant="caption"
              display="block"
              textAlign="center"
              sx={{ mt: 1, color: "#00871b" }}
            >
              {downloads} Downloads
            </Typography>
          </Box>
        )}

        {/* ACTIONS */}
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={toggleLike}
            color="error"
            sx={{
              transform: likeAnim ? "scale(1.25)" : "scale(1)",
              transition: "transform 0.15s ease",
            }}
          >
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>

          <Typography fontSize={14}>{likesCount} likes</Typography>

          <Button
            variant={saved ? "contained" : "outlined"}
            onClick={toggleSave}
            size="small"
          >
            {saved ? "Saved" : "Save"}
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* COMMENTS */}
        <Typography fontWeight={700} fontSize={16} sx={{ mb: 1 }}>
          Discussion
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline
            minRows={3}
            sx={{
              backgroundColor: "#5d9459",
              borderRadius: 2,
              "& .MuiInputBase-input": {
                fontSize: 14,
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="small"
              disabled={!text.trim()}
              onClick={submitComment}
              sx={{ fontWeight: 600 }}
            >
              Post
            </Button>
          </Box>

          {comments.map((c) => (
            <Box
              key={c.id}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "#4b7a47",
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600} fontSize={19}>
                  {c.user_school_id}
                </Typography>

                {c.can_delete && !c._optimistic && (
                  <IconButton size="small" onClick={() => deleteComment(c.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              <Typography fontSize={16} sx={{ mt: 0.5 }}>
                {c.content}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatTime(c.created_at)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDetailModal;
