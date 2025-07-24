import React, { useState } from "react";
import type { Section } from "../Service/Type";

interface AdminNavbarProps {
  section: Section;
  setSection: React.Dispatch<React.SetStateAction<Section>>;
  onLogout: () => void;
  onMenuToggle?: (isOpen: boolean) => void;
}

export function AdminNavbar({
  section,
  setSection,
  onLogout,
  onMenuToggle,
}: AdminNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((open) => {
      const newOpen = !open;
      onMenuToggle?.(newOpen);
      return newOpen;
    });
  };

  const handleSelect = (sec: Section) => {
    setSection(sec);
    setMenuOpen(false);
    onMenuToggle?.(false);
  };

  const sections: { key: Section; label: string }[] = [
    { key: "dashboard", label: "dashboard" },
    { key: "users", label: "Utenti" },
    { key: "reviews", label: "Recensioni" },
    { key: "zones", label: "Zone di Rischio" },
    { key: "notes", label: "Note" },
    { key: "notifiche", label: "Notifiche" },
  ];

  return (
    <>
      {/* Bottone hamburger sempre visibile */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Toggle menu"
        onClick={toggleMenu}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Drawer menu (visibile se menuOpen) */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setMenuOpen(false);
              onMenuToggle?.(false);
            }}
          />

          {/* Menu laterale */}
          <nav className="fixed top-0 left-0 w-64 bg-gray-800 text-white h-full p-4 z-50 shadow-lg overflow-y-auto">
            <ul>
              {sections.map(({ key, label }) => (
                <li
                  key={key}
                  className={`cursor-pointer p-2 rounded ${section === key ? "bg-gray-600" : ""}`}
                  onClick={() => handleSelect(key)}
                >
                  {label}
                </li>
              ))}
            </ul>
            <button
              className="mt-8 w-full bg-red-600 hover:bg-red-700 p-2 rounded"
              onClick={() => {
                setMenuOpen(false);
                onMenuToggle?.(false);
                onLogout();
              }}
            >
              Logout
            </button>
          </nav>
        </>
      )}
    </>
  );
}
