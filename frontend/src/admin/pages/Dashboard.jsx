import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

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
} from "recharts";

import { fetchDashboardStats } from "../../services/adminApi";

/* =========================
   KPI CARD
========================= */
const StatCard = ({ title, value, icon }) => (
  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </Box>
      <Box sx={{ bgcolor: "grey.100", p: 1, borderRadius: 1 }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

/* =========================
   DASHBOARD
========================= */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        setStats(data.stats);
        setUploads(data.uploads_per_day);
      })
      .catch(console.error);
  }, []);

  if (!stats) {
    return <Typography>Loading dashboard…</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
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
        }}
      >
        <StatCard title="Total Users" value={stats.total_users} icon={<PeopleIcon />} />
        <StatCard title="Total Notes" value={stats.total_notes} icon={<DescriptionIcon />} />
        <StatCard title="Pending Notes" value={stats.pending_notes} icon={<PendingIcon />} />
        <StatCard title="Approved Notes" value={stats.approved_notes} icon={<CheckCircleIcon />} />
        <StatCard title="Rejected Notes" value={stats.rejected_notes} icon={<CancelIcon />} />
      </Box>

      {/* CHART */}
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Notes Upload Trend
        </Typography>

        {/* IMPORTANT: non-flex wrapper with minHeight */}
        <Box sx={{ width: "100%", minHeight: 260 }}>
          <ResponsiveContainer width="100%" aspect={2.5}>
            <LineChart data={uploads}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line dataKey="notes" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;