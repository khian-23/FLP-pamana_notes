import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

import { login, isAdmin } from "../services/auth";

export default function LoginPage() {
  const [school_id, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(school_id, password);

      if (isAdmin()) {
        navigate("/admin");
      } else {
        navigate("/app");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0b6623",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: 360,
          p: 4,
          backgroundColor: "#054d19",
          borderRadius: 2
        }}
      >
        <Typography
          variant="h5"
          color="white"
          textAlign="center"
          mb={3}
        >
          Login
        </Typography>

        <TextField
          label="School ID"
          variant="outlined"
          fullWidth
          margin="normal"
          value={school_id}
          onChange={(e) => setSchoolId(e.target.value)}
          InputLabelProps={{ style: { color: "#fff" } }}
          InputProps={{ style: { color: "#fff" } }}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ style: { color: "#fff" } }}
          InputProps={{ style: { color: "#fff" } }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: "#087f30",
            "&:hover": { backgroundColor: "#0aa03d" }
          }}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
}
