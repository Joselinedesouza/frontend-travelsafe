import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../Service/Api"; // cambia il path se il tuo file api è altrove


 export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setSuccess(false);
        setMessage("Token mancante.");
        setLoading(false);
        return;
      }

      try {
        const resultMessage = await verifyEmail(token);
        setSuccess(true);
        setMessage(resultMessage || "Email verificata con successo.");

        setTimeout(() => {
          navigate("/home");
        }, 2000);
      } catch (error: any) {
        setSuccess(false);
        setMessage(error.message || "Verifica email non riuscita.");
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, [token, navigate]);

 return (
  <div className="verify-page">
    <div className="verify-box">

      {loading && (
        <>
          <div className="verify-spinner"></div>
          <h2 className="verify-title">Verifica in corso...</h2>
          <p className="verify-text">
            Stiamo verificando la tua email
          </p>
        </>
      )}

      {!loading && success && (
        <>
          <div className="verify-success-circle">
            <span className="verify-check">✓</span>
          </div>

          <h2 className="verify-title">
            Email verificata
          </h2>

          <p className="verify-text">
            Accesso consentito
          </p>

          <p className="verify-text">
            Reindirizzamento...
          </p>
        </>
      )}

      {!loading && !success && (
        <>
          <div className="verify-error-circle">
            <span className="verify-cross">✕</span>
          </div>

          <h2 className="verify-title">
            Verifica fallita
          </h2>

          <p className="verify-text">
            {message}
          </p>
        </>
      )}

    </div>
  </div>
);
};