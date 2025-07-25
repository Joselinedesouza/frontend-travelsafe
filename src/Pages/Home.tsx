import { FaGlobeEurope, FaPlane } from "react-icons/fa";
import { MapContainer, TileLayer } from "react-leaflet";
import { ActionCard } from "../components/ActionCard";
import { BottomNav } from "../components/BottomNav";
import { TopBarHome } from "../components/TopBarHome";
import { useNavigate, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import bgHome from "../assets/sfondohome.jpg";
import { useCallback, useEffect, useState } from "react";

interface UserProfile {
  nome: string;
  email: string;
}

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const gradientBackground = "linear-gradient(90deg, #003f66, #006aab)";
  const gradientBackgroundHover = "linear-gradient(90deg, #00518c, #3399dd)";

  const goToZoneRischio = useCallback(() => navigate("/zone-rischio"), [navigate]);
  const goToRegisterTrip = useCallback(() => navigate("/register-trip"), [navigate]);

  // Stato per dati utente autenticato
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leggi token da query string e salvalo localStorage, poi ripulisci url
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Rimuove i parametri dalla URL senza ricaricare la pagina
      navigate("/home", { replace: true });
    }
  }, [location.search, navigate]);

  // Al caricamento della pagina prova a recuperare dati utente protetti
  useEffect(() => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
      credentials: "include", // importante se backend usa cookie HttpOnly
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Utente non autenticato");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white font-poppins px-4 overflow-hidden">
      {/* Sfondo sfocato */}
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
      {/* Overlay scuro */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 -z-10" />

      {/* TopBar con profilo */}
      <TopBarHome />

      {/* Mappa Leaflet */}
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
          aria-label="Mappa mondo"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>

      {/* Contenuto principale: dati utente + card */}
      <main className="flex-1 flex flex-col items-center justify-center pt-[100px] z-10 gap-8 px-4">
        {loading && <p>Caricamento dati utente...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {user && (
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">Benvenuto, {user.nome}</h2>
            <p className="text-lg">{user.email}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <ActionCard
            title="Consulta"
            subtitle="Zone"
            icon={<FaGlobeEurope aria-label="Icona mappamondo" />}
            onClick={goToZoneRischio}
            backgroundGradient={gradientBackground}
            backgroundGradientHover={gradientBackgroundHover}
            textColor="text-white"
            borderColor="border-blue-500"
          />
          <ActionCard
            title="Dove mi trovo?"
            subtitle="Registrati per maggior sicurezza"
            icon={<FaPlane aria-label="Icona aereo" />}
            onClick={goToRegisterTrip}
            backgroundGradient={gradientBackground}
            backgroundGradientHover={gradientBackgroundHover}
            textColor="text-white"
            borderColor="border-blue-500"
          />
        </div>
      </main>

      {/* Navigazione inferiore */}
      <BottomNav />
    </div>
  );
};

export default Home;
