import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

type FormData = {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  confermaPassword: string;
  role?: string;
  nickname?: string;
  telefono?: string;
  bio?: string;
  immagineProfilo?: string;
};

export const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    cognome: "",
    email: "",
    password: "",
    confermaPassword: "",
    role: "USER",
    nickname: "",
    telefono: "",
    bio: "",
    immagineProfilo: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confermaPassword) {
      setError("Le password non corrispondono");
      return;
    }

    if (formData.password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          cognome: formData.cognome,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          nickname: formData.nickname,
          telefono: formData.telefono,
          bio: formData.bio,
          immagineProfilo: formData.immagineProfilo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Errore durante la registrazione");
      }

      setIsRegistered(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Errore sconosciuto");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: "linear-gradient(90deg, #003f66, #66a7a3)",
      }}
    >
      {!isRegistered ? (
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-lg shadow-lg max-w-md w-full text-white bg-black/30 backdrop-blur-sm animate-fadeIn"
          style={{ animationFillMode: "forwards" }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Registrati</h1>

          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="mb-4 p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
          />

          <input
            type="text"
            name="cognome"
            placeholder="Cognome"
            value={formData.cognome}
            onChange={handleChange}
            required
            className="mb-4 p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mb-4 p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
          />

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              tabIndex={-1}
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? (
                // Occhio chiuso
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.972 9.972 0 012.327-3.544M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              ) : (
                // Occhio aperto
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            {formData.password.length > 0 && formData.password.length < 8 && (
              <label className="text-xs text-white font-semibold mt-1 block">
                La password deve contenere almeno 8 caratteri
              </label>
            )}
          </div>

          <div className="mb-4 relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confermaPassword"
              placeholder="Conferma Password"
              value={formData.confermaPassword}
              onChange={handleChange}
              required
              className="p-3 rounded-md border border-transparent w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
            >
              {showConfirmPassword ? (
                // Occhio chiuso
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.972 9.972 0 012.327-3.544M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              ) : (
                // Occhio aperto
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="text-red-400 mb-4 font-semibold text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-md font-bold text-white transition-colors duration-300"
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
            Registrati
          </button>

          <Link
            to="/login"
            className="mt-6 text-center text-white underline hover:text-[#80cbc4] block"
          >
            Hai già un account? Accedi
          </Link>
        </form>
      ) : (
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full text-white text-center font-semibold text-lg animate-fadeIn">
          Registrazione avvenuta con successo!<br />
          Verrai reindirizzato/a alla pagina di login...
        </div>
      )}
    </div>
  );
};
