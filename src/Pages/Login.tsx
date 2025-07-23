import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Pages/AuthContext";

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { role, setToken, setUserEmail, setRole } = useAuth();

  // Redirect immediato se ruolo già presente (utente loggato)
  useEffect(() => {
    if (role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (role) {
      navigate("/home");
    }
  }, [role, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Errore durante il login");
      }

      // Salvo token e dati
      setToken(data.token);
      setUserEmail(data.email);
      setRole(data.role);

      setIsLoading(false);

      // Redirect basato sul ruolo
      if (data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) setError(err.message);
      else setError("Errore sconosciuto");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
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
            className="mb-4 p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mb-4 p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
          />

          {error && (
            <p className="text-red-400 mb-4 font-semibold text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-md font-bold text-white transition-colors duration-300 mb-4"
            style={{ backgroundColor: "#003f66" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#66a7a3")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#003f66")
            }
            onFocus={(e) =>
              (e.currentTarget.style.backgroundColor = "#66a7a3")
            }
            onBlur={(e) =>
              (e.currentTarget.style.backgroundColor = "#003f66")
            }
          >
            Accedi
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-md font-bold text-white transition-colors duration-300"
            style={{ backgroundColor: "#DB4437" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#E57368")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#DB4437")
            }
            onFocus={(e) =>
              (e.currentTarget.style.backgroundColor = "#E57368")
            }
            onBlur={(e) =>
              (e.currentTarget.style.backgroundColor = "#DB4437")
            }
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
