import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0b6623",
      dark: "#054d19",
      light: "#2e8b57",
    },
    secondary: {
      main: "#6ee7b7",
    },
    background: {
      default: "#0a1f16",
      paper: "#0f2e22",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.75)",
    },
    success: {
      main: "#16a34a",
    },
    warning: {
      main: "#d97706",
    },
    error: {
      main: "#dc2626",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body2: {
      color: "rgba(255,255,255,0.75)",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shadows: [
    "none",
    "0 2px 8px rgba(0,0,0,0.35)",
    "0 6px 20px rgba(0,0,0,0.45)",
    "0 10px 30px rgba(0,0,0,0.55)",
    ...Array(21).fill("0 12px 36px rgba(0,0,0,0.6)"),
  ],

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingLeft: 24,
          paddingRight: 24,
          transition: "all 0.25s ease",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 16,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
