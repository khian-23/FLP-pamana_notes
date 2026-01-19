import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const AdminTopbar = ({ isMobile, onMenuClick }) => {
  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" noWrap>
          Pamana Notes — Admin
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AdminTopbar;
