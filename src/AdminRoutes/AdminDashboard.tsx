import { useState } from "react";

import AdminReviews from "./AdminReviews";
import AdminZoneRischio from "./AdminZoneRischio";
import AdminNotes from "./AdminNotes";
import { AdminNavbar } from "../components/AdminNav";
import AdminUsers from "./AdimUsers"; // correggi qui il nome se serve
import { AdminNotifiche } from "./AdminNotifiche";

import type { Section } from "../Service/Type";

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("users");
  const [menuOpen, setMenuOpen] = useState(false); // aggiunto stato menu

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="md:flex min-h-screen">
      <AdminNavbar
        section={section}
        setSection={setSection}
        onLogout={handleLogout}
        onMenuToggle={setMenuOpen} // passo funzione per toggle menu
      />
      <main
        className={`flex-1 p-8 bg-white rounded-tl-3xl rounded-bl-3xl shadow-lg overflow-auto transition-all duration-300
          ${menuOpen ? "ml-64" : "ml-0"} md:ml-48`} // margin-left dinamico
        style={{ minHeight: "100vh" }}
      >
        {section === "users" && <AdminUsers />}
        {section === "reviews" && <AdminReviews />}
        {section === "zones" && <AdminZoneRischio />}
        {section === "notes" && <AdminNotes />}
        {section === "notifiche" && <AdminNotifiche />}
      </main>
    </div>
  );
}
