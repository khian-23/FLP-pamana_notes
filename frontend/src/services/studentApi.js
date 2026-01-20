import { getAccessToken } from "./auth";

const BASE_URL = "http://127.0.0.1:8000/notes/api";

export async function fetchStudentDashboard() {
  const res = await fetch(`${BASE_URL}/student/dashboard/`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to load student dashboard");
  }

  return res.json();
}
