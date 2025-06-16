import React, { useState } from "react";
import { Modal, Box, Button, Typography, TextField } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onDelete: (from: string, to: string) => void;
}

const DeleteReadingsModal: React.FC<Props> = ({ open, onClose, onDelete }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleDelete = () => {
  if (!from || !to) {
    alert("Wybierz zakres dat!");
    return;
  }
  onDelete(from, to);
};


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        background: "#181818",
        color: "#fff",
        borderRadius: 2,
        p: 4,
        mx: "auto",
        my: "10vh",
        width: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography variant="h6">Usuń odczyty z zakresu dat</Typography>
        <TextField
          label="Od (data i godzina)"
          type="datetime-local"
          value={from}
          onChange={e => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Do (data i godzina)"
          type="datetime-local"
          value={to}
          onChange={e => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Usuń
          </Button>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Anuluj
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteReadingsModal;
