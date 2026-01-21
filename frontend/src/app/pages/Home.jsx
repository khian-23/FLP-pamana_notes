import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
} from "@mui/material";
import axios from "axios";

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          "http://127.0.0.1:8000/notes/api/student/dashboard/",
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        setNotes(res.data.notes || []);
        setFilteredNotes(res.data.notes || []);
      } catch {
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // 🔍 SEARCH LOGIC
  useEffect(() => {
    const q = search.toLowerCase();

    const data = notes.filter((note) =>
      note.title.toLowerCase().includes(q) ||
      (note.subject && note.subject.toLowerCase().includes(q))
    );

    setFilteredNotes(data);
  }, [search, notes]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Latest Notes
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        label="Search notes by title or subject"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {!filteredNotes.length && (
        <Typography>No notes found.</Typography>
      )}

      {/* NOTES GRID */}
      <Grid container spacing={2}>
        {filteredNotes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {note.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Subject: {note.subject}
                </Typography>

                <Typography variant="caption" display="block">
                  Uploaded by: {note.author_school_id}
                </Typography>

                <Typography variant="caption" display="block">
                  Visibility: {note.visibility}
                </Typography>

                {note.file && (
                  <Button
                    size="small"
                    href={note.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                  >
                    View PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
