import { useEffect, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileDrawer } from "../Pages/ProfileDrawer";

type TopBarHomeProps = {
  onLogout?: () => void;
};

export const TopBarHome = ({ onLogout }: TopBarHomeProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [initials, setInitials] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Mostra solo su /home
  const isHomePage = location.pathname === "/home";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function updateProfile() {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setProfileImage(null);
        setInitials(null);
        return;
      }
      const img = localStorage.getItem(`profileImage_${userEmail}`) || null;
      const nome = localStorage.getItem(`nome_${userEmail}`) || "";
      const cognome = localStorage.getItem(`cognome_${userEmail}`) || "";

      setProfileImage(img);

      if ((!img || img === "") && nome && cognome) {
        const initialNome = nome.charAt(0).toUpperCase();
        const initialCognome = cognome.charAt(0).toUpperCase();
        setInitials(initialNome + initialCognome);
      } else {
        setInitials(null);
      }
    }

    updateProfile();

    window.addEventListener("profileUpdated", updateProfile);
    return () => window.removeEventListener("profileUpdated", updateProfile);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userEmail");
      setIsMenuOpen(false);
      navigate("/logout");
    }
  };

  if (!isHomePage) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "border-white/30" : "border-white/10"
        }`}
        style={{
          background: scrolled
            ? `linear-gradient(
                to right,
                #003f66 0%,
                rgba(102, 167, 163, 0.3) 50%,
                #003f66 100%
              )`
            : `linear-gradient(
                to right,
                #003f66 0%,
                rgba(102, 167, 163, 0.1) 50%,
                #003f66 100%
              )`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex justify-between items-center px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <FaShieldAlt size={20} />
            <h1 className="text-lg sm:text-xl font-bold select-none">TravelSafe</h1>
          </div>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="focus:outline-none hover:text-[#66a7a3] transition-colors"
            aria-label="Apri menu profilo"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Immagine Profilo"
                className="rounded-full"
                style={{ width: 32, height: 32, objectFit: "cover" }}
              />
            ) : initials ? (
              <div
                className="rounded-full bg-[#66a7a3] flex items-center justify-center font-bold text-white"
                style={{ width: 32, height: 32, userSelect: "none" }}
                aria-label={`Iniziali utente ${initials}`}
              >
                {initials}
              </div>
            ) : (
              <div
                style={{ width: 32, height: 32 }}
                className="text-white flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A8 8 0 1112 20a8 8 0 01-6.879-2.196z"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-[60px] right-0 w-72 h-[calc(100vh-60px)] bg-gradient-to-br from-petrolio to-azzurrochiaro/95 text-white rounded-l-xl shadow-2xl z-50 flex flex-col justify-between backdrop-blur-md overflow-hidden"
          >
            <ProfileDrawer onClose={() => setIsMenuOpen(false)} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
