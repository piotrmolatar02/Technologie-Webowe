import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Alert, Box } from "@mui/material";

interface Account {
  username: string;
  password: string;
}

interface Errors {
  username?: string;
  password?: string;
  server?: string;
}

interface Props {
  setToken?: (token: string | null) => void; // umożliwia ustawienie tokena w stanie App
}

const LoginForm: React.FC<Props> = ({ setToken }) => {
  const [account, setAccount] = useState<Account>({ username: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const navigate = useNavigate();

  const validate = (): Errors | null => {
    const errors: Errors = {};
    if (account.username.trim() === "") errors.username = "Username is required!";
    if (account.password.trim() === "") errors.password = "Password is required!";
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors || {});
    if (validationErrors) return;

    try {
      const response = await axios.post("http://localhost:3100/api/user/auth", {
        login: account.username,
        password: account.password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      if (setToken) setToken(token); // aktualizuj stan tokena w App
      navigate("/dashboard");
    } catch (err) {
      setErrors({ server: "Invalid username or password!" });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box className="auth-container">
      <Box className="auth-form">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Logowanie
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Nazwa użytkownika"
              name="username"
              value={account.username}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={Boolean(errors.username)}
              helperText={errors.username}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Hasło"
              name="password"
              value={account.password}
              onChange={handleChange}
              type="password"
              fullWidth
              variant="outlined"
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
          </Box>
          {errors.server && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.server}
            </Alert>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
            Zaloguj
          </Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate("/register")}>
            Nie masz konta? Zarejestruj się!
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default LoginForm;