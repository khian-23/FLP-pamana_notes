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
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const url = token
          ? "http://127.0.0.1:8000/notes/api/student/dashboard/"
          : "http://127.0.0.1:8000/notes/api/public/";

        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = token ? res.data.notes : res.data;
        setNotes(data || []);
        setFilteredNotes(data || []);
      } catch {
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [token]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredNotes(
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.subject && n.subject.toLowerCase().includes(q))
      )
    );
  }, [search, notes]);

  const handleViewDetails = (id) => {
    if (!token) {
      navigate("/login");
    } else {
      navigate(`/app/notes/${id}`);
    }
  };

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
        {token ? "Latest Notes" : "Public Notes"}
      </Typography>

      <TextField
        fullWidth
        label="Search notes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {!filteredNotes.length && <Typography>No notes found.</Typography>}

      <Grid container spacing={2}>
        {filteredNotes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{note.title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  Subject: {note.subject}
                </Typography>

                <Typography variant="caption" display="block">
                  Uploaded by: {note.author_school_id}
                </Typography>

                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => handleViewDetails(note.id)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
