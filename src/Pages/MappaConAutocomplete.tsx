import React, { useEffect, useId, useMemo, useRef, useState } from "react";

export type NominatimResult = {
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

  // extra utili
  disabled?: boolean;
  debounceMs?: number;
  minChars?: number;
  limit?: number;
  language?: string; // es. "it"
};

export default function MappaConAutocomplete({
  label,
  placeholder = "Cerca un indirizzo…",
  value,
  onChange,
  onPositionChange,
  countryCodes,
  style,
  disabled = false,
  debounceMs = 350,
  minChars = 2,
  limit = 6,
  language = "it",
}: MappaConAutocompleteProps) {
  const inputId = useId();
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasResults = results.length > 0;
  const listId = useMemo(() => `autocomplete-list-${inputId}`, [inputId]);

  const buildUrl = (query: string) => {
    // Nominatim policy: meglio aggiungere un identificatore (User-Agent / Referer è gestito dal browser).
    // Qui aggiungiamo parametri utili e coerenti.
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: String(limit),
      "accept-language": language,
      addressdetails: "0",
    });

    if (countryCodes) params.set("countrycodes", countryCodes);

    return `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  };

  const fetchResults = async (query: string) => {
    const q = query.trim();

    if (q.length < minChars) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      setError(null);
      return;
    }

    // cancella chiamata precedente
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(buildUrl(q), {
        signal: controller.signal,
        headers: {
          // header leggero; in molti browser non puoi settare User-Agent.
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Errore nella ricerca");

      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(true);
      setActiveIndex(data.length ? 0 : -1);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // ignoriamo abort
      setError(e instanceof Error ? e.message : "Errore nella ricerca");
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
    } finally {
      setLoading(false);
    }
  };

  const scheduleFetch = (query: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchResults(query);
    }, debounceMs);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    scheduleFetch(val);
  };

  const selectResult = (res: NominatimResult) => {
    onChange(res.display_name, res);
    onPositionChange(parseFloat(res.lat), parseFloat(res.lon), res.display_name);
    setOpen(false);
    setResults([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (results.length) setOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        if (!hasResults) return;
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      }
      case "ArrowUp": {
        if (!hasResults) return;
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      }
      case "Enter": {
        if (!open || !hasResults || activeIndex < 0) return;
        e.preventDefault();
        selectResult(results[activeIndex]);
        break;
      }
      case "Escape": {
        setOpen(false);
        setActiveIndex(-1);
        break;
      }
    }
  };

  // chiudi dropdown cliccando fuori
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(ev.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // cleanup timer + abort
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-black">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-item-${activeIndex}` : undefined}
          className={`w-full rounded-lg border border-gray-300 bg-white p-2.5 pr-10 text-black outline-none transition
            focus:border-gray-400 focus:ring-2 focus:ring-black/10
            ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        />

        {/* spinner / stato */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
          ) : (
            <span className="text-xs text-gray-400">⌘K</span> // puoi rimuoverlo se non ti piace
          )}
        </div>
      </div>

      {/* messaggi */}
      {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
      {!error && !loading && value.trim().length >= minChars && open && results.length === 0 && (
        <div className="mt-1 text-sm text-gray-600">Nessun risultato.</div>
      )}

      {/* dropdown */}
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {results.map((res, index) => {
            const isActive = index === activeIndex;

            return (
              <li
                key={res.place_id}
                id={`${listId}-item-${index}`}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()} // evita blur prima del click
                onClick={() => selectResult(res)}
                className={`cursor-pointer px-3 py-2 text-sm transition ${
                  isActive ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-100`}
              >
                <span className="line-clamp-2">{res.display_name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
