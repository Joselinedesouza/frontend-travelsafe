import React, { useState, useRef } from "react";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type MappaConAutocompleteProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, result?: NominatimResult) => void;
  onPositionChange: (lat: number, lng: number, address?: string) => void;
  countryCodes?: string; // es. "it" o "us"
  style?: React.CSSProperties;
};

export default function MappaConAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onPositionChange,
  countryCodes,
  style,
}: MappaConAutocompleteProps) {
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
    onPositionChange(parseFloat(res.lat), parseFloat(res.lon), res.display_name);
    setResults([]);
  }

  return (
    <div style={{ position: "relative", ...style }}>
      {label && <label className="text-black mb-1 block">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={onInputChange}
        placeholder={placeholder}
        className="w-full p-2 rounded bg-white text-black border border-gray-300"
        autoComplete="off"
      />
      {loading && (
        <div className="text-black absolute top-full left-0 mt-1">Caricamento...</div>
      )}
      {error && (
        <div className="text-red-400 absolute top-full left-0 mt-1">{error}</div>
      )}
      {results.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded mt-1 z-50"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {results.map((res) => (
            <li
              key={res.place_id}
              onClick={() => onSelectResult(res)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-200"
            >
              {res.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
