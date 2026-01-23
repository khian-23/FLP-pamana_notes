import { apiFetch } from "./api";

export async function toggleSaveNote(noteId) {
  return apiFetch(`/api/notes/notes/${noteId}/save/`, {
    method: "POST",
  });
}


export async function fetchSavedNotes() {
  return apiFetch("/notes/api/student/saved/");
}