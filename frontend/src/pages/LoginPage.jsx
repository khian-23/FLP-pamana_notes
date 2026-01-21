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

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);

  const navigate = useNavigate();

  // 🔹 Load courses when switching to register
  useEffect(() => {
    if (mode !== "register") return;

    setLoadingSubjects(true);
    setSubjectsError(null);

    fetch("http://127.0.0.1:8000/api/subjects/courses/public/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load courses");
        return res.json();
      })
      .then((data) => setSubjects(data))
      .catch(() => setSubjectsError("Unable to load courses"))
      .finally(() => setLoadingSubjects(false));
  }, [mode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(school_id, password);
      navigate(isAdmin() ? "/admin" : "/app");
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

    alert("Account created. Please log in.");
    setMode("login");
    setPassword("");
    setConfirmPassword("");
  };

  const passwordsMatch =
    mode === "login" || password === confirmPassword;

  const canRegister =
    !loadingSubjects &&
    subjects.length > 0 &&
    passwordsMatch;

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
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        }}
      >
        <Typography color="white" variant="h5" textAlign="center">
          {mode === "login" ? "Login" : "Register"}
        </Typography>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

        <TextField
          label="School ID"
          fullWidth
          margin="normal"
          value={school_id}
          onChange={(e) => setSchoolId(e.target.value)}
          required
          InputLabelProps={{ style: { color: "#fff" } }}
          InputProps={{ style: { color: "#fff" } }}
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
              InputLabelProps={{ style: { color: "#fff" } }}
              InputProps={{ style: { color: "#fff" } }}
            />

            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              required
              InputLabelProps={{ style: { color: "#fff" } }}
              InputProps={{ style: { color: "#fff" } }}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputLabelProps={{ style: { color: "#fff" } }}
              InputProps={{ style: { color: "#fff" } }}
            />

            {loadingSubjects ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : subjectsError ? (
              <Typography color="error" textAlign="center" mt={1}>
                {subjectsError}
              </Typography>
            ) : (
              <TextField
                select
                label="Course"
                fullWidth
                margin="normal"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                InputLabelProps={{ style: { color: "#fff" } }}
                InputProps={{ style: { color: "#fff" } }}
              >
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
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
          InputLabelProps={{ style: { color: "#fff" } }}
          InputProps={{ style: { color: "#fff" } }}
        />

        {mode === "register" && (
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!passwordsMatch}
            helperText={
              !passwordsMatch ? "Passwords do not match" : ""
            }
            required
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{ style: { color: "#fff" } }}
          />
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={mode === "register" && !canRegister}
          sx={{
            mt: 3,
            backgroundColor: "#087f30",
            "&:hover": { backgroundColor: "#0aa03d" },
            py: 1.2,
            fontWeight: 600,
          }}
        >
          {mode === "login" ? "Login" : "Register"}
        </Button>

        <Typography
          mt={3}
          textAlign="center"
          color="rgba(255,255,255,0.85)"
          fontSize={14}
        >
          {mode === "login" ? (
            <>
              No account?{" "}
              <Box
                component="span"
                sx={{ cursor: "pointer", fontWeight: 600, color: "#7CFC9A" }}
                onClick={() => setMode("register")}
              >
                Register
              </Box>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Box
                component="span"
                sx={{ cursor: "pointer", fontWeight: 600, color: "#7CFC9A" }}
                onClick={() => setMode("login")}
              >
                Login
              </Box>
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
