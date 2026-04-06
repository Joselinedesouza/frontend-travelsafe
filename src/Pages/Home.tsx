import { FaGlobeEurope, FaPlane } from "react-icons/fa";
import { MapContainer, TileLayer } from "react-leaflet";
import { ActionCard } from "../components/ActionCard";
import { BottomNav } from "../components/BottomNav";
import { useNavigate, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import bgHome from "../assets/sfondohome.jpg";
import { useCallback, useEffect, useState } from "react";
import TextType from "../components/TextType";


const API_URL = import.meta.env.VITE_API_URL as string;

interface UserProfile {
  nome: string;
  email: string;
}

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const gradientBackground = "linear-gradient(90deg, #003f66, #006aab)";
  const gradientBackgroundHover = "linear-gradient(90deg, #00518c, #3399dd)";

  const goToZoneRischio = useCallback(
    () => navigate("/zone-rischio"),
    [navigate]
  );

  const goToRegisterTrip = useCallback(
    () => navigate("/register-trip"),
    [navigate]
  );

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===============================
     OAuth callback: token in URL
     =============================== */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // pulizia dati vecchi
      localStorage.removeItem("role");
      localStorage.removeItem("userEmail");

      // ripulisce URL
      navigate({ pathname: "/home" }, { replace: true });
    }
  }, [location.search, navigate]);

  /* ===============================
     Fetch profilo utente
     =============================== */
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Se non loggata → landing
    if (!token) {
      setUser(null);
      setLoading(false);
      setError(null);
      navigate("/", { replace: true });
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Utente non autenticato");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Errore sconosciuto";

        setError(msg);
        setLoading(false);

        // token scaduto/errato → logout soft
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      });
  }, [navigate]);

  /* ===============================
     UI
     =============================== */

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white font-poppins px-4 overflow-hidden">

      

      {/* Background */}
      <div
        className="absolute top-0 left-0 w-full h-full -z-20"
        style={{
          backgroundImage: `url(${bgHome})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
          transform: "scale(1.05)",
        }}
      />

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 -z-10" />

      {/* Mappa */}
      <div className="absolute top-0 left-0 w-full h-full -z-30">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>

      {/* Contenuto */}
      <main className="flex-1 flex flex-col items-center justify-center pt-[100px] z-10 gap-8 px-4">

        {loading && <p>Caricamento dati utente...</p>}

        {error && (
          <p className="text-red-500 font-semibold">{error}</p>
        )}

        {user && (
          <div className="mb-8 text-center">

            <h2 className="text-2xl font-bold">
              <TextType
                as="span"
                texts={[
                  `Benvenut@, ${user.nome}`,
                  "Pronto a pianificare il tuo prossimo viaggio?",
                  "Controlla zone, aggiornamenti e info.",
                  "Are you ready?",
                  "Let's Gooo!",
                ]}
                typingSpeed={55}
                deletingSpeed={28}
                pauseDuration={1400}
                initialDelay={200}
                loop
                showCursor
                cursorCharacter="_"
                cursorBlinkDuration={0.55}
              />
            </h2>

            <p className="text-lg">{user.email}</p>

          </div>
        )}

        {/* Cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">

          <div className="transition-transform duration-300 hover:scale-[1.04] hover:-translate-y-1">
            <ActionCard
              title="Consulta"
              subtitle="Zone"
              icon={<FaGlobeEurope />}
              onClick={goToZoneRischio}
              backgroundGradient={gradientBackground}
              backgroundGradientHover={gradientBackgroundHover}
              textColor="text-white"
              borderColor="border-blue-500"
            />
          </div>

          <div className="transition-transform duration-300 hover:scale-[1.04] hover:-translate-y-1">
            <ActionCard
              title="Dove mi trovo?"
              subtitle="Registrati per maggior sicurezza"
              icon={<FaPlane />}
              onClick={goToRegisterTrip}
              backgroundGradient={gradientBackground}
              backgroundGradientHover={gradientBackgroundHover}
              textColor="text-white"
              borderColor="border-blue-500"
            />
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
