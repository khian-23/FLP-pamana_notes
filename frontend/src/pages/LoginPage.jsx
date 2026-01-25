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
  InputAdornment,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { login, getUserRole } from "../services/auth";

export default function LoginPage() {
  const [mode, setMode] = useState("login");

  const [school_id, setSchoolId] = useState("");
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [course, setCourse] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleDetected, setRoleDetected] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "register") return;

    setLoadingCourses(true);
    fetch("http://127.0.0.1:8000/api/subjects/courses/public/")
      .then((res) => res.json())
      .then(setCourses)
      .finally(() => setLoadingCourses(false));
  }, [mode]);

  const redirectByRole = () => {
    const role = getUserRole();
    setRoleDetected(role);

    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "moderator") {
        navigate("/moderator/pending", { replace: true });
      } else {
        navigate("/app/home", { replace: true });
      }
    }, 900);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(school_id, password);
      redirectByRole();
    } catch {
      setError("Invalid School ID or password.");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

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
      setError("Registration failed. Please check your details.");
      setLoading(false);
      return;
    }

    try {
      await login(school_id, password);
      redirectByRole();
    } catch {
      setMode("login");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(circle at top right, rgba(185,246,202,0.18), transparent 40%),
          radial-gradient(circle at bottom left, rgba(14,122,47,0.35), transparent 45%),
          linear-gradient(135deg, #043d17 0%, #0b6623 60%, #054d19 100%)
        `,
      }}
    >
      <Box
        component="form"
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        sx={{
          width: 440,
          maxWidth: "92vw",
          p: 4.5,
          borderRadius: 4,
          backdropFilter: "blur(14px)",
          background: "rgba(255,255,255,0.12)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          color: "white",
        }}
      >
        <Typography variant="h5" fontWeight={700} textAlign="center">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </Typography>

        <Typography
          textAlign="center"
          fontSize={14}
          sx={{ opacity: 0.85, mt: 0.5 }}
        >
          PAMANA Notes Academic Platform
        </Typography>

        <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.25)" }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {roleDetected && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Chip
              label={`Logging in as ${roleDetected.toUpperCase()}`}
              color="success"
              variant="outlined"
            />
          </Box>
        )}

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
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
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
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {mode === "register" && (
          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            py: 1.4,
            fontWeight: 700,
            borderRadius: 3,
          }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : mode === "login" ? (
            "Login"
          ) : (
            "Register"
          )}
        </Button>

        <Typography
          mt={3}
          textAlign="center"
          fontSize={14}
          sx={{ opacity: 0.85 }}
        >
          {mode === "login" ? (
            <span
              onClick={() => setMode("register")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              No account? Register
            </span>
          ) : (
            <span
              onClick={() => setMode("login")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Already have an account? Login
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
