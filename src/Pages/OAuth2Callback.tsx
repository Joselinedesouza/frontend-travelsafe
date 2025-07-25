import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect as useOAuthEffect, useState as useOAuthState } from "react";
import { useNavigate as useOAuthNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Pages/AuthContext";

interface LoginProps {
  onLoginSuccess: (token: string, role: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Errore durante il login");
      }

      const cleanedRole = data.role?.replace("ROLE_", "") || "";

      // ✅ Aggiorna lo stato globale App tramite callback
      onLoginSuccess(data.token, cleanedRole);

      // Salva anche nel localStorage per persistenza
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", cleanedRole);

      setIsLoading(false);

      // ✅ Redirect basato sul ruolo
      if (cleanedRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      console.error("Errore login:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Errore sconosciuto");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: "linear-gradient(90deg, #003f66, #66a7a3)" }}
    >
      {!showForm && (
        <div className="flex flex-col items-center justify-center fs-1 text-white">
          🛫
          <p className="mt-4 font-semibold text-lg">Caricamento...</p>
        </div>
      )}

      {showForm && !isLoading && (
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-lg shadow-lg max-w-md w-full text-white bg-black/30 backdrop-blur-sm animate-fadeIn"
          style={{ animationFillMode: "forwards" }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mb-4 p-3 rounded-md w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mb-4 p-3 rounded-md w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
          />

          {error && (
            <p className="text-red-400 mb-4 font-semibold text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-md font-bold text-white transition-colors duration-300 mb-4"
            style={{ backgroundColor: "#003f66" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
          >
            Accedi
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-md font-bold text-white transition-colors duration-300"
            style={{ backgroundColor: "#DB4437" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E57368")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DB4437")}
          >
            Accedi con Google
          </button>

          <p className="text-center mt-4 text-sm text-white">
            Password dimenticata?{" "}
            <Link to="/forgot-password" className="hover:underline font-semibold">
              Recupera password
            </Link>
          </p>
        </form>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-white">
          <div className="text-6xl select-none">🛫</div>
          <p className="mt-4 font-semibold text-lg">Accesso in corso...</p>
        </div>
      )}
    </div>
  );
};

export function OAuth2Callback() {
  const [error, setError] = useOAuthState<string | null>(null);
  const navigate = useOAuthNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUserEmail, setRole } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL;

  useOAuthEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Errore OAuth2: ${errorParam}`);
      return;
    }

    if (!code) {
      setError("Codice di autorizzazione mancante.");
      return;
    }

    async function fetchToken() {
      try {
        const response = await fetch(
          `${API_BASE}/api/auth/oauth2/code/google?code=${code}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Errore durante l'autenticazione OAuth2");
        }

        setToken(data.token);
        setUserEmail(data.email);
        setRole(data.role);

        navigate("/home");
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Errore sconosciuto durante OAuth2");
      }
    }

    fetchToken();
  }, [searchParams, setToken, setUserEmail, setRole, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white">
      <p>Autenticazione in corso, attendere...</p>
    </div>
  );
}
