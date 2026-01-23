import { apiFetch } from "./api";

export function fetchDashboardStats() {
  return apiFetch("/notes/api/admin/dashboard/")
}
