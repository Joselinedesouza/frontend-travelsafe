import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./Pages/AuthContext";

import LandingPage from "./Pages/LandingPage";
import Home from "./Pages/Home";

import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { VerifyEmail } from "./Pages/VerifyEmail";
import { ForgotPassword } from "./Pages/ForgotPassword";
import { ResetPassword } from "./Pages/ResetPassword";

import { UserProfile } from "./Pages/UserProfile";
import ZonaRischioMap from "./Pages/ZonaRischioMap";
import Recensioni from "./Pages/Recensioni";
import NewsByCity from "./Pages/NewItem";
import PointsofEmergency from "./Pages/PointsofEmergency";
import InfoPage from "./Pages/InfoPage";
import ChiSiamo from "./Pages/ChiSiamo";
import { GuidaSupporto } from "./Pages/GuidaSupporto";
import { EliminaProfilo } from "./Pages/EliminaProfilo";

import { RegisterTripForm } from "./Pages/RegisterTrip";
import { MyTrips } from "./components/MyTrips";
import { Logout } from "./components/Logout";
import { TopBarHome } from "./components/TopBarHome";

import { ProtectedRoute } from "./Pages/ProtectedRoute";
import { AdminRoute } from "./components/ProtectedRoute";

import AdminDashboard from "./AdminRoutes/AdminDashboard";
import AdminReviews from "./AdminRoutes/AdminReviews";
import AdminZoneRischio from "./AdminRoutes/AdminZoneRischio";
import { AdminNotifiche } from "./AdminRoutes/AdminNotifiche";

import { OAuth2Callback } from "./Pages/OAuth2Callback";

import "./index.css";

function App() {
  const { token, role, logout } = useAuth();

  // Mostra TopBarHome solo se loggato e NON admin
  const showTopBar = !!token && role !== "ADMIN";

  return (
    <>
      {showTopBar && <TopBarHome onLogout={logout} />}

      <Routes>
        {/* Landing o redirect */}
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

        {/* Home protetta */}
        <Route
          path="/home"
          element={token ? <Home /> : <Navigate to="/login" replace />}
        />

        {/* Logout */}
        <Route path="/logout" element={<Logout onLogout={logout} />} />

        {/* OAuth2 callback */}
        <Route path="/login/oauth2/code/google" element={<OAuth2Callback />} />

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/zone-rischio" element={<AdminZoneRischio />} />
          <Route path="/admin/notifiche" element={<AdminNotifiche />} />
        </Route>

        {/* Pubbliche */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chi-siamo" element={<ChiSiamo />} />
        <Route path="/news" element={<NewsByCity />} />
        <Route path="/emergenze" element={<PointsofEmergency />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/guida-supporto" element={<GuidaSupporto />} />

        {/* Altre */}
        <Route path="/zone-rischio" element={<ZonaRischioMap />} />
        <Route path="/register-trip" element={<RegisterTripForm />} />
        <Route path="/my-trips" element={<MyTrips />} />

        {/* Profilo */}
        <Route
          path="/userprofile"
          element={token ? <UserProfile /> : <Navigate to="/login" replace />}
        />

        {/* Protette utenti */}
        <Route element={<ProtectedRoute />}>
          <Route path="/recensioni" element={<Recensioni />} />
          <Route
            path="/elimina-profilo"
            element={<EliminaProfilo />}
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
