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

  // EDIT STATE
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // ============================
  // FETCH PROFILE
  // ============================
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

  // ============================
  // AVATAR PREVIEW (SAFE)
  // ============================
  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoke old blob URL
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  // ============================
  // SAVE PROFILE (HARDENED)
  // ============================
  async function handleSave() {
    if (saving) return;
    setError("");
    setSuccess("");

    // basic validation
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
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  // ============================
  // RENDER
  // ============================
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Typography>No profile data.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        My Profile
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Stack spacing={3} maxWidth={420}>
        {/* Avatar */}
        <Avatar src={avatarPreview || ""} sx={{ width: 96, height: 96 }} />

        {editMode && (
          <Button variant="outlined" component="label">
            Change Avatar
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Button>
        )}

        {/* School ID */}
        <TextField label="School ID" value={profile.school_id || ""} disabled />

        {/* Email */}
        <TextField
          label="Email"
          value={email}
          disabled={!editMode || saving}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* First Name */}
        <TextField
          label="First Name"
          value={profile.first_name || ""}
          disabled
        />

        {/* Last Name */}
        <TextField
          label="Last Name"
          value={profile.last_name || ""}
          disabled
        />

        {!editMode ? (
          <Button variant="contained" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={saving}
              onClick={handleSave}
            >
              Save
            </Button>

            <Button
              variant="outlined"
              disabled={saving}
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
      </Stack>
    </Box>
  );
}
