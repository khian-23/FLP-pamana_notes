import { apiFetch, API_BASE } from "./api";

export async function fetchStudentDashboard() {
  return apiFetch("/notes/api/student/dashboard/");
}
