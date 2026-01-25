// src/app/layout/StudentSidebar.jsx

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadIcon from "@mui/icons-material/Upload";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";

import { useNavigate, useLocation } from "react-router-dom";

const menu = [
  { label: "Home", icon: <HomeIcon />, path: "/app/home" },
  { label: "My Notes", icon: <DescriptionIcon />, path: "/app/my-notes" },
  { label: "Upload Note", icon: <UploadIcon />, path: "/app/upload" },
  { label: "Saved Notes", icon: <BookmarkIcon />, path: "/app/bookmarks" },
  { label: "Freedom Wall", icon: <ForumIcon />, path: "/app/freedom-wall" },
  { label: "Profile", icon: <PersonIcon />, path: "/app/profile" },
];

export default function StudentSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

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
      <Typography
        variant="h6"
        fontWeight={700}
        textAlign="center"
        sx={{ mb: 3, letterSpacing: "0.04em" }}
      >
        PAMANA NOTES
      </Typography>

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
