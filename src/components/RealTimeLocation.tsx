import { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface Position {
  lat: number;
  lng: number;
}

interface UseRealTimePositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useRealTimePosition(options?: UseRealTimePositionOptions) {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const watcherId = useRef<number | null>(null);

  // Memoizza le opzioni per non ricrearle ad ogni render
  const geoOptions = useMemo(() => ({
    enableHighAccuracy: options?.enableHighAccuracy ?? true,
    timeout: options?.timeout ?? 10000,
    maximumAge: options?.maximumAge ?? 0,
  }), [options?.enableHighAccuracy, options?.timeout, options?.maximumAge]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata dal browser");
      return;
    }

    setLoading(true);
    watcherId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      geoOptions
    );

    return () => {
      if (watcherId.current !== null) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, [geoOptions]);

  const aggiornaPosizione = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      geoOptions
    );
  }, [geoOptions]);

  return { position, error, loading, aggiornaPosizione };
}
