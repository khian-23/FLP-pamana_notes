import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";

import { apiFetch } from "../../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await apiFetch("/accounts/api/users/");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id, role) => {
    await apiFetch(`/accounts/api/users/${id}/role/`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    loadUsers();
  };

  const toggleStatus = async (id, isActive) => {
    await apiFetch(`/accounts/api/users/${id}/status/`, {
      method: "POST",
      body: JSON.stringify({ is_active: !isActive }),
    });
    loadUsers();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Users Management
      </Typography>

      {loading && <Typography>Loading users...</Typography>}

      {!loading && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <Select
                      size="small"
                      value={user.role}
                      onChange={(e) =>
                        changeRole(user.id, e.target.value)
                      }
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="moderator">Moderator</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </TableCell>

                  <TableCell>
                    {user.is_active ? "Active" : "Inactive"}
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color={user.is_active ? "error" : "success"}
                        size="small"
                        onClick={() =>
                          toggleStatus(user.id, user.is_active)
                        }
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default Users;
