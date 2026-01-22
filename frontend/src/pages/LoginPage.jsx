import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import { login, isAdmin } from "../services/auth";

export default function LoginPage() {
  const [mode, setMode] = useState("login");

  const [school_id, setSchoolId] = useState("");
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [course, setCourse] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "register") return;

    setLoadingCourses(true);
    fetch("http://127.0.0.1:8000/api/subjects/courses/public/")
      .then((res) => res.json())
      .then(setCourses)
      .finally(() => setLoadingCourses(false));
  }, [mode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(school_id, password);
      navigate(isAdmin() ? "/admin" : "/app/home");
    } catch {
      alert("Invalid credentials");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        school_id,
        email,
        first_name,
        last_name,
        course,
        password,
        confirm_password: confirmPassword,
      }),
    });

    if (!res.ok) {
      alert("Registration failed");
      return;
    }

    // 🔑 AUTO LOGIN AFTER REGISTER
    try {
      await login(school_id, password);
      navigate("/app/home");
    } catch {
      alert("Account created, please log in.");
      setMode("login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #043d17, #0b6623)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        sx={{
          width: 420,
          p: 4,
          backgroundColor: "#054d19",
          borderRadius: 3,
        }}
      >
        <Typography color="white" variant="h5" textAlign="center">
          {mode === "login" ? "Login" : "Register"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <TextField
          label="School ID"
          fullWidth
          margin="normal"
          value={school_id}
          onChange={(e) => setSchoolId(e.target.value)}
          required
        />

        {mode === "register" && (
          <>
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {loadingCourses ? (
              <CircularProgress size={22} />
            ) : (
              <TextField
                select
                label="Course"
                fullWidth
                margin="normal"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </>
        )}

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mode === "register" && (
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
        >
          {mode === "login" ? "Login" : "Register"}
        </Button>

        <Typography mt={2} textAlign="center">
          {mode === "login" ? (
            <span onClick={() => setMode("register")} style={{ cursor: "pointer" }}>
              No account? Register
            </span>
          ) : (
            <span onClick={() => setMode("login")} style={{ cursor: "pointer" }}>
              Already have an account? Login
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
