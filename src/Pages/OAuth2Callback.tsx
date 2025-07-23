import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Pages/AuthContext"; // correzione import

export function OAuth2Callback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUserEmail, setRole } = useAuth();

  useEffect(() => {
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
          `http://localhost:8080/api/auth/oauth2/code/google?code=${code}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Errore durante l'autenticazione OAuth2");
        }

        // Non serve salvare localStorage qui, lo fa AuthProvider con useEffect
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
