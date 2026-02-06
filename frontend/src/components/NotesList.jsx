import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/notes/public/")
      .then((data) => {
        if (!data || !Array.isArray(data.notes)) {
          throw new Error("Invalid API response");
        }
        setNotes(data.notes);
      })
      .catch(() => setError("Unauthorized or failed to load notes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading notes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <strong>{note.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesList;
