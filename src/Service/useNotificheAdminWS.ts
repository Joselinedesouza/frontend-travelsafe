import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import type { Notifica } from "../Service/Api"; // importa il tipo Notifica corretto
const API_URL = import.meta.env.VITE_API_URL as string;

export function useNotificheAdminWS() {
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);

  useEffect(() => {
    const socket = new SockJS(`${API_URL}/ws`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/notifiche-admin", (message) => {
        const nuovaNotifica: Notifica = JSON.parse(message.body);
        setNotifiche((prev) => [nuovaNotifica, ...prev]);
      });
    });

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  return notifiche;
}
