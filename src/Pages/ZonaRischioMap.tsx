import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
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
    map.flyTo([position.lat, position.lng], 12, { duration: 1.2 });
  }, [position, map]); 

  return null; 
} 

function getColorByLevel(level: string): string {
  switch (level.toUpperCase()) {
    case "ALTO":
      return "red";
    case "MEDIO":
      return "orange";
    case "BASSO":
      return "lime";
    default:
      return "gray";
  }
}

function metersFromKm(km: number) {
  return Math.round(km * 1000);
} 

export default function ZonaRischioMapAutocomplete() {
  const defaultPos = useMemo(() => ({ lat: 45.464211, lng: 9.191383 }), []); 
  const [ricerca, setRicerca] = useState("");  
  const [risultati, setRisultati] = useState<NominatimResult[]>([]); 
  const [posizione, setPosizione] = useState<{ lat: number; lng: number }>(defaultPos); 
  const [zoneRischio, setZoneRischio] = useState<ZonaRischio[]>([]); 
  const [radiusKm, setRadiusKm] = useState<number>(10);

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<number | null>(null); 
  const abortSearchRef = useRef<AbortController | null>(null);
  const abortZonesRef = useRef<AbortController | null>(null);

  const gradientBackground = `linear-gradient(
    to right,
    rgba(0,0,0,0.9) 0%,
    rgb(93,174,220) 10%,
    rgba(122,205,253,0.3) 50%,
    rgb(52,124,165) 90%,
    rgba(0,0,0,0.9) 100%
  )`;

  async function fetchZone(lat: number, lng: number, rKm: number) {
    abortZonesRef.current?.abort();
    const controller = new AbortController();
    abortZonesRef.current = controller;

    setLoadingZones(true);
    setError(null);

    try {
      const res = await fetch(`/api/zone-rischio/search?lat=${lat}&lng=${lng}&radiusKm=${rKm}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Errore ${res.status}: ${res.statusText}`);

      const zone: ZonaRischio[] = await res.json();
      setZoneRischio(zone);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Errore nel caricamento delle zone a rischio");
      setZoneRischio([]);
    } finally {
      setLoadingZones(false);
    }
  }

  async function cercaLuoghi(query: string) {
    const q = query.trim();
    if (q.length < 3) {
      setRisultati([]);
      return;
    }

    abortSearchRef.current?.abort();
    const controller = new AbortController();
    abortSearchRef.current = controller;

    setLoadingSearch(true);
    setError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          q
        )}&format=json&limit=6&countrycodes=IT&accept-language=it`,
        { signal: controller.signal, headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`Errore ${res.status}: ${res.statusText}`);

      const data: NominatimResult[] = await res.json();
      setRisultati(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Errore nella ricerca città");
      setRisultati([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  useEffect(() => {
    fetchZone(defaultPos.lat, defaultPos.lng, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      abortSearchRef.current?.abort();
      abortZonesRef.current?.abort();
    };
  }, []);

  function onRicercaChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setRicerca(val);

    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      cercaLuoghi(val);
    }, 450);
  }

  async function selezionaLuogo(luogo: NominatimResult) {
    const latNum = parseFloat(luogo.lat);
    const lonNum = parseFloat(luogo.lon);

    setPosizione({ lat: latNum, lng: lonNum });
    setRicerca(luogo.display_name);
    setRisultati([]);
    await fetchZone(latNum, lonNum, radiusKm);
  }

  function refreshZone() {
    fetchZone(posizione.lat, posizione.lng, radiusKm);
  }

  const dangerCounts = useMemo(() => {
    const counts = { ALTO: 0, MEDIO: 0, BASSO: 0, ALTRO: 0 };
    for (const z of zoneRischio) {
      const lvl = z.livelloPericolo?.toUpperCase();
      if (lvl === "ALTO") counts.ALTO++;
      else if (lvl === "MEDIO") counts.MEDIO++;
      else if (lvl === "BASSO") counts.BASSO++;
      else counts.ALTRO++;
    }
    return counts;
  }, [zoneRischio]);

  return (
    <div
      className="min-h-screen w-full px-4 py-6 text-[#e0f2f1]"
      style={{ background: gradientBackground }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Top bar (stile precedente) */}
        <div
          className="mb-4 flex flex-col gap-3 rounded-2xl p-4 shadow-lg backdrop-blur-md md:flex-row md:items-center md:justify-between"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <h1 className="text-2xl font-bold">Ricerca città</h1>
            <p className="mt-1 text-sm text-[#e0f2f1]/80">
              Cerca una città e visualizza le zone a rischio entro un raggio selezionato.
            </p>
          </div>

          <Link
            to="/home"
            className="w-fit font-semibold underline hover:text-[rgb(52,124,165)]"
          >
            Torna alla Home
          </Link>
        </div>

        {/* Controls */}
        <div
          className="mb-4 grid gap-4 rounded-2xl p-4 shadow-lg backdrop-blur-md md:grid-cols-[1fr_220px_200px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          {/* Search */}
          <div className="relative">
            <label className="mb-1 block text-sm font-semibold">Città</label>

            <div className="relative">
              <input
                type="text"
                value={ricerca}
                onChange={onRicercaChange}
                placeholder="Es. Milano, Roma, Napoli… (min 3 lettere)"
                className="w-full rounded-xl border border-white/15 bg-[#e0f2f1] px-4 py-3 text-sm font-bold text-[rgb(52,124,165)] outline-none placeholder:font-normal placeholder:text-slate-500"
                autoComplete="off"
              />

              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                {loadingSearch ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                ) : null}
              </div>
            </div>

            {/* Dropdown risultati (scuro e leggibile) */}
            {risultati.length > 0 && (
              <ul className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-auto rounded-xl border border-white/15 bg-black/70 p-1 shadow-xl backdrop-blur-md">
                {risultati.map((r) => (
                  <li key={r.place_id}>
                    <button
                      type="button"
                      onClick={() => selezionaLuogo(r)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#e0f2f1] hover:bg-[rgb(52,124,165)]/40"
                    >
                      <span className="line-clamp-2">{r.display_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Radius */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Raggio</label>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm font-semibold text-[#e0f2f1] outline-none backdrop-blur-md"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={20}>20 km</option>
              <option value={30}>30 km</option>
            </select>
            <p className="mt-1 text-xs text-[#e0f2f1]/70">Più raggio = più risultati.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={refreshZone}
              disabled={loadingZones}
              className={`rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition ${
                loadingZones
                  ? "cursor-not-allowed bg-white/10 text-[#e0f2f1]/70"
                  : "bg-[#e0f2f1] text-[rgb(52,124,165)] hover:bg-white"
              }`}
            >
              {loadingZones ? "Aggiorno…" : "Aggiorna zone"}
            </button>
            <p className="mt-1 text-xs text-[#e0f2f1]/70">
              Centro: {posizione.lat.toFixed(4)}, {posizione.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {error && <div className="mb-4 text-sm font-semibold text-[#ff8a65]">{error}</div>}

        {/* Content */}
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Side panel (scuro come prima) */}
          <aside
            className="rounded-2xl p-4 shadow-lg backdrop-blur-md"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-lg font-semibold">Riepilogo</h2>
            <p className="mt-1 text-sm text-[#e0f2f1]/80">
              Zone entro <span className="font-semibold">{radiusKm} km</span>:{" "}
              <span className="font-semibold">{zoneRischio.length}</span>
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Alto
                </span>
                <span className="font-semibold">{dangerCounts.ALTO}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" /> Medio
                </span>
                <span className="font-semibold">{dangerCounts.MEDIO}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-lime-400" /> Basso
                </span>
                <span className="font-semibold">{dangerCounts.BASSO}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-[#e0f2f1]/70">
              Le aree sono indicative. Usa prudenza e verifica fonti locali.
            </div>
          </aside>

          {/* Map (cornice scura + shadow) */}
          <div
            className="overflow-hidden rounded-2xl shadow-lg"
            style={{ border: "1px solid rgba(224,242,241,0.15)" }}
          >
            <div className="relative h-[70vh] w-full">
              {loadingZones && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                  <div className="rounded-xl bg-black/70 px-4 py-2 text-sm font-semibold text-[#e0f2f1] backdrop-blur-md">
                    Carico zone…
                  </div>
                </div>
              )}

              <MapContainer center={[posizione.lat, posizione.lng]} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Marker position={[posizione.lat, posizione.lng]}>
                  <Popup>
                    Centro ricerca
                    <br />
                    Raggio: {radiusKm} km
                  </Popup>
                </Marker>

                <Circle
                  center={[posizione.lat, posizione.lng]}
                  radius={metersFromKm(radiusKm)}
                  pathOptions={{ color: "rgb(52,124,165)", fillOpacity: 0.08 }}
                />

                <FlyToPosition position={posizione} />

                {zoneRischio.map((zona) => (
                  <Circle
                    key={zona.id}
                    center={[zona.latitudine, zona.longitudine]}
                    radius={300}
                    pathOptions={{
                      color: getColorByLevel(zona.livelloPericolo),
                      fillOpacity: 0.25,
                    }}
                  >
                    <Popup>
                      <strong>{zona.nome}</strong>
                      <br />
                      Città: {zona.nomeCitta}
                      <br />
                      Livello: {zona.livelloPericolo}
                      {zona.descrizione ? (
                        <>
                          <br />
                          {zona.descrizione}
                        </>
                      ) : null}
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
