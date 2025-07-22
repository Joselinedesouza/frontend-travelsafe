import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useRealTimePosition } from "../components/RealTimeLocation";
import { useNavigate, Link } from "react-router-dom";

const iconQuestura = new L.Icon({
  iconUrl: "/policeman.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

function FlyToUserPosition({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 13, { duration: 2 });
    }
  }, [position, map]);
  return null;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string; opening_hours?: string };
}

type Commissariato = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  aperturaH24: boolean;
};

export default function InfoPage() {
  const navigate = useNavigate();

  // Check autenticazione (token salvato in localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // redirect alla landing page se non loggato
    }
  }, [navigate]);

  const { position: userPosition } = useRealTimePosition();
  const [commissariati, setCommissariati] = useState<Commissariato[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [errorMap, setErrorMap] = useState<string | null>(null);

  const isOpen24h = (opening_hours?: string) => {
    if (!opening_hours) return false;
    return (
      opening_hours.includes("24/7") ||
      opening_hours.includes("00:00-24:00") ||
      opening_hours.toLowerCase().includes("h24")
    );
  };

  const fetchCommissariati = useCallback(async (lat: number, lng: number) => {
    setLoadingMap(true);
    setErrorMap(null);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](around:5000,${lat},${lng});
        way["amenity"="police"](around:5000,${lat},${lng});
      );
      out center tags;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Errore nel recupero dati commissariati");
      const data = await res.json();

      const parsed: Commissariato[] = (data.elements as OverpassElement[])
        .map((el) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (!lat || !lng) return null;

          const aperturaH24 = isOpen24h(el.tags?.opening_hours);

          return {
            id: el.id,
            nome: el.tags?.name || "Commissariato / Questura",
            lat,
            lng,
            aperturaH24,
          };
        })
        .filter((el): el is Commissariato => el !== null);

      setCommissariati(parsed);
    } catch (e: unknown) {
      if (e instanceof Error) setErrorMap(e.message);
      else setErrorMap("Errore sconosciuto");
    } finally {
      setLoadingMap(false);
    }
  }, []);

  useEffect(() => {
    if (userPosition) {
      fetchCommissariati(userPosition.lat, userPosition.lng);
    }
  }, [userPosition, fetchCommissariati]);

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-900 to-teal-400 text-white p-6 flex flex-col items-center mt-10 relative">
      {/* Bottone Torna alla Home in alto a destra */}
      <div className="fixed top-4 right-6 z-50">
        <Link
          to="/home"
          className="px-4 py-2 bg-white bg-opacity-20 rounded text-white hover:bg-opacity-40 transition"
        >
          Torna alla Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Numeri di Emergenza e Indicazioni Utili</h1>

      <section className="max-w-xl w-full mb-8 bg-white bg-opacity-20 rounded-lg p-6 shadow-lg text-black">
        <h2 className="text-2xl font-semibold mb-4">Numeri di Emergenza</h2>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>
            <strong>112</strong> - Numero Unico Europeo per tutte le emergenze
          </li>
          <li>
            <strong>118</strong> - Ambulanza e emergenze sanitarie
          </li>
          <li>
            <strong>113</strong> - Polizia di Stato
          </li>
          <li>
            <strong>115</strong> - Vigili del Fuoco
          </li>
          <li>
            <strong>117</strong> - Carabinieri
          </li>
        </ul>
      </section>

      <section className="max-w-xl w-full mb-8 bg-white bg-opacity-20 rounded-lg p-6 shadow-lg text-black">
        <h2 className="text-2xl font-semibold mb-4">Cosa fare in caso di furto</h2>
        <p className="mb-4 text-lg leading-relaxed">
          Se sei stato vittima di un furto, ecco i passi da seguire:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-lg">
          <li>
            Contatta immediatamente il <strong>113 (Polizia)</strong> o il{" "}
            <strong>117 (Carabinieri)</strong> per fare la denuncia.
          </li>
          <li>
            Se ti trovi in una zona pericolosa o dopo una certa ora, cerca un luogo pubblico sicuro come una caserma o un commissariato vicino.
          </li>
          <li>
            Conserva tutte le prove e i documenti relativi al furto (es. ricevute, foto, testimonianze).
          </li>
          <li>Se necessario, chiedi assistenza sanitaria o psicologica.</li>
          <li>Non tentare di inseguire o affrontare i ladri da solo.</li>
        </ol>
      </section>

      <section className="max-w-xl w-full mb-8 bg-white bg-opacity-20 rounded-lg p-6 shadow-lg text-black">
        <h2 className="text-2xl font-semibold mb-4">Dopo una certa ora: cosa fare</h2>
        <p className="text-lg leading-relaxed">
          Dopo le <strong>20:00</strong> è particolarmente importante evitare di spostarsi da soli in zone isolate. Se subisci un furto in orario serale o notturno, ti consigliamo di:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2 text-lg">
          <li>Recarti immediatamente presso il più vicino commissariato o caserma di polizia aperto <strong>24h</strong>.</li>
          <li>Se non è possibile, chiama subito il <strong>112</strong> e resta in un luogo sicuro fino all’arrivo delle forze dell’ordine.</li>
          <li>Evita di tornare a casa o di spostarti da solo senza accompagnamento.</li>
          <li>Informare parenti o amici della situazione e della tua posizione.</li>
        </ul>
      </section>

      <section className="max-w-xl w-full mb-8 bg-white bg-opacity-20 rounded-lg p-6 shadow-lg text-black">
        <h2 className="text-2xl font-semibold mb-4">Commissariati e Questure aperti 24h vicini a te</h2>

        {loadingMap && <p>Caricamento mappa commissariati...</p>}
        {errorMap && <p className="text-red-600">{errorMap}</p>}

        {userPosition ? (
          <MapContainer
            center={[userPosition.lat, userPosition.lng]}
            zoom={13}
            className="w-full h-64 rounded-md"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FlyToUserPosition position={userPosition} />

            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={
                new L.Icon({
                  iconUrl: "/user-location.png",
                  iconSize: [25, 25],
                  iconAnchor: [12, 25],
                  popupAnchor: [0, -25],
                })
              }
            >
              <Popup>Sei qui</Popup>
            </Marker>

         {commissariati.map((c) => (
  <Marker
    key={c.id}
    position={[c.lat, c.lng]}
    icon={iconQuestura}
    title={c.nome} // aggiunta aria-label per accessibilità
  >
    <Popup>
      {c.nome}
      <br />
      {c.aperturaH24 ? (
        <span className="font-semibold text-green-600">Aperto 24h</span>
      ) : (
        <span className="font-semibold text-red-600">Orari limitati</span>
      )}
      <br />
      <a
        href={`https://www.google.com/maps/dir/?api=1&origin=${userPosition.lat},${userPosition.lng}&destination=${c.lat},${c.lng}&travelmode=driving`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Mostra indicazioni
      </a>
    </Popup>
  </Marker>
))}
          </MapContainer>
        ) : (
          <p>Caricamento posizione utente...</p>
        )}
      </section>
    </main>
  );
}
