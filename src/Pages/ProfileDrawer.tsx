import {
  FaSignOutAlt,
  FaTimes,
  FaRegCommentDots,
  FaBell,
  FaCreditCard,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

type ProfileDrawerProps = {
  onClose: () => void;
  onLogout: () => void;
};

export const ProfileDrawer = ({ onClose, onLogout }: ProfileDrawerProps) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Pulsante chiusura */}
      <div className="flex justify-end p-3">
        <button onClick={onClose} className="text-white">
          <FaTimes size={18} />
        </button>
      </div>

      {/* Menu */}
      <ul className="px-4 space-y-4 text-white flex-1">
        <li className="flex items-center gap-3 hover:text-blue-300">
          <FaRegCommentDots />
          <Link to="/recensioni" onClick={onClose}>Le mie recensioni</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-blue-300">
          <FaBell />
          <Link to="/notifiche" onClick={onClose}>Notifiche e offerte</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-blue-300">
          <FaCreditCard />
          <Link to="/pagamenti" onClick={onClose}>Pagamenti</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-blue-300">
          <FaMapMarkedAlt />
          <Link to="/my-trips" onClick={onClose}>I miei viaggi</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-blue-300">
          <FaShieldAlt />
          <Link to="/sicurezza" onClick={onClose}>Sicurezza</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-blue-300">
          <FaCog />
          <Link to="/userprofile" onClick={onClose}>Impostazioni</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-blue-300">
          <FaQuestionCircle />
          <Link to="/guida-supporto" onClick={onClose}>Guida e supporto</Link>
        </li>
      </ul>

      {/* Logout */}
      <button
  onClick={() => {
    onLogout();
    onClose();
  }}
  className="mt-6 px-4 py-2 flex items-center gap-2 text-red-400 hover:text-red-200 border-t border-white/20"
>
  <FaSignOutAlt />
  Logout
</button>

      {/* Footer contatti */}
      <div className="p-4 border-t border-white/20 text-sm text-gray-300">
        <Link
          to="/chi-siamo"
          className="block mb-2 text-blue-300 hover:underline"
          onClick={onClose}
        >
          Chi siamo
        </Link>
        <p className="font-semibold mb-1">Contatti:</p>
        <p>Email: support@travelsafe.it</p>
        <p>Tel: +39 371 3594430</p>
      </div>
    </div>
  );
};
