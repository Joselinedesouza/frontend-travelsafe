import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const BaseUrl=  `${import.meta.env.VITE_API_URL}`

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setMessage("Token mancante nella URL.");
        setSuccess(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${BaseUrl}/api/auth/verify-email?token=${token}`,
          {
            method: "GET",
          }
        );

        const text = await response.text();

        if (response.ok) {
          setSuccess(true);
          setMessage(text || "Email verificata con successo.");
        } else {
          setSuccess(false);
          setMessage(text || "Verifica email non riuscita.");
        }
      } catch (error) {
        setSuccess(false);
        setMessage("Errore di connessione al server.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);


return (
  <div className="container d-flex justify-content-center align-items-center min-vh-100">
    <div className="card shadow p-4 text-center" style={{ maxWidth: "400px", width: "100%" }}>

      {loading ? (
        <>
          <div className="spinner-circle mb-3"></div>
          <h4>Verifica in corso...</h4>
          <p className="text-muted">Attendi qualche secondo</p>
        </>
      ) : success ? (
        <>
          <div className="success-circle mb-3">
            ✓
          </div>

          <h4>Email verificata</h4>
          <p className="text-muted">Reindirizzamento in corso...</p>
        </>
      ) : (
        <>
          <div className="error-circle mb-3">
            ✕
          </div>

          <h4>Verifica fallita</h4>
          <p>{message}</p>
        </>
      )}

    </div>
  </div>
);
};
