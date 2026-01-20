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
  BarChart,
  Bar,
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
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        setStats(data.stats);
        setUploads(data.uploads_per_day);
        setSubjects(data.uploads_by_subject);
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

      {/* UPLOAD TREND */}
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Notes Upload Trend
        </Typography>

        <Box sx={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={uploads}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line dataKey="notes" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* UPLOADS BY SUBJECT */}
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Uploads by Subject
        </Typography>

        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={subjects}>
              <XAxis dataKey="subject" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="notes" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
