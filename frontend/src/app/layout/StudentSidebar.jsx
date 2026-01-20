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
  { label: "Home", icon: <HomeIcon />, path: "/app" },
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
        bgcolor: "#0b6623",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        textAlign="center"
        py={2}
      >
        PAMANA NOTES
      </Typography>

      <List>
        {menu.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              onNavigate && onNavigate();
            }}
            sx={{
              "&.Mui-selected": { bgcolor: "#0e7c2f" },
              "&:hover": { bgcolor: "#0e7c2f" },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
