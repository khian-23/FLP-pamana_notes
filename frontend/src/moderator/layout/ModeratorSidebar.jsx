// src/moderator/layout/ModeratorSidebar.jsx

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

import PendingIcon from "@mui/icons-material/HourglassTop";
import DoneIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import UploadIcon from "@mui/icons-material/Upload";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";

import { useNavigate, useLocation } from "react-router-dom";
import { getUserCourse } from "../../services/auth";

const menu = [
  // ===== STUDENT FEATURES =====
  { label: "Home", icon: <HomeIcon />, path: "/moderator/home" },
  { label: "Upload Note", icon: <UploadIcon />, path: "/moderator/upload" },
  { label: "Saved Notes", icon: <BookmarkIcon />, path: "/moderator/bookmarks" },
  { label: "Freedom Wall", icon: <ForumIcon />, path: "/moderator/freedom-wall" },

  // ===== REVIEW =====
  { label: "Pending Notes", icon: <PendingIcon />, path: "/moderator/pending" },
  { label: "Moderated Notes", icon: <DoneIcon />, path: "/moderator/moderated" },

  // ===== PROFILE =====
  { label: "Profile", icon: <PersonIcon />, path: "/moderator/profile" },
];

export default function ModeratorSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const course = getUserCourse();

  return (
    <Box
      sx={{
        width: 260,
        minHeight: "100vh",
        bgcolor: "background.paper",
        color: "text.primary",
        px: 1.5,
        py: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={700} letterSpacing="0.04em">
          PAMANA NOTES
        </Typography>

        <Chip
          label="Moderator"
          size="small"
          color="success"
          variant="outlined"
          sx={{ mt: 1, fontWeight: 600 }}
        />

        {course && (
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 0.5, opacity: 0.75 }}
          >
            {course}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* MENU */}
      <List sx={{ gap: 0.5 }}>
        {menu.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onNavigate && onNavigate();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 2,
                py: 1.2,
                position: "relative",
                color: isActive ? "primary.main" : "text.secondary",
                bgcolor: isActive ? "rgba(110,231,183,0.12)" : "transparent",
                transition: "all 0.25s ease",
                "&:hover": {
                  bgcolor: "rgba(110,231,183,0.18)",
                },
              }}
            >
              {isActive && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    height: "60%",
                    width: 4,
                    bgcolor: "primary.main",
                    borderRadius: 2,
                  }}
                />
              )}

              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? "primary.main" : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
