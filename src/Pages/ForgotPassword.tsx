import React, { useState } from "react";
import { Link } from "react-router-dom";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/request-reset`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Errore durante la richiesta di reset");
      }

      setMessage("Email inviata con successo, controlla tua mail!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Errore sconosciuto");
      }
    }
  };

  // Funzione helper per hover/focus stile bottoni
  function addHoverFocusStyles(
    e: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<HTMLButtonElement>
  ) {
    e.currentTarget.style.backgroundColor =
      e.type === "mouseenter" || e.type === "focus" ? "#66a7a3" : "#003f66";
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(90deg, #003f66, #66a7a3)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-lg shadow-lg max-w-md w-full text-[#e0f2f1] flex flex-col"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Recupera Password</h1>

        <input
          type="email"
          placeholder="Inserisci la tua email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="mb-4 p-3 rounded-md border border-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 font-semibold"
          style={{ backgroundColor: "#003f66", color: "#e0f2f1", borderColor: "#66a7a3" }}
        />

        {message && (
          <p className="text-green-400 mb-4 font-semibold text-center">{message}</p>
        )}
        {error && (
          <p className="text-red-400 mb-4 font-semibold text-center">{error}</p>
        )}

        <button
          type="submit"
          className="transition-colors w-full py-3 rounded-md font-bold text-[#e0f2f1] mb-4"
          style={{ backgroundColor: "#003f66", transition: "background-color 0.3s" }}
          onMouseEnter={addHoverFocusStyles}
          onMouseLeave={addHoverFocusStyles}
          onFocus={addHoverFocusStyles}
          onBlur={addHoverFocusStyles}
        >
          Invia email di reset
        </button>

        <Link
          to="/home"
          className="text-center text-[#80cbc4] hover:underline font-semibold"
        >
          Torna alla Home
        </Link>
      </form>
    </div>
  );
};
