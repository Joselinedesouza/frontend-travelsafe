import { useEffect, useState } from "react";
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
import { useRealTimePosition } from "../components/RealTimeLocation";
import { Link } from "react-router-dom";

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
const iconQuestura = new L.Icon({
  iconUrl: "/policeman.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});
const iconUser = new L.Icon({
  iconUrl: "/user-location.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
  className: "custom-marker-cursor",
});

function distanzaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

function FlyToUserPosition({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15, { duration: 2 });
    }
  }, [position, map]);
  return null;
}

interface OverpassElement {
  type: "node" | "way" | string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
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

export default function PointsofEmergency() {
  const { position: userPosition, error, loading, aggiornaPosizione } =
    useRealTimePosition();

  const [puntiEmergenza, setPuntiEmergenza] = useState<PuntoEmergenza[]>([]);
  const [puntiDenuncia, setPuntiDenuncia] = useState<PuntoDenuncia[]>([]);

  const [fetchErrorEmergenza, setFetchErrorEmergenza] = useState<string | null>(null);
  const [fetchErrorDenuncia, setFetchErrorDenuncia] = useState<string | null>(null);

  const [address, setAddress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedLocations, setSavedLocations] = useState<LocationRecord[]>(() => {
    const saved = localStorage.getItem("savedLocations");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch punti emergenza (ospedali, farmacie, caserme)
  async function fetchPuntiEmergenza(lat: number, lng: number) {
    setFetchErrorEmergenza(null);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:2000,${lat},${lng});
        way["amenity"="hospital"](around:2000,${lat},${lng});
        node["amenity"="pharmacy"](around:2000,${lat},${lng});
        way["amenity"="pharmacy"](around:2000,${lat},${lng});
        node["amenity"="police"](around:2000,${lat},${lng});
        way["amenity"="police"](around:2000,${lat},${lng});
        node["building"="police"](around:2000,${lat},${lng});
        way["building"="police"](around:2000,${lat},${lng});
      );
      out center;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Errore nel recupero dati punti emergenza");
      const data: OverpassResult = await res.json();

      const parsed: PuntoEmergenza[] = data.elements
        .map((el: OverpassElement) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (lat === undefined || lng === undefined) return null;

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
                ? "Caserma"
                : "Sconosciuto"),
            lat,
            lng,
            tipo,
          };
        })
        .filter((el): el is PuntoEmergenza => el !== null);

      setPuntiEmergenza(parsed);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setFetchErrorEmergenza(e.message);
      } else {
        setFetchErrorEmergenza("Errore generico fetch punti emergenza");
      }
    }
  }

  // Fetch punti denuncia (questure / commissariati)
  async function fetchPuntiDenuncia(lat: number, lng: number) {
    setFetchErrorDenuncia(null);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](around:5000,${lat},${lng});
        way["amenity"="police"](around:5000,${lat},${lng});
        node["building"="police"](around:5000,${lat},${lng});
        way["building"="police"](around:5000,${lat},${lng});
      );
      out center;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Errore nel recupero dati punti denuncia");
      const data: OverpassResult = await res.json();

      const parsed: PuntoDenuncia[] = data.elements
        .map((el: OverpassElement) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (lat === undefined || lng === undefined) return null;
          return {
            id: el.id,
            nome: el.tags?.name || "Questura / Commissariato",
            lat,
            lng,
          };
        })
        .filter((el): el is PuntoDenuncia => el !== null);

      setPuntiDenuncia(parsed);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setFetchErrorDenuncia(e.message);
      } else {
        setFetchErrorDenuncia("Errore generico fetch punti denuncia");
      }
    }
  }

  // Fetch indirizzo (reverse geocoding)
  async function fetchAddress(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!res.ok) throw new Error("Errore recupero indirizzo");
      const data = await res.json();
      setAddress(data.display_name || "Indirizzo non disponibile");
    } catch {
      setAddress("Errore recupero indirizzo");
    }
  }

  useEffect(() => {
    if (userPosition) {
      fetchAddress(userPosition.lat, userPosition.lng);
      fetchPuntiEmergenza(userPosition.lat, userPosition.lng);
      fetchPuntiDenuncia(userPosition.lat, userPosition.lng);
    }
  }, [userPosition]);

  async function salvaPosizione() {
    if (!userPosition || !address) return;
    setSaving(true);

    const nuovoRecord: LocationRecord = {
      lat: userPosition.lat,
      lng: userPosition.lng,
      address,
      timestamp: Date.now(),
    };

    try {
      const nuoviRecord = [...savedLocations, nuovoRecord];
      setSavedLocations(nuoviRecord);
      localStorage.setItem("savedLocations", JSON.stringify(nuoviRecord));

      // Salvataggio backend (modifica URL se serve)
      const response = await fetch("http://localhost:8080/api/location/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuovoRecord),
      });

      if (!response.ok) {
        throw new Error(`Errore nel salvataggio backend: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Errore salvataggio posizione:", error);
      alert("Errore durante il salvataggio della posizione. Riprova.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative p-3 pt-20 font-sans bg-gradient-to-r from-blue-900 to-teal-400 text-white flex flex-col items-center">
      <div className="fixed top-16 right-6 z-50">
        <Link
          to="/home"
          className="text-teal-200 font-semibold underline hover:text-teal-100"
        >
          Torna alla Home
        </Link>
      </div>

      <div className="max-w-xl w-full text-center mb-3">
        {userPosition
          ? `Posizione attuale: lat ${userPosition.lat.toFixed(
              6
            )}, lng ${userPosition.lng.toFixed(6)}`
          : "Posizione non disponibile"}
      </div>

      <div className="max-w-xl w-full text-center mb-3 italic">
        {address || "Caricamento indirizzo..."}
      </div>

      <h2 className="max-w-xl w-full mb-4 text-center text-xl font-semibold">
        Punti di Emergenza Vicini a Te
      </h2>

      <MapContainer
        center={userPosition ?? [41.9028, 12.4964]}
        zoom={13}
        className="w-full max-w-xl h-60 rounded-lg mb-6"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FlyToUserPosition position={userPosition} />

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={iconUser}>
            <Popup>Sei qui</Popup>
          </Marker>
        )}

        {puntiEmergenza.map((p) => {
          let icon = iconOspedale;
          if (p.tipo === "pharmacy") icon = iconFarmacia;
          else if (p.tipo === "police") icon = iconCaserma;
          else if (p.tipo === "hospital") icon = iconOspedale;

          const dist = userPosition
            ? distanzaKm(userPosition.lat, userPosition.lng, p.lat, p.lng)
            : null;
          const isNear = dist !== null && dist < 2;

          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              <Popup>{p.nome}</Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                {dist !== null ? `${dist.toFixed(3)} km da te` : ""}
              </Tooltip>
              {isNear && (
                <Circle
                  center={[p.lat, p.lng]}
                  radius={200}
                  pathOptions={{
                    color:
                      p.tipo === "hospital"
                        ? "red"
                        : p.tipo === "pharmacy"
                        ? "green"
                        : "blue",
                    fillOpacity: 0.2,
                  }}
                />
              )}
            </Marker>
          );
        })}

        {/* Marker punti denuncia (questure/commissariati) */}
        {puntiDenuncia.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={iconQuestura}>
            <Popup>{p.nome}</Popup>
          </Marker>
        ))}
      </MapContainer>


      <div className="max-w-md w-full flex flex-col gap-4 mb-6">
        <button
          onClick={() => (window.location.href = "tel:112")}
          className="w-full rounded-md bg-gradient-to-r from-red-600 to-red-900 px-4 py-2 font-bold text-white hover:brightness-110 transition"
        >
          Chiama 112
        </button>

        <button
          onClick={aggiornaPosizione}
          disabled={loading}
          className="w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-900 px-4 py-2 font-bold text-white disabled:opacity-50 hover:brightness-110 transition"
        >
          {loading ? "Caricamento..." : "Aggiorna Posizione"}
        </button>

        <button
          onClick={salvaPosizione}
          disabled={!userPosition || !address || saving}
          className="w-full rounded-md bg-gradient-to-r from-green-600 to-green-900 px-4 py-2 font-bold text-white disabled:opacity-50 hover:brightness-110 transition"
        >
          {saving ? "Salvataggio..." : "Registra Posizione di Emergenza"}
        </button>
      </div>

      {savedLocations.length > 0 && (
        <div className="max-w-xl w-full bg-white bg-opacity-20 rounded-lg p-4 mb-6 text-white overflow-y-auto max-h-48">
          <h3 className="mb-3 text-lg font-semibold">Posizioni di Emergenza Salvate</h3>
          <ul className="list-none p-0 m-0">
            {savedLocations.map((loc) => (
              <li key={loc.timestamp} className="mb-2">
                {new Date(loc.timestamp).toLocaleString()} - {loc.address}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(error || fetchErrorEmergenza || fetchErrorDenuncia) && (
        <div className="max-w-xl w-full bg-red-600 rounded-md p-3 text-center text-white mb-6">
          {error ?? fetchErrorEmergenza ?? fetchErrorDenuncia}
        </div>
      )}

      <style>{`
        .custom-marker-cursor {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}
