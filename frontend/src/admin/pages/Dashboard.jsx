import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import { fetchDashboardStats } from "../../services/adminApi";

/* =========================
   KPI CARD
========================= */
const StatCard = ({ title, value, icon }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2,
      bgcolor: "#0b6623",
      color: "#fff",
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.15)",
          p: 1,
          borderRadius: 1.5,
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

/* =========================
   DASHBOARD
========================= */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        setStats(data.stats);
        setUploads(data.uploads_per_day || []);
        setSubjects(data.uploads_by_subject || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return <Typography>Failed to load dashboard.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Admin Dashboard
      </Typography>

      {/* KPI GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(5, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard title="Total Users" value={stats.total_users} icon={<PeopleIcon />} />
        <StatCard title="Total Notes" value={stats.total_notes} icon={<DescriptionIcon />} />
        <StatCard title="Pending Notes" value={stats.pending_notes} icon={<PendingIcon />} />
        <StatCard title="Approved Notes" value={stats.approved_notes} icon={<CheckCircleIcon />} />
        <StatCard title="Rejected Notes" value={stats.rejected_notes} icon={<CancelIcon />} />
      </Box>

      {/* UPLOAD TREND */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography fontWeight="bold" mb={2}>
          Notes Upload Trend
        </Typography>

        {uploads.length < 2 ? (
          <Typography color="text.secondary">
            Not enough data to display chart.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uploads}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                dataKey="notes"
                stroke="#0b6623"
                strokeWidth={3}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* UPLOADS BY SUBJECT */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography fontWeight="bold" mb={2}>
          Uploads by Subject
        </Typography>

        {subjects.length === 0 ? (
          <Typography color="text.secondary">
            No subject data available.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjects}>
              <XAxis dataKey="subject" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="notes" fill="#0b6623" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}
