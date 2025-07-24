import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Login } from "./Pages/Login";
import { ForgotPassword } from "./Pages/ForgotPassword";
import { Register } from "./Pages/Register";
import { ResetPassword } from "./Pages/ResetPassword";
import { UserProfile } from "./Pages/UserProfile";
import LandingPage from "./Pages/LandingPage";
import Home from "./Pages/Home";
import ChiSiamo from "./Pages/ChiSiamo";
import ZonaRischioMap from "./Pages/ZonaRischioMap";
import Recensioni from "./Pages/Recensioni";
import { ProtectedRoute } from "./Pages/ProtectedRoute";
import NewsByCity from "./Pages/NewItem";
import { RegisterTripForm } from "./Pages/RegisterTrip";
import { MyTrips } from "./components/MyTrips";
import { Logout } from "./components/Logout";
import { TopBarHome } from "./components/TopBarHome";

import "./index.css";
import PointsofEmergency from "./Pages/PointsofEmergency";
import InfoPage from './Pages/InfoPage';

import { AdminRoute } from "./components/ProtectedRoute";

import AdminDashboard from "./AdminRoutes/AdminDashboard";
import AdminReviews from "./AdminRoutes/AdminReviews";
import AdminZoneRischio from "./AdminRoutes/AdminZoneRischio";
import { GuidaSupporto } from "./Pages/GuidaSupporto";
import { EliminaProfilo } from "./Pages/EliminaProfilo";
import { AdminNotifiche } from "./AdminRoutes/AdminNotifiche";
import { OAuth2Callback } from "./Pages/OAuth2Callback";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Leggi token e ruolo da localStorage all'avvio
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    setToken(t);
    setRole(r);
    setLoadingAuth(false);
  }, []);

  // Funzione per logout: pulisce tutto
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    setToken(null);
    setRole(null);
  };

  // Funzione da passare a Login per aggiornare token e role dopo login
  const handleLoginSuccess = (newToken: string, newRole: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    setToken(newToken);
    setRole(newRole);
  };

  // Mostra TopBarHome solo se c'è token e ruolo diverso da ADMIN
  const showTopBar = token !== null && role !== "ADMIN";

  if (loadingAuth) {
    // Mostra loader finché leggi token/ruolo
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-bold text-gray-700">
        Caricamento...
      </div>
    );
  }

  return (
    <>
      {showTopBar && <TopBarHome onLogout={handleLogout} />}

      <Routes>
        {/* Landing o redirect a dashboard/admin o home utente */}
        <Route
          path="/"
          element={
            token ? (
              role === "ADMIN" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Home: protetta da login */}
        <Route
          path="/home"
          element={token ? <Home /> : <Navigate to="/" replace />}
        />

        {/* Logout */}
        <Route path="/logout" element={<Logout onLogout={handleLogout} />} />

        {/* OAuth2 callback */}
        <Route path="/login/oauth2/code/google" element={<OAuth2Callback />} />

        {/* Rotte protette admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/zone-rischio" element={<AdminZoneRischio />} />
          <Route path="/admin/notifiche" element={<AdminNotifiche />} />
        </Route>

        {/* Rotte pubbliche o protette */}
        <Route path="/zone-rischio" element={<ZonaRischioMap />} />
        <Route path="/register-trip" element={<RegisterTripForm />} />
        <Route path="/my-trips" element={<MyTrips />} />

        {/* Autenticazione */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Profilo utente */}
        <Route
          path="/userprofile"
          element={token ? <UserProfile /> : <Navigate to="/" replace />}
        />

        {/* Rotte protette utenti loggati */}
        <Route element={<ProtectedRoute />}>
          <Route path="/recensioni" element={<Recensioni />} />
        </Route>

        {/* Informazioni */}
        <Route path="/chi-siamo" element={<ChiSiamo />} />
        <Route path="/news" element={<NewsByCity />} />
        <Route path="/emergenze" element={<PointsofEmergency />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/guida-supporto" element={<GuidaSupporto />} />
        <Route path="/elimina-profilo" element={<EliminaProfilo />} />

        {/* Catch all - redirect a landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
