import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Navigate, useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [newData, setNewData] = useState({ deviceId: '', temperature: '', pressure: '', humidity: '', readingDate: '' });

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("user");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode<{ isAdmin?: boolean; role?: string }>(token);
      isAdmin = decoded.isAdmin || decoded.role === "admin";
    } catch {}
  }
  if (!isAdmin) return <Navigate to="/dashboard" />;

  useEffect(() => {
    if (!token) return;
    axios.get("http://localhost:3100/api/user/all-users", {
      headers: { "x-auth-token": token }
    }).then(res => setUsers(res.data));
  }, [token]);

  // Otwieranie dialogu zmiany roli
  const handleOpenRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setRoleDialogOpen(true);
  };

  // Zamknięcie dialogu
  const handleCloseRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole("user");
  };

  // Potwierdzenie zmiany roli
  const handleConfirmRoleChange = () => {
  if (!selectedUser) return;
  axios.patch(`http://localhost:3100/api/user/${selectedUser._id}/role`, {
    role: selectedRole,
    isAdmin: selectedRole === "admin"
  }, {
    headers: { "x-auth-token": token }
  })
  .then(res => {
    setUsers(users => users.map(u => u._id === selectedUser._id ? res.data : u));
    handleCloseRoleDialog();
  })
  .catch(err => {
    alert("Nie udało się zmienić roli: " + (err?.response?.data?.error || err.message));
    handleCloseRoleDialog();
  });
};



  const handleDelete = (userId: string) => {
    axios.delete(`http://localhost:3100/api/user/delete/${userId}`, {
      headers: { "x-auth-token": token }
    }).then(() => setUsers(users => users.filter(u => u._id !== userId)));
  };

  const handleAddData = () => {
    const dataToSend: any = {
      deviceId: Number(newData.deviceId),
      temperature: Number(newData.temperature),
      pressure: Number(newData.pressure),
      humidity: Number(newData.humidity),
    };
    if (newData.readingDate) dataToSend.readingDate = newData.readingDate;
    axios.post("http://localhost:3100/api/data/admin-add", dataToSend, {
      headers: { "x-auth-token": token }
    }).then(() => setNewData({ deviceId: '', temperature: '', pressure: '', humidity: '', readingDate: '' }));
  };

  return (
    <Box className="admin-container">
      <Typography variant="h4" gutterBottom>Panel administratora</Typography>
      <Button variant="outlined" color="primary" sx={{ mb: 2 }} onClick={() => navigate('/dashboard')}>
        Cofnij do dashboardu
      </Button>
      <Typography variant="h6" gutterBottom>Użytkownicy</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Nazwa</TableCell>
              <TableCell>Rola</TableCell>
              <TableCell>Aktywny</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user._id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.active ? "tak" : "nie"}</TableCell>
                <TableCell>{user.isAdmin ? "tak" : "nie"}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpenRoleDialog(user)}
                    variant="outlined"
                    color="info"
                  >
                    Zmień rolę
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(user._id)}
                    variant="outlined"
                    sx={{ ml: 1 }}
                  >
                    Usuń
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={roleDialogOpen} onClose={handleCloseRoleDialog}>
        <DialogTitle>Zmień rolę użytkownika</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Typography>
            <b>{selectedUser?.email}</b>
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-label">Rola</InputLabel>
            <Select
              labelId="role-label"
              value={selectedRole}
              label="Rola"
              onChange={e => setSelectedRole(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Anuluj</Button>
          <Button variant="contained" onClick={handleConfirmRoleChange} color="primary">
            Zatwierdź
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h6" gutterBottom>Dodaj dane do urządzenia</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="DeviceId"
          value={newData.deviceId}
          onChange={e => setNewData({ ...newData, deviceId: e.target.value })}
          type="number"
        />
        <TextField
          label="Temp [°C]"
          value={newData.temperature}
          onChange={e => setNewData({ ...newData, temperature: e.target.value })}
          type="number"
        />
        <TextField
          label="Pressure [hPa]"
          value={newData.pressure}
          onChange={e => setNewData({ ...newData, pressure: e.target.value })}
          type="number"
        />
        <TextField
          label="Humidity [%]"
          value={newData.humidity}
          onChange={e => setNewData({ ...newData, humidity: e.target.value })}
          type="number"
        />
        <TextField
          label="Data (opcjonalnie)"
          type="datetime-local"
          value={newData.readingDate}
          onChange={e => setNewData({ ...newData, readingDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" color="primary" onClick={handleAddData}>
          Dodaj dane
        </Button>
      </Box>
    </Box>
  );
};

export default AdminPanel;
