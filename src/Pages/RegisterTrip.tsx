import React, { useState, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Link } from "react-router-dom"; 
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

type ZonaRischio = {
  id: number;
  nome: string;
  latitudine: number;
  longitudine: number;
  livelloPericolo: "BASSO" | "MEDIO" | "ALTO";
};

type Position = { lat: number; lng: number };

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type AutocompleteInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string, nominatimResult?: NominatimResult) => void;
  countryCodes?: string;
  style?: React.CSSProperties;
};

function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  countryCodes,
  style,
}: AutocompleteInputProps) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  async function fetchResults(query: string) {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5&accept-language=it`;
      if (countryCodes) url += `&countrycodes=${countryCodes}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Errore nella ricerca");
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore nella ricerca");
      setResults([]);
    }
    setLoading(false);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchResults(val);
    }, 400);
  }

  function onSelectResult(res: NominatimResult) {
    onChange(res.display_name, res);
    setResults([]);
  }

  return (
    <div style={{ position: "relative", ...style, marginBottom: 10}}>
      {label && (
        <label className="text-[#e0f2f1] mb-1 block mt-5" htmlFor={label}>
          {label}
        </label>
      )}
      <input
        id={label}
        type="text"
        value={value}
        onChange={onInputChange}
        placeholder={placeholder}
        className="w-full p-2 rounded border border-white text-white"
        autoComplete="off"
        style={{ position: "relative", background: "linear-gradient(90deg, #003f66, #66a7a3)" }}
      />
      {loading && (
        <div className="text-[#e0f2f1] absolute top-full left-0 mt-1" >
          Caricamento...
        </div>
      )}
      {error && (
        <div className="text-red-400 absolute top-full left-0 mt-1" >
          {error}
        </div>
      )}
      {results.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 max-h-40 overflow-y-auto bg-[#00796b] border border-white rounded mt-1"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            zIndex: 1002,
          }}
        >
          {results.map((res) => (
            <li
              key={res.place_id}
              onClick={() => onSelectResult(res)}
              className="cursor-pointer px-3 py-2 hover:bg-[#004d40]"
            >
              {res.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FlyToPosition({ position }: { position: Position }) {
  const map = useMap();
  React.useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (e: { latlng: Position }) => void }) {
  useMapEvents({ click: onClick });
  return null;
}

export function RegisterTripForm() {
  const [form, setForm] = React.useState({
    nome: "",
    cognome: "",
    email: "",
    statoNascita: "",
    provinciaNascita: "",
    paeseNascita: "",
    motivoViaggio: "",
    indirizzoAlloggio: "",
    latitudine: 41.9028,
    longitudine: 12.4964,
    telefonoCompleto: "",
    numeroEmergenzaPersonale: "",
    numeroEmergenzaAlternativo: "",
  });

  const [zoneRischio, setZoneRischio] = React.useState<ZonaRischio[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (form.latitudine && form.longitudine) {
      fetchZoneRischio(form.latitudine, form.longitudine);
    }
  }, [form.latitudine, form.longitudine]);

  async function fetchZoneRischio(lat: number, lng: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/zone-rischio/search?lat=${lat}&lng=${lng}&radiusKm=10`,
        { headers: { Authorization: `Bearer ${token ?? ""}` } }
      );
      if (!res.ok) throw new Error("Errore caricamento zone a rischio");
      const data: ZonaRischio[] = await res.json();
      setZoneRischio(data);
      setError(null);
    } catch (e) {
      setZoneRischio([]);
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Cambio indirizzo da autocomplete mappa
  function handleAddressChange(address: string, res?: NominatimResult) {
    setForm((prev) => ({
      ...prev,
      indirizzoAlloggio: address,
      latitudine: res ? parseFloat(res.lat) : prev.latitudine,
      longitudine: res ? parseFloat(res.lon) : prev.longitudine,
    }));
  }

  // Cambiamento campo con autocomplete generico (stato, provincia, paese)
  function handleGenericChange(
    field: "statoNascita" | "provinciaNascita" | "paeseNascita",
    val: string
  ) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/viaggi/mine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Errore durante la registrazione");
      }

      setSuccess(true);
      setForm({
        nome: "",
        cognome: "",
        email: "",
        statoNascita: "",
        provinciaNascita: "",
        paeseNascita: "",
        motivoViaggio: "",
        indirizzoAlloggio: "",
        latitudine: 41.9028,
        longitudine: 12.4964,
        telefonoCompleto: "",
        numeroEmergenzaPersonale: "",
        numeroEmergenzaAlternativo: "",
      });
      setZoneRischio([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  const handleBgChange = (
   e: React.SyntheticEvent<HTMLElement>,
  hover: boolean
) => {
  e.currentTarget.style.background = hover
    ? "linear-gradient(90deg, #66a7a3, #003f66)"
    : "linear-gradient(90deg, #003f66, #66a7a3)";
};
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(90deg, #003f66, #66a7a3)" }}
    >
      <div
        className="max-w-xl w-full rounded p-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-[#e0f2f1]">
          Registra il tuo viaggio
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-400 mb-4">Viaggio registrato con successo!</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border border-white text-white"
            style={{
              background: "linear-gradient(90deg, #003f66, #66a7a3)",
              transition: "background 0.3s",
            }}
            onFocus={(e) => handleBgChange(e, true)}
            onBlur={(e) => handleBgChange(e, false)}
            onMouseEnter={(e) => handleBgChange(e, true)}
            onMouseLeave={(e) => handleBgChange(e, false)}
          />

          <input
            name="cognome"
            placeholder="Cognome"
            value={form.cognome}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border border-white text-white"
            style={{
              background: "linear-gradient(90deg, #003f66, #66a7a3)",
              transition: "background 0.3s",
            }}
            onFocus={(e) => handleBgChange(e, true)}
            onBlur={(e) => handleBgChange(e, false)}
            onMouseEnter={(e) => handleBgChange(e, true)}
            onMouseLeave={(e) => handleBgChange(e, false)}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-white text-white"
            style={{
              background: "linear-gradient(90deg, #003f66, #66a7a3)",
              transition: "background 0.3s",
            }}
            onFocus={(e) => handleBgChange(e, true)}
            onBlur={(e) => handleBgChange(e, false)}
            onMouseEnter={(e) => handleBgChange(e, true)}
            onMouseLeave={(e) => handleBgChange(e, false)}
          />

          <AutocompleteInput
            label="Stato di nascita"
            placeholder="Stato di nascita"
            value={form.statoNascita}
            onChange={(val) => handleGenericChange("statoNascita", val)}
            style={{ marginBottom: 8 }}
          />

          <AutocompleteInput
            label="Provincia di nascita"
            placeholder="Provincia di nascita"
            value={form.provinciaNascita}
            onChange={(val) => handleGenericChange("provinciaNascita", val)}
            style={{ marginBottom: 8 }}
          />

          <AutocompleteInput
            label="Paese di nascita"
            placeholder="Paese di nascita"
            value={form.paeseNascita}
            onChange={(val) => handleGenericChange("paeseNascita", val)}
            style={{ marginBottom: 8 }}
          />

          <input
            name="motivoViaggio"
            placeholder="Motivo del viaggio"
            value={form.motivoViaggio}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border border-white text-white"
            style={{
              background: "linear-gradient(90deg, #003f66, #66a7a3)",
              transition: "background 0.3s",
            }}
            onFocus={(e) => handleBgChange(e, true)}
            onBlur={(e) => handleBgChange(e, false)}
            onMouseEnter={(e) => handleBgChange(e, true)}
            onMouseLeave={(e) => handleBgChange(e, false)}
          />

          <AutocompleteInput
            label="Indirizzo alloggio"
            placeholder="Indirizzo alloggio"
            value={form.indirizzoAlloggio}
            onChange={handleAddressChange}
            style={{ marginBottom: 8 }}
          />

          <div className="h-64 rounded border border-white mb-2">
            <MapContainer
              center={[form.latitudine, form.longitudine]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FlyToPosition position={{ lat: form.latitudine, lng: form.longitudine }} />
              <Marker position={[form.latitudine, form.longitudine]} />
              <MapClickHandler
                onClick={(e) => {
                  const { lat, lng } = e.latlng;
                  setForm((prev) => ({
                    ...prev,
                    latitudine: lat,
                    longitudine: lng,
                  }));
                  fetchZoneRischio(lat, lng);
                }}
              />
              {zoneRischio.map((zona) => (
                <Circle
                  key={zona.id}
                  center={[zona.latitudine, zona.longitudine]}
                  radius={500}
                  pathOptions={{
                    color:
                      zona.livelloPericolo === "ALTO"
                        ? "red"
                        : zona.livelloPericolo === "MEDIO"
                        ? "orange"
                        : "green",
                    fillOpacity: 0.3,
                  }}
                >
                  <Popup>
                    <strong>{zona.nome}</strong>
                    <br />
                    Livello: {zona.livelloPericolo}
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>

          <PhoneInput
            country={"it"}
            value={form.telefonoCompleto}
            onChange={(phone) => setForm((prev) => ({ ...prev, telefonoCompleto: phone }))}
            inputClass="w-full p-2 rounded border border-white text-white"
            buttonClass="bg-gradient-to-r from-[#003f66] to-[#66a7a3]"
            inputProps={{
              name: "telefonoCompleto",
              required: true,
              autoFocus: false,
            }}
          />

          <input
            name="numeroEmergenzaPersonale"
            placeholder="Numero emergenza personale"
            value={form.numeroEmergenzaPersonale}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border border-white text-white"
            style={{
              background: "linear-gradient(90deg, #003f66, #66a7a3)",
              transition: "background 0.3s",
            }}
            onFocus={(e) => handleBgChange(e, true)}
            onBlur={(e) => handleBgChange(e, false)}
            onMouseEnter={(e) => handleBgChange(e, true)}
            onMouseLeave={(e) => handleBgChange(e, false)}
          />

          <input
            name="numeroEmergenzaAlternativo"
            placeholder="Numero emergenza alternativo"
            value={form.numeroEmergenzaAlternativo}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded border border-white text-white"
            style={{
              background: "linear-gradient(90deg, #003f66, #66a7a3)",
              transition: "background 0.3s",
            }}
            onFocus={(e) => handleBgChange(e, true)}
            onBlur={(e) => handleBgChange(e, false)}
            onMouseEnter={(e) => handleBgChange(e, true)}
            onMouseLeave={(e) => handleBgChange(e, false)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded font-semibold text-[#e0f2f1] transition-colors"
            style={{
              background: "linear-gradient(90deg, #003f66, #66a7a3)",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => handleBgChange(e, true)}
            onMouseLeave={(e) => handleBgChange(e, false)}
            onFocus={(e) => handleBgChange(e, true)}
            onBlur={(e) => handleBgChange(e, false)}
          >
            {loading ? "Salvando..." : "Registra viaggio"}
          </button>
        </form>
        <Link
          to="/home"
          className="block mt-4 w-full text-center py-2 rounded font-semibold text-white transition-colors"
          style={{
            background: "linear-gradient(90deg, #003f66, #66a7a3)",
            transition: "background 0.3s",
          }}
          onMouseEnter={(e) => handleBgChange(e, true)}
          onMouseLeave={(e) => handleBgChange(e, false)}
          onFocus={(e) => handleBgChange(e, true)}
          onBlur={(e) => handleBgChange(e, false)}
        >
          Torna alla Home
        </Link>
      </div>
    </div>
  );
}
