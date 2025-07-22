import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    setToken(t);
  }, [location.search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }
    if (!token) {
      setError("Token mancante o non valido");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Errore durante il reset password");
      }

      setMessage("Password aggiornata con successo!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Errore sconosciuto");
      }
    }
  }

  const handleBgChange = (e: React.SyntheticEvent<HTMLElement>, hover: boolean) => {
    const target = e.currentTarget;
    target.style.background = hover
      ? "linear-gradient(90deg, #66a7a3, #003f66)"
      : "linear-gradient(90deg, #003f66, #66a7a3)";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(90deg, #003f66, #66a7a3)",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full p-6 border rounded shadow"
        style={{ background: "linear-gradient(90deg, #003f66, #66a7a3)" }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Reset Password</h1>

        <input
          type="password"
          placeholder="Nuova password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 p-2 border rounded w-full text-white"
          style={{
            background: "linear-gradient(90deg, #003f66, #66a7a3)",
            borderColor: "white",
            transition: "background 0.3s",
          }}
          onFocus={(e) => handleBgChange(e, true)}
          onBlur={(e) => handleBgChange(e, false)}
        />

        <input
          type="password"
          placeholder="Conferma nuova password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mb-4 p-2 border rounded w-full text-white"
          style={{
            background: "linear-gradient(90deg, #003f66, #66a7a3)",
            borderColor: "white",
            transition: "background 0.3s",
          }}
          onFocus={(e) => handleBgChange(e, true)}
          onBlur={(e) => handleBgChange(e, false)}
        />

        {message && <p className="text-green-400 mb-4 text-center font-semibold">{message}</p>}
        {error && <p className="text-red-400 mb-4 text-center font-semibold">{error}</p>}

        <button
          type="submit"
          className="py-2 px-4 rounded w-full font-semibold text-white"
          style={{
            background: "linear-gradient(90deg, #003f66, #66a7a3)",
            transition: "background 0.3s",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => handleBgChange(e, true)}
          onMouseLeave={(e) => handleBgChange(e, false)}
          onFocus={(e) => handleBgChange(e, true)}
          onBlur={(e) => handleBgChange(e, false)}
        >
          Cambia password
        </button>
      </form>
    </div>
  );
};
