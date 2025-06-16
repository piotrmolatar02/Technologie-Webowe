import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Alert, Box } from '@mui/material';

interface Account {
   username: string;
   email: string;
   password: string;
}

interface Errors {
   username?: string;
   email?: string;
   password?: string;
}

const SignUpForm: React.FC = () => {
   const [account, setAccount] = useState<Account>({
       username: '',
       email: '',
       password: ''
   });
   const [errors, setErrors] = useState<Errors>({});

   const navigate = useNavigate();

   

   const validate = (): Errors | null => {
       const validationErrors: Errors = {};

       if (account.username.trim() === '') {
           validationErrors.username = 'Username is required!';
       }
       if (account.email.trim() === '') {
           validationErrors.email = 'Email is required!';
       }
       if (account.password.trim() === '') {
           validationErrors.password = 'Password is required!';
       }

       return Object.keys(validationErrors).length === 0 ? null : validationErrors;
   };

   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
       event.preventDefault();

       const validationErrors = validate();
       setErrors(validationErrors || {});
       if (validationErrors) return;

       axios
           .post('http://localhost:3100/api/user/create', {
                login: account.username,
                name: account.username,
                email: account.email,
                password: account.password
           })
           .then((_response: any) => {
               navigate('/login');
           })
           .catch((error: any) => {
        if (error.response?.status === 409) {
            setErrors({ password: "User already exists!" });
        } else {
            setErrors({ password: "Registration error!" });
        }
        console.log(error);
    });
   };

   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
       const { name, value } = event.target;
       setAccount((prevAccount) => ({
           ...prevAccount,
           [name]: value
       }));
   };

   return (
    <Box className="auth-container">
      <Box className="auth-form">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Rejestracja
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Nazwa użytkownika"
              value={account.username}
              name="username"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={Boolean(errors.username)}
              helperText={errors.username}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Email"
              value={account.email}
              name="email"
              onChange={handleChange}
              type="email"
              fullWidth
              variant="outlined"
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Hasło"
              value={account.password}
              name="password"
              onChange={handleChange}
              type="password"
              fullWidth
              variant="outlined"
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
            Register
          </Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate("/login")}>
            Masz już konto?
          </Button>
          {Object.values(errors).some((error) => error) && (
            <Box mt={2}>
              {Object.values(errors).map((error, index) =>
                error ? (
                  <Alert severity="error" key={index}>
                    {error}
                  </Alert>
                ) : null
              )}
            </Box>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default SignUpForm;
