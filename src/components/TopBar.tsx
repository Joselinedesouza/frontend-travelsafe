import { useEffect, useState } from "react";
import { FaUser, FaShieldAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import GradientTitle from "./GradientTitle";

export const TopBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* TOP BAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "border-white/30" : "border-white/10"
        }`}
        style={{
          background: scrolled
            ? `linear-gradient(
                to right, 
                rgba(0, 0, 0, 0.9) 0%, 
                rgb(93, 174, 220) 10%, 
                rgba(122, 205, 253, 0.3) 50%, 
                rgb(52, 124, 165) 90%, 
                rgba(0, 0, 0, 0.9) 100%)`
            : `linear-gradient(
                to right, 
                rgba(0, 0, 0, 0.9) 0%, 
                #003f66 10%, 
                rgba(0, 63, 102, 0.1) 50%, 
                #003f66 90%, 
                rgba(0, 0, 0, 0.9) 100%)`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex justify-between items-center px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <FaShieldAlt size={20} />
            <GradientTitle />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-white focus:outline-none"
              aria-label="Apri menu profilo"
            >
              <FaUser size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* MENU PROFILO */}
      {isMenuOpen && (
        <div className="fixed top-[60px] right-4 w-96 h-[calc(100vh-70px)] bg-black/90 text-white rounded-xl shadow-2xl z-50 flex flex-col justify-between backdrop-blur-md overflow-hidden">
          <div className="p-4 space-y-2">
            <Link
              to="/login"
              className="block px-4 py-2 rounded hover:bg-white/10 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block px-4 py-2 rounded hover:bg-white/10 transition p-4 border-t border-white/20 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Registrati
            </Link>
          </div>

          <div className="p-4 border-t border-white/20 text-sm">
            <Link
              to="/chi-siamo"
              className="block mb-2 text-blue-300 hover:underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Chi siamo
            </Link>
            <div className="text-gray-300">
              <p className="font-semibold mb-1">I nostri contatti:</p>
              <p>Email: support@travelsafe.it</p>
              <p>Tel: +39 0123 456789</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
