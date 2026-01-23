import { apiFetch } from "./api";

/**
 * Get authenticated student profile
 */
export function getProfile() {
  return apiFetch("/api/accounts/student/profile/");
}

/**
 * Update student profile (email, avatar, bio)
 * NOTE: Do NOT set Content-Type manually (FormData)
 */
export function updateStudentProfile(data) {
  return apiFetch("/api/accounts/student/profile/update/", {
    method: "PATCH",
    body: data,
  });
}