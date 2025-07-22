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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role")); // puoi usarlo per logiche future

  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    setToken(null);
    setRole(null);
  };

  // Mostra TopBarHome SOLO se token esiste E ruolo NON è ADMIN (puoi adattare)
  const showTopBar = token && role !== "ADMIN";

  return (
    <>
      {showTopBar && <TopBarHome onLogout={handleLogout} />}

      <Routes>
        {/* Homepage: se loggato -> /home, altrimenti landing */}
        <Route path="/" element={token ? <Navigate to="/home" /> : <LandingPage />} />

        {/* Home: solo accessibile con token */}
        <Route path="/home" element={token ? <Home /> : <Navigate to="/" />} />

        {/* Logout */}
        <Route path="/logout" element={<Logout onLogout={handleLogout} />} />

        {/* Rotte admin protette */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/zone-rischio" element={<AdminZoneRischio />} />
          <Route path="/admin/notifiche" element={<AdminNotifiche />} />
        </Route>

        {/* Zona Rischio mappa pubblica */}
        <Route path="/zone-rischio" element={<ZonaRischioMap />} />

        {/* Viaggi */}
        <Route path="/register-trip" element={<RegisterTripForm />} />
        <Route path="/my-trips" element={<MyTrips />} />

        {/* Autenticazione - Login SENZA onLogin */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
<Route path="/login/oauth2/code/google" element={<OAuth2Callback />} />

        {/* Profilo utente */}
        <Route path="/userprofile" element={token ? <UserProfile /> : <Navigate to="/" />} />

        {/* Rotte protette per utenti loggati */}
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

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
