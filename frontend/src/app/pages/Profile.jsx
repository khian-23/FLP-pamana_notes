import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  TextField,
  Button,
} from "@mui/material";

import {
  getProfile,
  updateStudentProfile,
} from "../../services/profileApi";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EDIT STATE (CONTROLLED — NEVER UNDEFINED)
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

        // ALWAYS SET FALLBACKS
        setEmail(data.email || "");
        setAvatarPreview(
          data.avatar_url
            ? `${data.avatar_url}?t=${Date.now()}`
            : ""
        );

      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // ============================
  // AVATAR PREVIEW
  // ============================
  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  // ============================
  // SAVE PROFILE
  // ============================
  async function handleSave() {
    try {
      const formData = new FormData();

      // Backend allows updating email
      formData.append("email", email || "");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const updated = await updateStudentProfile(formData);

      // Sync UI with backend response
      setProfile(updated);
      setEmail(updated.email || "");
      setAvatarPreview(
          updated.avatar_url
            ? `${updated.avatar_url}?t=${Date.now()}`
            : ""
        );


      setEditMode(false);
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  }

  // ============================
  // RENDER STATES
  // ============================
  if (loading) return <Typography>Loading profile...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!profile) return <Typography>No profile data.</Typography>;

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        My Profile
      </Typography>

      <Stack spacing={3} maxWidth={420}>
        {/* Avatar */}
        <Avatar
          src={avatarPreview || ""}
          sx={{ width: 96, height: 96 }}
        />

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
        <TextField
          label="School ID"
          value={profile.school_id || ""}
          disabled
        />

        {/* Email (Editable) */}
        <TextField
          label="Email"
          value={email}
          disabled={!editMode}
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

        {/* ACTION BUTTONS */}
        {!editMode ? (
          <Button
            variant="contained"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleSave}
            >
              Save
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setEditMode(false);
                setEmail(profile.email || "");
                setAvatarPreview(profile.avatar_url || "");
                setAvatarFile(null);
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
