import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useRealTimePosition } from "../components/RealTimeLocation";
import { useNavigate, Link } from "react-router-dom";

// =======================
// ICONS
// =======================
const iconQuestura = new L.Icon({
  iconUrl: "/policeman.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const iconUser = new L.Icon({
  iconUrl: "/user-pin.png", // opzionale
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// =======================
// MAP HELPER
// =======================
function FlyToUserPosition({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

// =======================
// TYPES
// =======================
interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    opening_hours?: string;
    operator?: string;
    phone?: string;
    website?: string;
  };
}

type Commissariato = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  aperturaH24: boolean;

  // presenti ma possono essere undefined 
  opening_hours: string | undefined;
  operator: string | undefined;
  phone: string | undefined;
  website: string | undefined;
};

// =======================
// COMPONENT
// =======================
export default function InfoPage() {
  const navigate = useNavigate();

  // ✅ Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  const {
    position: userPosition,
    error: positionError,
    loading: loadingPosition,
  } = useRealTimePosition();

  const [commissariati, setCommissariati] = useState<Commissariato[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [errorMap, setErrorMap] = useState<string | null>(null);

  const [radius, setRadius] = useState<number>(5000);

  const isOpen24h = (opening_hours?: string) => {
    if (!opening_hours) return false;
    const oh = opening_hours.toLowerCase();
    return (
      oh.includes("24/7") ||
      oh.includes("00:00-24:00") ||
      oh.includes("0:00-24:00") ||
      oh.includes("h24") ||
      oh.includes("24h")
    );
  };

  const fetchCommissariati = useCallback(
    async (lat: number, lng: number, radiusMeters: number) => {
      setLoadingMap(true);
      setErrorMap(null);

      const query = `
        [out:json][timeout:30];
        (
          node["amenity"="police"](around:${radiusMeters},${lat},${lng});
          way["amenity"="police"](around:${radiusMeters},${lat},${lng});
          relation["amenity"="police"](around:${radiusMeters},${lat},${lng});
        );
        out center tags;
      `;

      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Impossibile recuperare i presidi (Overpass). Riprova.");
        }

        const data = await res.json();

        // ✅ flatMap: niente null, quindi TS felice
        const parsed: Commissariato[] = (data.elements as OverpassElement[]).flatMap(
          (el) => {
            const latVal = el.lat ?? el.center?.lat;
            const lngVal = el.lon ?? el.center?.lon;

            if (latVal == null || lngVal == null) return [];

            const opening = el.tags?.opening_hours;

            return [
              {
                id: el.id,
                nome: el.tags?.name || el.tags?.operator || "Presidio di Polizia",
                lat: latVal,
                lng: lngVal,
                aperturaH24: isOpen24h(opening),
                opening_hours: opening,
                operator: el.tags?.operator,
                phone: el.tags?.phone,
                website: el.tags?.website,
              },
            ];
          }
        );

        // ✅ Ordina: H24 prima, poi nome
        parsed.sort((a, b) => {
          if (a.aperturaH24 !== b.aperturaH24) return a.aperturaH24 ? -1 : 1;
          return a.nome.localeCompare(b.nome);
        });

        setCommissariati(parsed);
      } catch (e: unknown) {
        setErrorMap(e instanceof Error ? e.message : "Errore sconosciuto");
      } finally {
        setLoadingMap(false);
      }
    },
    []
  );

  useEffect(() => {
    if (userPosition) {
      fetchCommissariati(userPosition.lat, userPosition.lng, radius);
    }
  }, [userPosition, radius, fetchCommissariati]);

  const h24Count = useMemo(
    () => commissariati.filter((c) => c.aperturaH24).length,
    [commissariati]
  );

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-950 via-blue-900 to-teal-600 text-white p-6 flex flex-col items-center relative">
      {/* Top actions */}
      <div className="fixed top-4 right-6 z-50 flex gap-2">
        <a
          href="tel:112"
          className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition shadow"
          title="Chiama il Numero Unico 112"
        >
          Chiama 112
        </a>

        <Link
          to="/home"
          className="px-4 py-2 bg-white/20 rounded text-white hover:bg-white/30 transition shadow"
        >
          Home
        </Link>
      </div>

      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Emergenze e indicazioni utili</h1>
        <p className="text-white/80 mb-6">
          Info rapide + mappa dei presidi di Polizia vicino a te (dati OpenStreetMap/Overpass).
        </p>

        {/* Numeri */}
        <section className="w-full mb-6 bg-white/15 rounded-xl p-6 shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold mb-4">Numeri principali (Italia)</h2>
          <ul className="space-y-2 text-lg">
            <li>
              <span className="font-semibold">112</span> — Numero Unico Europeo (emergenze)
            </li>
            <li>
              <span className="font-semibold">115</span> — Vigili del Fuoco
            </li>
            <li>
              <span className="font-semibold">117</span> — Guardia di Finanza
            </li>
          </ul>

          <p className="text-sm text-white/70 mt-4">
            In caso di dubbio: chiama 112.
          </p>
        </section>

        {/* Furto */}
        <section className="w-full mb-6 bg-white/15 rounded-xl p-6 shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold mb-4">Se subisci un furto: cosa fare</h2>
          <ol className="list-decimal list-inside space-y-2 text-lg">
            <li>Vai in un luogo sicuro (locale aperto, hotel, posto illuminato e frequentato).</li>
            <li>Chiama <span className="font-semibold">112</span> e descrivi: dove sei, cosa è successo.</li>
            <li>Blocca carte/documenti (app banca) e segnala il furto.</li>
            <li>Fai denuncia presso un presidio appena possibile.</li>
          </ol>
        </section>

        {/* Presidi */}
        <section className="w-full mb-10 bg-white/15 rounded-xl p-6 shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Presidi di Polizia vicini a te</h2>
              <p className="text-sm text-white/75">
                “H24” dipende dai dati disponibili: se manca l’orario lo segnaliamo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-white/80">Raggio:</label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="bg-white/20 text-white rounded px-3 py-2 outline-none"
              >
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {loadingPosition && <p>Recupero posizione in corso…</p>}
            {positionError && (
              <p className="text-red-200">Errore geolocalizzazione: {positionError}</p>
            )}

            {loadingMap && <p>Caricamento presidi…</p>}

            {errorMap && (
              <div className="flex items-center justify-between gap-3 bg-red-500/20 rounded p-3">
                <p className="text-red-100">{errorMap}</p>
                {userPosition && (
                  <button
                    onClick={() =>
                      fetchCommissariati(userPosition.lat, userPosition.lng, radius)
                    }
                    className="px-3 py-2 bg-white/20 rounded hover:bg-white/30 transition"
                  >
                    Riprova
                  </button>
                )}
              </div>
            )}

            {!!commissariati.length && (
              <p className="text-sm text-white/80">
                Trovati: <span className="font-semibold">{commissariati.length}</span> — H24 segnalati:{" "}
                <span className="font-semibold">{h24Count}</span>
              </p>
            )}

            {commissariati.length > 0 && h24Count === 0 && (
              <p className="text-sm text-yellow-100 bg-yellow-500/20 rounded p-3">
                Nessun presidio risulta “H24” nel raggio selezionato (o gli orari non sono presenti).
                In caso di necessità: chiama 112.
              </p>
            )}
          </div>

          <div className="mt-4">
            {userPosition ? (
              <MapContainer
                center={[userPosition.lat, userPosition.lng]}
                zoom={14}
                className="w-full h-80 rounded-xl overflow-hidden"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FlyToUserPosition position={userPosition} />

                <Marker
                  position={[userPosition.lat, userPosition.lng]}
                  icon={iconUser} // se non hai l'immagine, rimuovi questa riga
                >
                  <Popup>
                    <div className="space-y-2">
                      <div className="font-semibold">Sei qui</div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${userPosition.lat},${userPosition.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Apri posizione su Google Maps
                      </a>
                    </div>
                  </Popup>
                </Marker>

                {commissariati.map((c) => (
                  <Marker
                    key={c.id}
                    position={[c.lat, c.lng]}
                    icon={iconQuestura}
                    title={c.nome}
                  >
                    <Popup>
                      <div className="space-y-2">
                        <div className="font-semibold">{c.nome}</div>

                        {c.aperturaH24 ? (
                          <div className="font-semibold text-green-600">H24 (segnalato)</div>
                        ) : c.opening_hours ? (
                          <div className="font-semibold text-orange-600">
                            Orari: {c.opening_hours}
                          </div>
                        ) : (
                          <div className="font-semibold text-gray-600">Orari non disponibili</div>
                        )}

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${userPosition.lat},${userPosition.lng}&destination=${c.lat},${c.lng}&travelmode=walking`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                        >
                          Indicazioni (a piedi)
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              !positionError && !loadingPosition && <p>Caricamento posizione…</p>
            )}
          </div>

          {commissariati.length > 0 && userPosition && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Elenco rapido</h3>
              <div className="space-y-2">
                {commissariati.slice(0, 8).map((c) => (
                  <div
                    key={`row-${c.id}`}
                    className="flex items-center justify-between gap-3 bg-white/10 rounded-lg p-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.nome}</div>
                      <div className="text-sm text-white/75">
                        {c.aperturaH24
                          ? "H24 (segnalato)"
                          : c.opening_hours
                          ? c.opening_hours
                          : "Orari non disponibili"}
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userPosition.lat},${userPosition.lng}&destination=${c.lat},${c.lng}&travelmode=walking`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Vai
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
