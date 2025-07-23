import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Link } from "react-router-dom";

type ZonaRischio = {
  id: number;
  nome: string;
  descrizione?: string;
  latitudine: number;
  longitudine: number;
  livelloPericolo: string; // "ALTO", "MEDIO", "BASSO"
  nomeCitta: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

function FlyToPosition({ position }: { position: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 12, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

export default function ZonaRischioMapAutocomplete() {
  const [ricerca, setRicerca] = useState("");
  const [risultati, setRisultati] = useState<NominatimResult[]>([]);
  const [posizione, setPosizione] = useState<{ lat: number; lng: number } | null>(null);
  const [zoneRischio, setZoneRischio] = useState<ZonaRischio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce timer, tipo number per browser
  const debounceTimer = useRef<number | null>(null);

  const gradientBackground = `linear-gradient(
    to right,
    rgba(0,0,0,0.9) 0%,
    rgb(93,174,220) 10%,
    rgba(122,205,253,0.3) 50%,
    rgb(52,124,165) 90%,
    rgba(0,0,0,0.9) 100%
  )`;

  useEffect(() => {
    async function fetchZoneIniziali() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/zone-rischio/search?lat=45.464211&lng=9.191383&radiusKm=15");
        if (!res.ok) throw new Error(`Errore ${res.status}: ${res.statusText}`);

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Risposta non JSON dal backend:", text);
          throw new Error("Risposta dal server non è JSON");
        }

        const zone: ZonaRischio[] = await res.json();
        setZoneRischio(zone);
        setPosizione({ lat: 45.464211, lng: 9.191383 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore caricamento zone");
        setZoneRischio([]);
      }
      setLoading(false);
    }
    fetchZoneIniziali();
  }, []);

  function onRicercaChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setRicerca(val);
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      cercaLuoghi(val);
    }, 500);
  }

  async function cercaLuoghi(query: string) {
    if (query.trim().length < 3) {
      setRisultati([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5&countrycodes=IT&accept-language=it`
      );
      if (!res.ok) throw new Error(`Errore ${res.status}: ${res.statusText}`);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Risposta non JSON da nominatim:", text);
        throw new Error("Risposta da nominatim non è JSON");
      }

      const dati: NominatimResult[] = await res.json();
      setRisultati(dati);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nella ricerca città");
    }
    setLoading(false);
  }

  async function selezionaLuogo(luogo: NominatimResult) {
    const latNum = parseFloat(luogo.lat);
    const lonNum = parseFloat(luogo.lon);
    setPosizione({ lat: latNum, lng: lonNum });
    setRisultati([]);
    setRicerca(luogo.display_name);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/zone-rischio/search?lat=${latNum}&lng=${lonNum}&radiusKm=10`);
      if (!res.ok) throw new Error(`Errore ${res.status}: ${res.statusText}`);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Risposta non JSON dal backend:", text);
        throw new Error("Risposta dal server non è JSON");
      }

      const zone: ZonaRischio[] = await res.json();
      setZoneRischio(zone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento delle zone a rischio");
      setZoneRischio([]);
    }
    setLoading(false);
  }

  function getColorByLevel(level: string): string {
    switch (level.toUpperCase()) {
      case "ALTO":
        return "red";
      case "MEDIO":
        return "orange";
      case "BASSO":
        return "green";
      default:
        return "gray";
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        padding: 16,
        color: "#e0f2f1",
        display: "flex",
        flexDirection: "column",
        background: gradientBackground,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          background: gradientBackground,
          padding: "8px 12px",
          borderRadius: 8,
        }}
      >
        <h2 style={{ margin: 0 }}>Ricerca città</h2>
        <Link to="/home" className="text-[#e0f2f1] font-semibold underline hover:text-[rgb(52,124,165)]">
          Torna alla Home
        </Link>
      </div>

      <input
        type="text"
        value={ricerca}
        onChange={onRicercaChange}
        placeholder="Inserisci nome città (min 3 lettere)"
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 8,
          border: "none",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          fontSize: 16,
          color: "rgb(52,124,165)",
          outline: "none",
          marginBottom: 8,
          backgroundColor: "#e0f2f1",
          fontWeight: "bold",
        }}
      />

      {loading && <div>Caricamento...</div>}
      {error && <div style={{ color: "#ff8a65", marginBottom: 8 }}>{error}</div>}

      {risultati.length > 0 && (
        <ul
          style={{
            border: "1px solid #e0f2f1",
            padding: 0,
            listStyle: "none",
            maxHeight: 150,
            overflowY: "auto",
            marginTop: 0,
            marginBottom: 10,
            background: gradientBackground,
            borderRadius: 8,
          }}
        >
          {risultati.map((r) => (
            <li
              key={r.place_id}
              onClick={() => selezionaLuogo(r)}
              style={{
                padding: 10,
                cursor: "pointer",
                borderBottom: "1px solid rgb(52,124,165)",
                color: "#e0f2f1",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgb(52,124,165)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}

      <div
        style={{
          flexGrow: 1,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        }}
      >
        <MapContainer
          center={posizione ?? [41.9028, 12.4964]}
          zoom={posizione ? 12 : 5}
          style={{ height: "100%", width: "100%", borderRadius: 8 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {posizione && (
            <>
              <Marker position={[posizione.lat, posizione.lng]}>
                <Popup>Città selezionata</Popup>
              </Marker>
              <FlyToPosition position={posizione} />
            </>
          )}

          {zoneRischio.map((zona) => (
            <Circle
              key={zona.id}
              center={[zona.latitudine, zona.longitudine]}
              radius={300}
              pathOptions={{
                color: getColorByLevel(zona.livelloPericolo),
                fillOpacity: 0.3,
              }}
            >
              <Popup>
                <strong>{zona.nome}</strong>
                <br />
                Città: {zona.nomeCitta}
                <br />
                Livello: {zona.livelloPericolo}
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
