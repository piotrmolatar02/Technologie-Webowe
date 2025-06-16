import "./App.css";
import { isExpired } from "react-jwt";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginForm from "./components/Login";
import Dashboard from "./Dashboard";
import SignUpForm from "./components/SignUpForm"; 
import { useState, useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import { jwtDecode } from "jwt-decode";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Uaktualniaj token przy każdej zmianie w localStorage (np. po logowaniu/wylogowaniu)
  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Dodatkowa synchronizacja (na wszelki wypadek)
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm setToken={setToken} />} />
        <Route path="/login" element={<LoginForm setToken={setToken} />} />
        <Route path="/register" element={<SignUpForm />} />
        <Route
          path="/dashboard"
          element={
            !token || isExpired(token) ? (
              <Navigate replace to="/login" />
            ) : (
              <Dashboard />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
        <Route
  path="/admin"
  element={
    token && !isExpired(token) && isAdmin(token) ? (
      <AdminPanel />
    ) : (
      <Navigate replace to="/dashboard" />
    )
  }
/>
      </Routes>
    </BrowserRouter>
  );
}


function isAdmin(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.role === "admin" || decoded.isAdmin === true;
  } catch {
    return false;
  }
}


export default App;