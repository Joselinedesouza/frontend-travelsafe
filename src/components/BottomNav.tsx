import { FaBell, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useRealTimePosition } from "../components/RealTimeLocation";

export const BottomNav = () => {
  const { position } = useRealTimePosition();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-md shadow-md py-4 flex justify-around text-white z-40"
      style={{
        background: `linear-gradient(
          to right,
          #003f66 0%,
          rgba(102, 167, 163, 0.3) 50%,
          #003f66 100%
        )`,
        backdropFilter: "blur(12px)",
      }}
    >
      <Link
        to="/info"
        className="flex flex-col items-center hover:text-white/80 transition"
      >
        <FaMapMarkerAlt size={30} />
        <span className="text-xs">Info</span>
      </Link>

      <Link
        to="/emergenze"
        className={`flex flex-col items-center hover:text-white/80 transition ${
          !position ? "opacity-50 pointer-events-none" : ""
        }`}
        aria-label="Vai alla pagina emergenze"
        title={!position ? "Attendi il caricamento della posizione" : undefined}
      >
        <FaPhone size={30} />
        <span className="text-xs">Emergenze</span>
      </Link>

      <Link
        to="/news"
        className="flex flex-col items-center justify-center cursor-pointer hover:text-white/80 transition"
        aria-label="Vai alla pagina aggiornamenti"
      >
        <FaBell size={30} />
        <span className="text-xs">Aggiornamenti</span>
      </Link>
    </nav>
  );
};
