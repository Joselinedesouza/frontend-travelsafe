import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import type { Section } from "../Service/Type";
import { AdminNavbar } from "../components/AdminNav";
import AdminProfileHeader from "./AdminHeaders";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdimUsers";
import AdminReviews from "./AdminReviews";
import AdminZoneRischio from "./AdminZoneRischio";
import AdminNotes from "./AdminNotes";
import { AdminNotifiche } from "./AdminNotifiche";

export default function AdminPage() {
  const [section, setSection] = useState<Section>("dashboard");
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "ADMIN") {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      navigate("/login"); // oppure una pagina 403
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  if (authorized === null) {
    return <div className="text-center p-10">Verifica autorizzazione...</div>;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen font-sans">
      {/* Sidebar */}
      <AdminNavbar section={section} setSection={setSection} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 p-6 sm:ml-48 bg-gray-100 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {section === "dashboard" && (
            <>
              <AdminProfileHeader />
              <AdminStats />
            </>
          )}
          {section === "users" && <AdminUsers />}
          {section === "reviews" && <AdminReviews />}
          {section === "zones" && <AdminZoneRischio />}
          {section === "notes" && <AdminNotes />}
          {section === "notifiche" && <AdminNotifiche />}
        </div>
      </div>
    </div>
  );
}
