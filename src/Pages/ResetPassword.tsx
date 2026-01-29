import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = useMemo(() => params.get("token"), [params]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBgChange = (
    e:
      | React.SyntheticEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
      | React.FocusEvent<HTMLButtonElement>,
    hover: boolean
  ) => {
    const target = e.currentTarget as HTMLElement;
    target.style.background = hover
      ? "linear-gradient(90deg, #66a7a3, #003f66)"
      : "linear-gradient(90deg, #003f66, #66a7a3)";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Token mancante o non valido. Apri il link ricevuto via email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      // il backend può rispondere con String o JSON: leggo come testo sempre
      const text = await response.text();

      if (!response.ok) {
        // se per caso arriva JSON come stringa, lo mostriamo comunque
        throw new Error(text || `Errore durante il reset (${response.status})`);
      }

      setMessage(text || "Password aggiornata con successo!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Errore sconosciuto");
    } finally {
      setIsLoading(false);
    }
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
        style={{ background: "rgba(0,0,0,0.25)", borderColor: "rgba(255,255,255,0.25)" }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Reset Password
        </h1>

        {!token && (
          <p className="text-red-300 mb-4 text-center font-semibold">
            Token mancante. Apri la pagina dal link ricevuto via email.
          </p>
        )}

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

        {message && (
          <p className="text-green-300 mb-4 text-center font-semibold">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-300 mb-4 text-center font-semibold">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !token}
          className="py-2 px-4 rounded w-full font-semibold text-white"
          style={{
            background: "linear-gradient(90deg, #003f66, #66a7a3)",
            transition: "background 0.3s",
            border: "none",
            cursor: isLoading || !token ? "not-allowed" : "pointer",
            opacity: isLoading || !token ? 0.7 : 1,
          }}
          onMouseEnter={(e) => handleBgChange(e, true)}
          onMouseLeave={(e) => handleBgChange(e, false)}
          onFocus={(e) => handleBgChange(e, true)}
          onBlur={(e) => handleBgChange(e, false)}
        >
          {isLoading ? "Aggiornamento..." : "Cambia password"}
        </button>
      </form>
    </div>
  );
};
