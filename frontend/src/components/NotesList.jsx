import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/notes/api/notes/")
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response");
        }
        setNotes(data);
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
