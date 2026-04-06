import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { useRealTimePosition } from "../components/RealTimeLocation";

type PuntoEmergenza = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  tipo: "hospital" | "pharmacy" | "police" | "unknown";
};

type PuntoDenuncia = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
};

type LocationRecord = {
  lat: number;
  lng: number;
  address: string;
  timestamp: number;
};

interface OverpassElement {
  type: "node" | "way" | string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    amenity?: string;
    building?: string;
    [key: string]: string | number | boolean | undefined;
  };
}
interface OverpassResult {
  elements: OverpassElement[];
}

// ✅ icone come nel tuo esempio: path assoluto da /public
const iconOspedale = new L.Icon({
  iconUrl: "/hospital-building.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  className: "custom-marker-cursor",
});
const iconFarmacia = new L.Icon({
  iconUrl: "/drugstore.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  className: "custom-marker-cursor",
});
const iconCaserma = new L.Icon({
  iconUrl: "/policeman.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  className: "custom-marker-cursor",
});
const iconQuestura = iconCaserma;

const iconUser = new L.Icon({
  iconUrl: "/user-location.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
  className: "custom-marker-cursor",
});

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

async function fetchOverpass(query: string, signal?: AbortSignal): Promise<OverpassResult> {
  let lastErr: unknown = null;

  for (const base of OVERPASS_ENDPOINTS) {
    try {
      const url = `${base}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
      return (await res.json()) as OverpassResult;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Overpass non disponibile. Riprova tra poco.");
}

function distanzaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function metersFromKm(km: number) {
  return Math.round(km * 1000);
}

function FlyToUserPosition({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 15, { duration: 1.2 });
  }, [position, map]);
  return null;
}

function getIconByType(tipo: PuntoEmergenza["tipo"]) {
  if (tipo === "pharmacy") return iconFarmacia;
  if (tipo === "police") return iconCaserma;
  return iconOspedale;
}

export default function PointsofEmergency() {
  const { position: userPosition, error: geoError, loading: geoLoading, aggiornaPosizione } =
    useRealTimePosition();

  const [radiusKm, setRadiusKm] = useState<number>(2);

  const [puntiEmergenza, setPuntiEmergenza] = useState<PuntoEmergenza[]>([]);
  const [puntiDenuncia, setPuntiDenuncia] = useState<PuntoDenuncia[]>([]);

  const [address, setAddress] = useState<string | null>(null);

  const [loadingPoints, setLoadingPoints] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const [savedLocations, setSavedLocations] = useState<LocationRecord[]>(() => {
    const saved = localStorage.getItem("savedLocations");
    return saved ? JSON.parse(saved) : [];
  });

  const abortRef = useRef<AbortController | null>(null);

  const gradientBackground = `linear-gradient(
    to right,
    rgba(0,0,0,0.9) 0%,
    rgb(93,174,220) 10%,
    rgba(122,205,253,0.3) 50%,
    rgb(52,124,165) 90%,
    rgba(0,0,0,0.9) 100%
  )`;

  async function fetchAddress(lat: number, lng: number, signal?: AbortSignal) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { signal, headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("Errore recupero indirizzo");
      const data = await res.json();
      setAddress(data.display_name || "Indirizzo non disponibile");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setAddress("Indirizzo non disponibile");
    }
  }

  async function fetchAllPoints(lat: number, lng: number) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingPoints(true);
    setFetchError(null);

    // ✅ query emergenza (ospedale/farmacia/polizia) più realistica
    const qEmergenza = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:3000,${lat},${lng});
        way["amenity"="hospital"](around:3000,${lat},${lng});
        node["amenity"="pharmacy"](around:2500,${lat},${lng});
        way["amenity"="pharmacy"](around:2500,${lat},${lng});
        node["amenity"="police"](around:4000,${lat},${lng});
        way["amenity"="police"](around:4000,${lat},${lng});
        node["building"="police"](around:4000,${lat},${lng});
        way["building"="police"](around:4000,${lat},${lng});
      );
      out center;
    `;

    // ✅ query denuncia (questure/commissariati) più larga
    const qDenuncia = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](around:6000,${lat},${lng});
        way["amenity"="police"](around:6000,${lat},${lng});
        node["building"="police"](around:6000,${lat},${lng});
        way["building"="police"](around:6000,${lat},${lng});
      );
      out center;
    `;

    try {
      await fetchAddress(lat, lng, controller.signal);

      const [dataEmergenza, dataDenuncia] = await Promise.all([
        fetchOverpass(qEmergenza, controller.signal),
        fetchOverpass(qDenuncia, controller.signal),
      ]);

      const emergenzaParsed: PuntoEmergenza[] = dataEmergenza.elements
        .map((el) => {
          const plat = el.lat ?? el.center?.lat;
          const plng = el.lon ?? el.center?.lon;

          
          if (plat == null || plng == null) return null;

          let tipo: PuntoEmergenza["tipo"] = "unknown";
          if (el.tags?.amenity === "hospital") tipo = "hospital";
          else if (el.tags?.amenity === "pharmacy") tipo = "pharmacy";
          else if (el.tags?.amenity === "police" || el.tags?.building === "police")
            tipo = "police";

          return {
            id: el.id,
            nome:
              el.tags?.name ||
              (tipo === "hospital"
                ? "Ospedale"
                : tipo === "pharmacy"
                ? "Farmacia"
                : tipo === "police"
                ? "Polizia"
                : "Punto"),
            lat: plat,
            lng: plng,
            tipo,
          };
        })
        .filter((x): x is PuntoEmergenza => x !== null);

      const denunciaParsed: PuntoDenuncia[] = dataDenuncia.elements
        .map((el) => {
          const plat = el.lat ?? el.center?.lat;
          const plng = el.lon ?? el.center?.lon;
          if (plat == null || plng == null) return null;

          return {
            id: el.id,
            nome: el.tags?.name || "Questura / Commissariato",
            lat: plat,
            lng: plng,
          };
        })
        .filter((x): x is PuntoDenuncia => x !== null);

      // ✅ dedup
      const uniqE = new Map<string, PuntoEmergenza>();
      for (const p of emergenzaParsed) uniqE.set(`${p.tipo}-${p.id}`, p);

      const uniqD = new Map<number, PuntoDenuncia>();
      for (const p of denunciaParsed) uniqD.set(p.id, p);

      setPuntiEmergenza(Array.from(uniqE.values()));
      setPuntiDenuncia(Array.from(uniqD.values()));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setFetchError(e instanceof Error ? e.message : "Errore nel recupero punti");
      setPuntiEmergenza([]);
      setPuntiDenuncia([]);
    } finally {
      setLoadingPoints(false);
    }
  }

  useEffect(() => {
    if (userPosition) fetchAllPoints(userPosition.lat, userPosition.lng);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosition]);

  const emergenzaVicini = useMemo(() => {
    if (!userPosition) return [];
    return puntiEmergenza
      .map((p) => ({
        ...p,
        dist: distanzaKm(userPosition.lat, userPosition.lng, p.lat, p.lng),
      }))
      .filter((p) => p.dist <= radiusKm)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 12);
  }, [puntiEmergenza, userPosition, radiusKm]);

  const denunciaVicini = useMemo(() => {
    if (!userPosition) return [];
    // denuncia: almeno 2km, altrimenti spesso vuoto
    const r = Math.max(radiusKm, 2);
    return puntiDenuncia
      .map((p) => ({
        ...p,
        dist: distanzaKm(userPosition.lat, userPosition.lng, p.lat, p.lng),
      }))
      .filter((p) => p.dist <= r)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 10);
  }, [puntiDenuncia, userPosition, radiusKm]);

  async function salvaPosizione() {
    if (!userPosition || !address) return;
    setSaving(true);

    const nuovo: LocationRecord = {
      lat: userPosition.lat,
      lng: userPosition.lng,
      address,
      timestamp: Date.now(),
    };

    try {
      const nuovi = [nuovo, ...savedLocations].slice(0, 20);
      setSavedLocations(nuovi);
      localStorage.setItem("savedLocations", JSON.stringify(nuovi));

      // ✅ relativo (funziona anche in deploy)
      const res = await fetch("/api/location/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuovo),
      });
      if (!res.ok) throw new Error("Errore salvataggio backend");
    } catch {
      alert("Errore durante il salvataggio. Riprova.");
    } finally {
      setSaving(false);
    }
  }

  const anyError = geoError ?? fetchError ?? null;

  return (
    <div className="min-h-screen w-full px-4 py-6 text-[#e0f2f1]" style={{ background: gradientBackground }}>
      <div className="mx-auto w-full max-w-6xl">
        {/* Top bar */}
        <div
          className="mb-4 flex flex-col gap-3 rounded-2xl p-4 shadow-lg backdrop-blur-md md:flex-row md:items-center md:justify-between"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <h1 className="text-2xl font-bold">Punti di Emergenza</h1>
            <p className="mt-1 text-sm text-[#e0f2f1]/80">
              Trova ospedali, farmacie e polizia vicino a te. Salva la posizione e ottieni indicazioni.
            </p>
          </div>

          <Link to="/home" className="font-semibold underline hover:text-[rgb(52,124,165)]">
            Torna alla Home
          </Link>
        </div>

        {/* Controls */}
        <div
          className="mb-4 grid gap-4 rounded-2xl p-4 shadow-lg backdrop-blur-md md:grid-cols-[1fr_220px_220px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <p className="text-sm text-[#e0f2f1]/70">Posizione attuale</p>
            <p className="font-semibold">
              {userPosition
                ? `lat ${userPosition.lat.toFixed(6)}, lng ${userPosition.lng.toFixed(6)}`
                : "Posizione non disponibile"}
            </p>
            <p className="mt-1 text-sm italic text-[#e0f2f1]/80">
              {address ? address : "Caricamento indirizzo..."}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Raggio</p>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm font-semibold text-[#e0f2f1] outline-none backdrop-blur-md"
            >
              <option value={1}>1 km</option>
              <option value={2}>2 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
            </select>
            <p className="mt-1 text-xs text-[#e0f2f1]/70">Filtra i risultati vicino a te.</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => (window.location.href = "tel:112")}
              className="rounded-xl bg-gradient-to-r from-red-600 to-red-900 px-4 py-3 text-sm font-bold text-white hover:brightness-110 transition"
            >
              Chiama 112
            </button>

            <button
              onClick={aggiornaPosizione}
              disabled={geoLoading}
              className={`rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition ${
                geoLoading
                  ? "cursor-not-allowed bg-white/10 text-[#e0f2f1]/70"
                  : "bg-[#e0f2f1] text-[rgb(52,124,165)] hover:bg-white"
              }`}
            >
              {geoLoading ? "Aggiorno…" : "Aggiorna posizione"}
            </button>

            <button
              onClick={() => userPosition && fetchAllPoints(userPosition.lat, userPosition.lng)}
              disabled={!userPosition || loadingPoints}
              className={`rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition ${
                !userPosition || loadingPoints
                  ? "cursor-not-allowed bg-white/10 text-[#e0f2f1]/70"
                  : "bg-black/30 text-[#e0f2f1] hover:bg-black/40"
              }`}
            >
              {loadingPoints ? "Carico…" : "Ricarica punti"}
            </button>

            <button
              onClick={salvaPosizione}
              disabled={!userPosition || !address || saving}
              className="rounded-xl bg-gradient-to-r from-green-600 to-green-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 hover:brightness-110 transition"
            >
              {saving ? "Salvataggio…" : "Salva posizione"}
            </button>
          </div>
        </div>

        {anyError && (
          <div className="mb-4 rounded-2xl border border-red-300/30 bg-red-500/15 p-3 text-sm text-[#e0f2f1]">
            <span className="font-semibold">Errore:</span> {anyError}
          </div>
        )}

        {/* Map + list */}
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl shadow-lg" style={{ border: "1px solid rgba(224,242,241,0.15)" }}>
            <div className="relative h-[70vh] w-full">
              {loadingPoints && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                  <div className="rounded-xl bg-black/70 px-4 py-2 text-sm font-semibold text-[#e0f2f1] backdrop-blur-md">
                    Caricamento punti…
                  </div>
                </div>
              )}

              <MapContainer
                center={userPosition ?? [41.9028, 12.4964]}
                zoom={userPosition ? 14 : 5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FlyToUserPosition position={userPosition} />

                {userPosition && (
                  <>
                    <Circle
                      center={[userPosition.lat, userPosition.lng]}
                      radius={metersFromKm(radiusKm)}
                      pathOptions={{ color: "rgb(52,124,165)", fillOpacity: 0.08 }}
                    />

                    <Marker position={[userPosition.lat, userPosition.lng]} icon={iconUser}>
                      <Popup>Sei qui</Popup>
                    </Marker>
                  </>
                )}

                {emergenzaVicini.map((p) => (
                  <Marker key={`${p.tipo}-${p.id}`} position={[p.lat, p.lng]} icon={getIconByType(p.tipo)}>
                    <Popup>
                      <strong>{p.nome}</strong>
                      <br />
                      {p.dist.toFixed(2)} km da te
                    </Popup>
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      {p.dist.toFixed(2)} km
                    </Tooltip>

                    {p.dist <= 1 && (
                      <Circle
                        center={[p.lat, p.lng]}
                        radius={200}
                        pathOptions={{
                          color: p.tipo === "hospital" ? "red" : p.tipo === "pharmacy" ? "lime" : "dodgerblue",
                          fillOpacity: 0.15,
                        }}
                      />
                    )}
                  </Marker>
                ))}

                {denunciaVicini.map((p) => (
                  <Marker key={`denuncia-${p.id}`} position={[p.lat, p.lng]} icon={iconQuestura}>
                    <Popup>{p.nome}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Right panel */}
          <div
            className="rounded-2xl p-4 shadow-lg backdrop-blur-md"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <h3 className="text-lg font-semibold">Vicino a te</h3>
            <p className="mt-1 text-sm text-[#e0f2f1]/75">
              Risultati entro <span className="font-semibold">{radiusKm} km</span>.
            </p>

            <div className="mt-3 space-y-4 max-h-[58vh] overflow-auto pr-1">
              <div>
                <p className="mb-2 text-sm font-semibold">Emergenza</p>
                {emergenzaVicini.length === 0 ? (
                  <div className="rounded-xl bg-black/20 p-3 text-sm text-[#e0f2f1]/75">
                    Nessun punto trovato nel raggio.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {emergenzaVicini.map((p) => (
                      <li key={`list-${p.tipo}-${p.id}`} className="rounded-xl bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{p.nome}</p>
                            <p className="text-xs text-[#e0f2f1]/70">
                              {p.tipo === "hospital"
                                ? "Ospedale"
                                : p.tipo === "pharmacy"
                                ? "Farmacia"
                                : p.tipo === "police"
                                ? "Polizia"
                                : "Punto"}{" "}
                              • {p.dist.toFixed(2)} km
                            </p>
                          </div>

                          <a
                            className="shrink-0 rounded-lg bg-[#e0f2f1] px-3 py-1.5 text-xs font-bold text-[rgb(52,124,165)] hover:bg-white"
                            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Indicazioni
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Denuncia</p>
                {denunciaVicini.length === 0 ? (
                  <div className="rounded-xl bg-black/20 p-3 text-sm text-[#e0f2f1]/75">
                    Nessun commissariato nel raggio.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {denunciaVicini.map((p) => (
                      <li key={`list-denuncia-${p.id}`} className="rounded-xl bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{p.nome}</p>
                            <p className="text-xs text-[#e0f2f1]/70">{p.dist.toFixed(2)} km</p>
                          </div>

                          <a
                            className="shrink-0 rounded-lg bg-black/30 px-3 py-1.5 text-xs font-bold text-[#e0f2f1] hover:bg-black/40"
                            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Indicazioni
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {savedLocations.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold">Posizioni salvate</p>
                  <ul className="mt-2 space-y-2">
                    {savedLocations.slice(0, 5).map((loc) => (
                      <li key={loc.timestamp} className="text-xs text-[#e0f2f1]/80">
                        {new Date(loc.timestamp).toLocaleString()} — {loc.address}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .custom-marker-cursor { cursor: pointer !important; }
        `}</style>
      </div>
    </div>
  );
}
