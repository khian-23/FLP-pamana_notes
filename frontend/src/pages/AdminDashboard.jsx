import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function AdminDashboard() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    apiFetch("/notes/api/pending/")
      .then(setNotes)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {notes.length === 0 && <p>No pending notes</p>}

      {notes.map(note => (
        <div key={note.id}>
          <strong>{note.title}</strong>
          <button onClick={() => apiFetch(`/notes/api/approve/${id}/`, { method: "POST" })}>
            Approve
          </button>
          <button onClick={() => apiFetch(`/notes/api/reject/${id}/`, {
              method: "POST",
              body: JSON.stringify({ reason }),
            })}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
