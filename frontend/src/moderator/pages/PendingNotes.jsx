import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

export default function PendingNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    const data = await apiFetch("/notes/api/pending/");
    setNotes(data);
    setLoading(false);
  };

  const approveNote = async (id) => {
    await apiFetch(`/notes/api/approve/${id}/`, { method: "POST" });
    loadNotes();
  };

  const rejectNote = async (id) => {
    const reason = prompt("Reason for rejection");
    if (!reason) return;

    await apiFetch(`/notes/api/reject/${id}/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    loadNotes();
  };

  useEffect(() => {
    loadNotes();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!notes.length) return <p>No pending notes.</p>;

  return (
    <div>
      <h2>Pending Notes (My Course)</h2>

      {notes.map(note => (
        <div key={note.id} style={{ borderBottom: "1px solid #ddd", padding: 10 }}>
          <strong>{note.title}</strong>
          <p>{note.description}</p>

          <button onClick={() => approveNote(note.id)}>Approve</button>
          <button onClick={() => rejectNote(note.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
