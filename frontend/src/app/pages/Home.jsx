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
} from "@mui/material";
import axios from "axios";

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          "http://127.0.0.1:8000/notes/api/student/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setNotes(res.data.notes || []);
      } catch {
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

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

  if (!notes.length) {
    return <Typography>No notes available.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Latest Notes
      </Typography>

      <Grid container spacing={2}>
        {notes.map((note) => (
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
                  Status: {note.status}
                </Typography>

                {note.file && (
                  <Button
                    size="small"
                    href={note.file}
                    target="_blank"
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
