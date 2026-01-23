import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from "@mui/material";

import PendingIcon from "@mui/icons-material/HourglassTop";
import DoneIcon from "@mui/icons-material/CheckCircle";

import { useNavigate, useLocation } from "react-router-dom";
import { getUserCourse } from "../../services/auth";
import HomeIcon from "@mui/icons-material/Home";
import UploadIcon from "@mui/icons-material/Upload";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";
import Divider from "@mui/material/Divider";
const menu = [
  // ===== SHARED (STUDENT FEATURES) =====
  {
    label: "Home",
    icon: <HomeIcon />,
    path: "/moderator/home",
  },
  {
    label: "Upload Note",
    icon: <UploadIcon />,
    path: "/moderator/upload",
  },
  {
    label: "Saved Notes",
    icon: <BookmarkIcon />,
    path: "/moderator/bookmarks",
  },
  {
    label: "Freedom Wall",
    icon: <ForumIcon />,
    path: "/moderator/freedom-wall",
  },


  // ===== REVIEW =====
  {
    label: "Pending Notes",
    icon: <PendingIcon />,
    path: "/moderator/pending",
  },
  {
    label: "Moderated Notes",
    icon: <DoneIcon />,
    path: "/moderator/moderated",
  },
    {
    label: "Profile",
    icon: <PersonIcon />,
    path: "/moderator/profile",
  },
];


export default function ModeratorSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const course = getUserCourse();

  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#0b6623",
        color: "white",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          PAMANA NOTES
        </Typography>

        <Chip
          label="Moderator"
          size="small"
          color="success"
          variant="outlined"
          sx={{ mt: 1 }}
        />

        {course && (
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 0.5, opacity: 0.85 }}
          >
            {course}
          </Typography>
        )}
      </Box>

      {/* MENU */}
      <List>
        {menu.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
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
