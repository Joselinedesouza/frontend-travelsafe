import { FaInstagram, FaFacebook, FaShieldAlt } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer
      className="w-full shadow-lg border-t text-white px-6 py-8 mt-auto"
      style={{
        background: "linear-gradient(to right, #003f66, rgba(0,0,0,0.7) 50%, #003f66)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(255, 255, 255, 0.3)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 md:flex-row md:justify-center">
        {/* Social */}
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com/desouzajoseline15_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-[#E1306C] transition"
          >
            <FaInstagram size={24} color="#E1306C" />
            Instagram
          </a>
          <a
            href="https://facebook.com/dsjoseline"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-[#1877F2] transition"
          >
            <FaFacebook size={24} color="#1877F2" />
            Facebook
          </a>
        </div>

        {/* Copyright and shield */}
        <div className="flex items-center gap-3 text-gray-400 select-none">
          <FaShieldAlt size={20} />
          <span>TravelSafe © 2025. - Created By Joseline De Souza.</span>
        </div>
      </div>
    </footer>
  );
};
