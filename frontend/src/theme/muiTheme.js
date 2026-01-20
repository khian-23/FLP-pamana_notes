import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0b6623",
      dark: "#054d19",
      light: "#2e8b57"
    },
    background: {
      default: "#0b6623",
      paper: "#054d19"
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.8)"
    }
  },

  typography: {
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 600
    },
    button: {
      textTransform: "none",
      fontWeight: 600
    }
  },

  shape: {
    borderRadius: 10
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    }
  }
});

export default theme;
