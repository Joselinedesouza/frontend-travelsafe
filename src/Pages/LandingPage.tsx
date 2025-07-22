import { FaShieldAlt } from "react-icons/fa";
import { TopBar } from "../components/TopBar";
import { Footer } from "../components/Footer";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/imgsfondo.jpg";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center text-white font-poppins px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      <TopBar />

      <main className="flex-grow flex items-center justify-center px-4 py-12 w-full">
        <div className="bg-white/70 text-black rounded-lg shadow-xl max-w-xl w-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <FaShieldAlt size={28} className="text-[#004d40]" />
            <h1 className="text-2xl sm:text-3xl font-bold">Benvenuto in TravelSafe</h1>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            La tua guida definitiva per viaggiare sicuri e sereni in ogni angolo del mondo.
          </p>
          <p className="mb-6 text-sm sm:text-base">
            Consulta le zone a rischio, registra i tuoi spostamenti per una maggiore sicurezza e ricevi notifiche in tempo reale per viaggiare con consapevolezza.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/register")}
              className="flex-1 py-3 rounded font-semibold text-white transition-colors duration-300"
              style={{
                background: "linear-gradient(90deg, #003f66, #006aab)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #00518c, #3399dd)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #003f66, #006aab)")
              }
              onFocus={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #00518c, #3399dd)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #003f66, #006aab)")
              }
            >
              Registrati ora
            </button>

            <button
              onClick={() => navigate("/login")}
              className="flex-1 py-3 rounded font-semibold text-white transition-colors duration-300"
              style={{
                background: "linear-gradient(90deg, #003f66, #006aab)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #00518c, #3399dd)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #003f66, #006aab)")
              }
              onFocus={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #00518c, #3399dd)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #003f66, #006aab)")
              }
            >
              Login
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
