import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Card,
  CardContent,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Paper,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ReplyIcon from "@mui/icons-material/Reply";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ReportIcon from "@mui/icons-material/Report";

import { apiFetch } from "../../services/api";

export default function FreedomWall() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [newPost, setNewPost] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyOpen, setReplyOpen] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  // ============================
  // FETCH POSTS
  // ============================
  async function fetchPosts() {
    const data = await apiFetch("/api/wall/posts/");
    setPosts(data);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  // ============================
  // SEARCH FILTER
  // ============================
  const filteredPosts = useMemo(() => {
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.user.school_id.toLowerCase().includes(search.toLowerCase())
    );
  }, [posts, search]);

  // ============================
  // CREATE POST
  // ============================
  async function createPost() {
    if (!newPost.trim()) return;

    const post = await apiFetch("/api/wall/posts/", {
      method: "POST",
      body: JSON.stringify({ content: newPost }),
    });

    setPosts((prev) => [post, ...prev]);
    setNewPost("");
  }

  // ============================
  // LIKE POST
  // ============================
  async function likePost(postId) {
    const res = await apiFetch(`/api/wall/posts/${postId}/like/`, {
      method: "POST",
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes_count: res.likes_count } : p
      )
    );
  }

  // ============================
  // CREATE COMMENT
  // ============================
  async function createComment(postId) {
    const content = commentDrafts[postId];
    if (!content?.trim()) return;

    const comment = await apiFetch("/api/wall/comments/", {
      method: "POST",
      body: JSON.stringify({ post: postId, content }),
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );

    setCommentDrafts({ ...commentDrafts, [postId]: "" });
  }

  // ============================
  // CREATE REPLY
  // ============================
  async function createReply(postId, parentId) {
    const content = replyDrafts[parentId];
    if (!content?.trim()) return;

    const reply = await apiFetch("/api/wall/comments/", {
      method: "POST",
      body: JSON.stringify({ post: postId, parent: parentId, content }),
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === parentId
                  ? { ...c, replies: [...c.replies, reply] }
                  : c
              ),
            }
          : p
      )
    );

    setReplyDrafts({ ...replyDrafts, [parentId]: "" });
    setReplyOpen(null);
  }

  // ============================
  // LIKE COMMENT / REPLY
  // ============================
  async function likeComment(commentId) {
    const res = await apiFetch(`/api/wall/comments/${commentId}/like/`, {
      method: "POST",
    });

    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        comments: p.comments.map((c) =>
          c.id === commentId
            ? { ...c, likes_count: res.likes_count }
            : {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? { ...r, likes_count: res.likes_count }
                    : r
                ),
              }
        ),
      }))
    );
  }

  // ============================
  // REPORT COMMENT
  // ============================
  async function reportComment(reason) {
    if (!reportTarget) return;

    await apiFetch(`/api/wall/comments/${reportTarget}/report/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });

    setMenuAnchor(null);
    setReportTarget(null);
  }

  return (
    <Box height="100vh" maxWidth={720} mx="auto" display="flex" flexDirection="column">
      {/* FIXED TOP BAR */}
      <Paper sx={{ position: "sticky", top: 0, zIndex: 10, p: 2 }}>
        <Typography variant="h5">Freedom Wall</Typography>

        <TextField
          fullWidth
          size="small"
          sx={{ mt: 1 }}
          placeholder="Search posts or School ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Share your thoughts..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />

        <Stack direction="row" justifyContent="flex-end" mt={1}>
          <Button variant="contained" onClick={createPost}>
            Post
          </Button>
        </Stack>
      </Paper>

      {/* SCROLLABLE FEED */}
      <Box flexGrow={1} overflow="auto" pt={2}>
        {filteredPosts.map((post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Avatar src={post.user.avatar_url || ""} />
                <Box>
                  <Typography fontWeight="bold">
                    {post.user.school_id}
                  </Typography>
                  <Typography variant="caption">
                    {new Date(post.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{ mt: 2 }}
                dangerouslySetInnerHTML={{
                  __html: post.rendered_content,
                }}
              />

              <Stack direction="row" spacing={2} mt={2}>
                <IconButton onClick={() => likePost(post.id)}>
                  <FavoriteIcon color="error" />
                </IconButton>
                <Typography>{post.likes_count}</Typography>

                <ChatBubbleOutlineIcon />
                <Typography>{post.comments_count}</Typography>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {post.comments.map((comment) => (
                <Box key={comment.id} ml={2} mb={2}>
                  <Stack direction="row" spacing={1}>
                    <Avatar
                      src={comment.user.avatar_url || ""}
                      sx={{ width: 28, height: 28 }}
                    />
                    <Box flexGrow={1}>
                      <Typography fontWeight="bold">
                        {comment.user.school_id}
                      </Typography>
                      <Typography variant="body2">
                        {comment.content}
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setReportTarget(comment.id);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1} ml={4}>
                    <IconButton
                      size="small"
                      onClick={() => likeComment(comment.id)}
                    >
                      <FavoriteIcon fontSize="small" />
                    </IconButton>
                    <Typography>{comment.likes_count}</Typography>

                    <IconButton
                      size="small"
                      onClick={() => setReplyOpen(comment.id)}
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  {replyOpen === comment.id && (
                    <Box ml={4} mt={1}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Reply..."
                        value={replyDrafts[comment.id] || ""}
                        onChange={(e) =>
                          setReplyDrafts({
                            ...replyDrafts,
                            [comment.id]: e.target.value,
                          })
                        }
                      />
                      <Button
                        size="small"
                        onClick={() =>
                          createReply(post.id, comment.id)
                        }
                      >
                        Reply
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}

              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={commentDrafts[post.id] || ""}
                onChange={(e) =>
                  setCommentDrafts({
                    ...commentDrafts,
                    [post.id]: e.target.value,
                  })
                }
              />
              <Button size="small" onClick={() => createComment(post.id)}>
                Comment
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* REPORT MENU */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => reportComment("Spam")}>
          Report Spam
        </MenuItem>
        <MenuItem onClick={() => reportComment("Abusive")}>
          Report Abuse
        </MenuItem>
        <MenuItem onClick={() => reportComment("Inappropriate")}>
          Report Inappropriate
        </MenuItem>
      </Menu>
    </Box>
  );
}
