import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import NoteDetailModal from "../../app/pages/NoteDetailModal";

export default function PendingNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const loadNotes = async () => {
    const data = await apiFetch("/notes/api/pending/");
    setNotes(data);
    setLoading(false);
  };

  const viewNote = async (id) => {
    const note = await apiFetch(`/notes/api/notes/${id}/`);
    setSelectedNote(note);
    setOpen(true);
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
    <>
      <h2>Pending Notes</h2>

      {notes.map((note) => (
        <div
          key={note.id}
          style={{ borderBottom: "1px solid #ddd", padding: 10 }}
        >
          <strong>{note.title}</strong>
          <p>{note.description}</p>

          <button onClick={() => viewNote(note.id)}>View</button>
          <button onClick={() => approveNote(note.id)}>Approve</button>
          <button onClick={() => rejectNote(note.id)}>Reject</button>
        </div>
      ))}

      <NoteDetailModal
        open={open}
        onClose={() => setOpen(false)}
        note={selectedNote}
      />
    </>
  );
}
