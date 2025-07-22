import type { ZoneRischioForm } from "./ZoneRischioForm";

export type MotivoRequest = {
  motivo: string;
};

export interface User {
  id: number;
  nome: string;
  email: string;
  ruolo: string;  // coerente con backend
  [key: string]: unknown;
}

export interface Review {
  id: number;
  testo: string;
  voto: number;
  dataCreazione: string;
  autoreEmail: string;  // coerente con backend
  risposta?: string | null;
  [key: string]: unknown;
}

export interface Notifica {
  id: number;
  messaggio: string;
  userId: number;
  timestamp: string;  // timestamp in formato ISO string
}

const BASE_URL = "http://localhost:8080/api";

function getHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T | undefined> {
  if (res.ok) {
    if (res.status === 204) return undefined;
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return res.json() as Promise<T>;
    } else {
      const text = await res.text();
      throw new Error(`Expected JSON, got: ${text}`);
    }
  } else {
    let errorMsg = await res.text();
    try {
      const errObj = JSON.parse(errorMsg);
      if (errObj.message) errorMsg = errObj.message;
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(errorMsg || "Errore sconosciuto");
  }
}

// --- Zone a rischio ---

export async function fetchZones(token: string): Promise<ZoneRischioForm[]> {
  const res = await fetch(`${BASE_URL}/zone-rischio`, {
    headers: getHeaders(token),
  });
  return handleResponse<ZoneRischioForm[]>(res) as Promise<ZoneRischioForm[]>;
}

export async function createZone(zone: ZoneRischioForm, token: string): Promise<ZoneRischioForm> {
  const res = await fetch(`${BASE_URL}/zone-rischio`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(zone),
  });
  return handleResponse<ZoneRischioForm>(res) as Promise<ZoneRischioForm>;
}

export async function updateZone(id: number, zone: ZoneRischioForm, token: string): Promise<ZoneRischioForm> {
  const res = await fetch(`${BASE_URL}/zone-rischio/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(zone),
  });
  return handleResponse<ZoneRischioForm>(res) as Promise<ZoneRischioForm>;
}

export async function deleteZone(id: number, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/zone-rischio/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  await handleResponse<void>(res);
}

// --- Gestione Utenti ---

export async function fetchUsers(token: string): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: getHeaders(token),
  });
  return handleResponse<User[]>(res) as Promise<User[]>;
}

export async function activateUser(id: number, motivoRequest: MotivoRequest, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}/activate`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(motivoRequest),
  });
  await handleResponse<void>(res);
}

export async function deactivateUser(id: number, motivoRequest: MotivoRequest, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}/deactivate`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(motivoRequest),
  });
  await handleResponse<void>(res);
}

export async function deleteUser(id: number, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  await handleResponse<void>(res);
}

// --- Elimina profilo utente corrente con motivo ---

export async function deleteCurrentUser(motivo: string | null | undefined, token: string): Promise<void> {
  const body = motivo && motivo.trim().length > 0 ? { motivo: motivo.trim() } : {};
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "DELETE",
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  await handleResponse<void>(res);
}

// --- Gestione Recensioni ---

export async function fetchAllReviews(token: string): Promise<Review[]> {
  const res = await fetch(`${BASE_URL}/reviews`, {
    headers: getHeaders(token),
  });
  return handleResponse<Review[]>(res) as Promise<Review[]>;
}

export async function deleteReview(id: number, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/reviews/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  await handleResponse<void>(res);
}

export async function replyReview(id: number, risposta: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/reviews/${id}/reply`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ testoRisposta: risposta }),
  });
  await handleResponse<void>(res);
}

// --- Gestione Notifiche ---

export async function fetchUserNotifications(token: string): Promise<Notifica[]> {
  const res = await fetch(`${BASE_URL}/notifiche`, {
    headers: getHeaders(token),
  });
  const notifiche = await handleResponse<Notifica[]>(res);

  if (notifiche) {
    return notifiche.map(n => ({
      ...n,
      timestamp: n.timestamp ? new Date(n.timestamp).toLocaleString() : "",
    }));
  }
  return [];
}
