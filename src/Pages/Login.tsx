import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Pages/AuthContext";

const API_URL = import.meta.env.VITE_API_URL as string;
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

type LoginPayload = {
  token: string;
  email: string;
  role: string;
  nome?: string;
  cognome?: string;
  immagineProfilo?: string;
  nickname?: string;
  bio?: string;
};

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // prendo ANCHE i setter dal context
  const { role, token, setToken, setUserEmail, setRole } = useAuth();

  // redirect automatico solo se c'è token (evita loop)
  useEffect(() => {
    if (!token) return;
    if (role === "ADMIN") navigate("/admin/dashboard", { replace: true });
    else if (role) navigate("/home", { replace: true });
  }, [token, role, navigate]);

  // animazione form
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // messaggio da logout automatico (apiFetch)
  useEffect(() => {
    const msg = sessionStorage.getItem("auth_error");
    if (msg) {
      setError(msg);
      sessionStorage.removeItem("auth_error");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!API_URL) {
      setError("Configurazione mancante: VITE_API_URL non è impostata.");
      return;
    }

    const payloadToSend = {
      email: formData.email.trim(),
      password: formData.password,
    };

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
      });

      const raw = await response.text();
      const parsed = raw ? safeJsonParse(raw) : null;

      if (!response.ok) {
        const msg =
          (parsed && (parsed.message || parsed.error)) ||
          raw ||
          `Errore durante il login (${response.status})`;
        throw new Error(msg);
      }

      const data = (parsed ?? null) as LoginPayload | null;

      if (!data?.token || !data?.email || !data?.role) {
        throw new Error("Risposta login non valida (mancano token/email/role).");
      }

      // set nel context (salva anche in localStorage tramite useEffect del context)
      setToken(data.token);
      setUserEmail(data.email);
      setRole(data.role);

      // redirect
      if (data.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else navigate("/home", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Errore sconosciuto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!API_URL) {
      setError("Configurazione mancante: VITE_API_URL non è impostata.");
      return;
    }
    window.location.href = `${API_URL}/oauth2/authorization/google`;
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

      {showForm && (
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
            className="mb-4 p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
            disabled={isLoading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mb-4 p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
            disabled={isLoading}
          />

          {error && (
            <p className="text-red-400 mb-4 font-semibold text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-md font-bold text-white transition-colors duration-300 mb-4"
            style={{
              backgroundColor: "#003f66",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
          >
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-md font-bold text-white transition-colors duration-300"
            style={{
              backgroundColor: "#DB4437",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E57368")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DB4437")}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#E57368")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "#DB4437")}
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
    </div>
  );
};

// helper: parse JSON senza crash
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
