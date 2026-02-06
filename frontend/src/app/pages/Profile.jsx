import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";

import {
  getProfile,
  updateStudentProfile,
} from "../../services/profileApi";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setEmail(data.email || "");
        setAvatarPreview(
          data.avatar_url ? `${data.avatar_url}?t=${Date.now()}` : ""
        );
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  /* ================= AVATAR PREVIEW ================= */
  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  /* ================= SAVE ================= */
  async function handleSave() {
    if (saving) return;
    setError("");
    setSuccess("");

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }

    const changedEmail = email !== (profile?.email || "");
    const changedAvatar = Boolean(avatarFile);

    if (!changedEmail && !changedAvatar) {
      setEditMode(false);
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      if (changedEmail) formData.append("email", email);
      if (changedAvatar) formData.append("avatar", avatarFile);

      const updated = await updateStudentProfile(formData);

      setProfile(updated);
      setEmail(updated.email || "");
      setAvatarPreview(
        updated.avatar_url ? `${updated.avatar_url}?t=${Date.now()}` : ""
      );

      setAvatarFile(null);
      setEditMode(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      let msg = "Failed to update profile.";
      try {
        const data = JSON.parse(err?.message || "");
        if (typeof data === "string") msg = data;
        else if (data?.detail) msg = data.detail;
        else if (data?.email) msg = data.email;
        else if (data?.avatar) msg = data.avatar;
        else if (data?.non_field_errors?.length) {
          msg = data.non_field_errors[0];
        }
      } catch {}
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Typography>No profile data.</Typography>;
  }

  /* ================= UI ================= */
  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3, color: "#111827" }}
      >
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          backgroundColor: "#155a1d",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* HEADER */}
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            src={avatarPreview || ""}
            sx={{
              width: 96,
              height: 96,
              bgcolor: "#a0a6b3",
              color: "#374151",
              fontSize: 32,
            }}
          />

          <Box>
            <Typography
              fontSize={18}
              fontWeight={700}
              sx={{ color: "#111827" }}
            >
              {profile.first_name} {profile.last_name}
            </Typography>

            <Typography fontSize={13} sx={{ color: "#6b7280" }}>
              School ID: {profile.school_id}
            </Typography>
          </Box>
        </Stack>

        {editMode && (
          <Button
            component="label"
            variant="outlined"
            size="small"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Change Avatar
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Button>
        )}

        <Divider sx={{ my: 4 }} />

        {/* FORM */}
        <Stack spacing={2.5}>
          <TextField
            label="Email"
            value={email}
            disabled={!editMode || saving}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="First Name"
            value={profile.first_name || ""}
            disabled
            fullWidth
          />

          <TextField
            label="Last Name"
            value={profile.last_name || ""}
            disabled
            fullWidth
          />
        </Stack>

        {/* ACTIONS */}
        <Box sx={{ mt: 4 }}>
          {!editMode ? (
            <Button
              variant="contained"
              onClick={() => setEditMode(true)}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                backgroundColor: "#0b6623",
                "&:hover": { backgroundColor: "#15803d" },
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                disabled={saving}
                onClick={handleSave}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundColor: "#0b6623",
                  "&:hover": { backgroundColor: "#15803d" },
                }}
              >
                Save Changes
              </Button>

              <Button
                variant="outlined"
                disabled={saving}
                sx={{ borderRadius: 2 }}
                onClick={() => {
                  setEditMode(false);
                  setEmail(profile.email || "");
                  if (avatarPreview?.startsWith("blob:")) {
                    URL.revokeObjectURL(avatarPreview);
                  }
                  setAvatarPreview(
                    profile.avatar_url
                      ? `${profile.avatar_url}?t=${Date.now()}`
                      : ""
                  );
                  setAvatarFile(null);
                  setError("");
                  setSuccess("");
                }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
