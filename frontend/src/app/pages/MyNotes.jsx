import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";
import axios from "axios";

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyNotes = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          "http://127.0.0.1:8000/notes/api/student/my-notes/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setNotes(res.data || []);
      } catch {
        setError("Failed to load your notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyNotes();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!notes.length) return <Typography>No uploaded notes.</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Notes
      </Typography>

      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{note.title}</Typography>

                <Chip
                  label={note.status}
                  color={statusColor(note.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyNotes;
