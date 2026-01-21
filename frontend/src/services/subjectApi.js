import { apiFetch } from "./api";

export function fetchStudentSubjects() {
  return apiFetch("/api/subjects/student/");
}
