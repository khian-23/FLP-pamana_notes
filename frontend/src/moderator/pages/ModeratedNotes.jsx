import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

export default function ModeratedNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    apiFetch("/notes/api/moderated/").then(setNotes);
  }, []);

  return (
    <div>
      <h2>Reviewed Notes</h2>

      {!notes.length && <p>No reviewed notes.</p>}

      {notes.map(note => (
        <div key={note.id} style={{ borderBottom: "1px solid #ddd", padding: 10 }}>
          <strong>{note.title}</strong>
          <p>Status: {note.is_approved ? "Approved" : "Rejected"}</p>
        </div>
      ))}
    </div>
  );
}
