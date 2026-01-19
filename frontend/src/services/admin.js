import { apiFetch } from "./api";

export function fetchPendingNotes() {
  return apiFetch("/notes/api/pending/");
}

export function approveNote(id) {
  return apiFetch(`/notes/api/approve/${id}/`, {
    method: "POST",
  });
}

export function rejectNote(id, reason) {
  return apiFetch(`/notes/api/reject/${id}/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
