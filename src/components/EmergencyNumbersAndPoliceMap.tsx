import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const iconQuestura = new L.Icon({
  iconUrl: "/policeman.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

function FlyToPosition({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string };
}

type PuntoDenuncia = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
};

export function EmergencyNumbersAndPoliceMap({
  userPosition,
}: {
  userPosition: { lat: number; lng: number } | null;
}) {
  const [puntiDenuncia, setPuntiDenuncia] = useState<PuntoDenuncia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPuntiDenuncia(lat: number, lng: number) {
    setLoading(true);
    setError(null);

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
      const data = await res.json();

      const parsed = (data.elements as OverpassElement[])
        .map((el) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (!lat || !lng) return null;
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
        setError(e.message);
      } else {
        setError("Errore sconosciuto");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userPosition) {
      fetchPuntiDenuncia(userPosition.lat, userPosition.lng);
    }
  }, [userPosition]);

  return (
    <section className="w-full max-w-xl bg-white bg-opacity-20 rounded-lg p-4 mb-6 text-white">
      <h3 className="text-xl font-semibold mb-3">Numeri di Emergenza</h3>
      <ul className="list-disc list-inside mb-4">
        <li>112 - Numero Unico Europeo Emergenze</li>
        <li>118 - Ambulanza</li>
        <li>113 - Polizia</li>
        <li>115 - Vigili del Fuoco</li>
        <li>117 - Carabinieri</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Dove denunciare un furto</h3>

      {loading && <p>Caricamento punti denuncia...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {userPosition && (
        <MapContainer
          center={[userPosition.lat, userPosition.lng]}
          zoom={13}
          className="w-full h-48 rounded-md"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToPosition position={userPosition} />

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

          {puntiDenuncia.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={iconQuestura}>
              <Popup>{p.nome}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </section>
  );
}
