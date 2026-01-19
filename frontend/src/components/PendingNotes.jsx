import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

function PendingNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    try {
      const data = await apiFetch("/notes/api/pending/");
      setNotes(data);
    } catch (err) {
      console.error("Failed to load pending notes", err);
    } finally {
      setLoading(false);
    }
  }

  async function approveNote(id) {
    await apiFetch(`/notes/api/approve/${id}/`, { method: "POST" });
    loadNotes();
  }

  async function rejectNote(id) {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    await apiFetch(`/notes/api/reject/${id}/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });

    loadNotes();
  }

  useEffect(() => {
    loadNotes();
  }, []);

  if (loading) return <p>Loading pending notes…</p>;

  if (!notes.length) return <p>No pending notes.</p>;

  return (
    <div>
      <h3>Pending Notes</h3>

      {notes.map((note) => (
        <div key={note.id} style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
          <strong>{note.title}</strong>
          <p>{note.description}</p>

          <button onClick={() => approveNote(note.id)}>Approve</button>
          <button onClick={() => rejectNote(note.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}

export default PendingNotes;
