import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

export default function ModeratorPendingNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    apiFetch("/notes/api/pending/").then(setNotes);
  }, []);

  async function approve(id) {
    await apiFetch(`/notes/api/approve/${id}/`, { method: "POST" });
    setNotes(notes.filter(n => n.id !== id));
  }

  async function reject(id) {
    const reason = prompt("Reason?");
    if (!reason) return;
    await apiFetch(`/notes/api/reject/${id}/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    setNotes(notes.filter(n => n.id !== id));
  }

  return (
    <div>
      <h3>Pending Notes</h3>
      {notes.map(n => (
        <div key={n.id}>
          <b>{n.title}</b>
          <button onClick={() => approve(n.id)}>Approve</button>
          <button onClick={() => reject(n.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
