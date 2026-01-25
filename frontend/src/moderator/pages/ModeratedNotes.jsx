import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import NoteDetailModal from "../../app/pages/NoteDetailModal";

export default function ModeratedNotes() {
  const [notes, setNotes] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    apiFetch("/notes/api/moderated/").then(setNotes);
  }, []);

  const viewNote = async (id) => {
    const note = await apiFetch(`/notes/api/notes/${id}/`);
    setSelectedNote(note);
    setOpen(true);
  };

  return (
    <>
      <h2>Reviewed Notes</h2>

      {!notes.length && <p>No reviewed notes.</p>}

      {notes.map((note) => (
        <div
          key={note.id}
          style={{ borderBottom: "1px solid #ddd", padding: 10 }}
        >
          <strong>{note.title}</strong>
          <p>Status: {note.is_approved ? "Approved" : "Rejected"}</p>

          <button onClick={() => viewNote(note.id)}>View</button>
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
