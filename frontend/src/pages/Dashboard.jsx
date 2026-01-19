import { useNavigate } from "react-router-dom";
import { isAdmin, logout } from "../services/auth";
import NotesList from "../components/NotesList";

function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <h2>Dashboard</h2>

      <button onClick={handleLogout}>Logout</button>

      {isAdmin() && (
        <button onClick={() => navigate("/admin")}>
          Admin Panel
        </button>
      )}

      <NotesList />
    </div>
  );
}

export default Dashboard;
