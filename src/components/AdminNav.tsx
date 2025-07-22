import React, { useState } from "react";
import type { Section } from "../Service/Type";

interface AdminNavbarProps {
  section: Section;
  setSection: React.Dispatch<React.SetStateAction<Section>>;
  onLogout: () => void;
  onMenuToggle?: (isOpen: boolean) => void; // Nuova prop per comunicare apertura menu
}

export function AdminNavbar({
  section,
  setSection,
  onLogout,
  onMenuToggle,
}: AdminNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Funzione toggle menu e callback per genitore
  const toggleMenu = () => {
    setMenuOpen((open) => {
      const newOpen = !open;
      if (onMenuToggle) onMenuToggle(newOpen);
      return newOpen;
    });
  };

  // Cambia sezione e chiudi menu su mobile, notifica genitore
  const handleSelect = (sec: Section) => {
    setSection(sec);
    setMenuOpen(false);
    if (onMenuToggle) onMenuToggle(false);
  };

  return (
    <>
      {/* Bottone hamburger visibile solo su mobile */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Toggle menu"
        onClick={toggleMenu}
      >
        {/* Icona hamburger semplice */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {menuOpen ? (
            // Icona X (close)
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            // Icona hamburger
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Navbar desktop */}
      <nav className="hidden sm:block w-48 bg-gray-800 text-white min-h-screen p-4 fixed top-0 left-0 z-40">
        <ul>
          {["users", "reviews", "zones", "notes", "notifiche"].map((sec) => (
            <li
              key={sec}
              className={`cursor-pointer p-2 rounded ${
                section === sec ? "bg-gray-600" : ""
              }`}
              onClick={() => setSection(sec as Section)}
            >
              {sec.charAt(0).toUpperCase() + sec.slice(1)}
            </li>
          ))}
        </ul>
        <button
          className="mt-8 w-full bg-red-600 hover:bg-red-700 p-2 rounded"
          onClick={onLogout}
        >
          Logout
        </button>
      </nav>

      {/* Navbar mobile drawer */}
      {menuOpen && (
        <>
          {/* Overlay scuro semi-trasparente */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setMenuOpen(false);
              if (onMenuToggle) onMenuToggle(false);
            }}
          />

          {/* Menu a comparsa */}
          <nav className="fixed top-0 left-0 w-64 bg-gray-800 text-white h-full p-4 z-50 shadow-lg overflow-y-auto">
            <ul>
              {["users", "reviews", "zones", "notes", "notifiche"].map((sec) => (
                <li
                  key={sec}
                  className={`cursor-pointer p-2 rounded ${
                    section === sec ? "bg-gray-600" : ""
                  }`}
                  onClick={() => handleSelect(sec as Section)}
                >
                  {sec.charAt(0).toUpperCase() + sec.slice(1)}
                </li>
              ))}
            </ul>
            <button
              className="mt-8 w-full bg-red-600 hover:bg-red-700 p-2 rounded"
              onClick={() => {
                setMenuOpen(false);
                if (onMenuToggle) onMenuToggle(false);
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
