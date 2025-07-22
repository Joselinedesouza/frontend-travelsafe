import { useEffect, useState, useCallback, useRef } from "react";
import { fetchUserNotifications } from "../Service/Api";
import type { Notifica } from "../Service/Api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";

export function AdminNotifiche() {
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stompClient = useRef<Client | null>(null);
  const subscription = useRef<StompSubscription | null>(null);

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    setError(null);
    try {
      console.log("Caricamento notifiche via API");
      const data = await fetchUserNotifications(token);
      console.log("Notifiche ricevute via API:", data);
      setNotifiche(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Errore sconosciuto";
      console.error("Errore fetch notifiche:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    console.log("Setup WebSocket...");
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log("STOMP:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("WebSocket connesso, sottoscrizione al topic notifiche");
      subscription.current = client.subscribe("/topic/notifiche", (message: IMessage) => {
        if (message.body) {
          try {
            const newNotifica: Notifica = JSON.parse(message.body);
            console.log("Nuova notifica deserializzata:", newNotifica);
            setNotifiche((prev) => {
              // evita duplicati
              if (prev.some(n => n.id === newNotifica.id)) return prev;
              return [newNotifica, ...prev];
            });
          } catch (error) {
            console.warn("Messaggio WS malformato ignorato:", error);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Errore STOMP:", frame.headers["message"]);
      setError("Errore connessione WebSocket: " + frame.headers["message"]);
    };

    client.onWebSocketError = (event) => {
      console.error("Errore WebSocket:", event);
      setError("Errore connessione WebSocket");
    };

    client.activate();
    stompClient.current = client;

    return () => {
      console.log("Disconnessione WebSocket...");
      subscription.current?.unsubscribe();
      stompClient.current?.deactivate();
    };
  }, []);

  if (loading) return <p className="text-center p-4">Caricamento notifiche...</p>;
  if (error) return <p className="text-center p-4 text-red-600">Errore: {error}</p>;
  if (notifiche.length === 0) return <p className="text-center p-4">Nessuna notifica disponibile.</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">Notifiche Utenti (Realtime)</h2>
      <ul className="space-y-4">
        {notifiche.map((n) => (
          <li
            key={n.id}
            className="border border-gray-300 rounded-lg bg-white shadow-sm p-4
              sm:flex sm:justify-between sm:items-center"
          >
            <p className="text-gray-800 mb-2 sm:mb-0">{n.messaggio}</p>
            <small className="text-gray-500 whitespace-nowrap">
              {n.timestamp
                ? new Date(n.timestamp).toLocaleString()
                : "Data non disponibile"}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
