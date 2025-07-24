import React, { useEffect, useState, useCallback } from "react";
import { fetchZones, createZone, updateZone, deleteZone } from "../Service/Api";
import type { ZoneRischioForm, DangerLevel } from "../Service/ZoneRischioForm";
import MappaConAutocomplete from "../Pages/MappaConAutocomplete";

export default function AdminZoneRischio() {
  const [zones, setZones] = useState<ZoneRischioForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newLevel, setNewLevel] = useState<DangerLevel>("BASSO");
  const [newZone, setNewZone] = useState<Partial<ZoneRischioForm>>({
    nome: "",
    descrizione: "",
    latitudine: 0,
    longitudine: 0,
    livelloPericolo: "BASSO",
    nomeCitta: "",
  });
  const token = localStorage.getItem("token") || "";

  // Carica tutte le zone aggiornate
  const loadZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rawZones = await fetchZones(token);
      // Normalizza nomeCitta se assente
      const mappedZones = rawZones.map((z) => ({
        ...z,
        nomeCitta: z.nomeCitta ?? (z.citta ? z.citta.nome : "N/D"),
      }));
      setZones(mappedZones);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Inizio modifica livello pericolo
  function startEdit(zone: ZoneRischioForm) {
    setEditingId(zone.id || null);
    setNewLevel(zone.livelloPericolo);
  }

  // Annulla modifica
  function cancelEdit() {
    setEditingId(null);
  }

  // Salva modifica livello pericolo - correggo invio DTO completo per evitare errori validazione
 async function handleUpdate(e: React.FormEvent) {
  e.preventDefault();
  if (editingId === null) return;

  try {
    // Trova la zona corrente per recuperare i dati completi
    const zonaDaModificare = zones.find((z) => z.id === editingId);
    if (!zonaDaModificare) throw new Error("Zona non trovata");

    // Creo un nuovo oggetto aggiornato, mantenendo i dati esistenti e sovrascrivendo solo il livello pericolo
    const updatedZone: ZoneRischioForm = {
      ...zonaDaModificare,
      livelloPericolo: newLevel,
    };

    await updateZone(editingId, updatedZone, token);
    setEditingId(null);
    await loadZones(); // aggiorna i dati
  } catch (e) {
    alert(e instanceof Error ? e.message : "Errore sconosciuto");
  }
}


  // Elimina zona
  async function handleDelete(id: number) {
    if (!window.confirm("Sei sicuro di voler eliminare questa zona?")) return;

    try {
      await deleteZone(id, token);
      await loadZones(); // Aggiorna dati dopo eliminazione
    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore sconosciuto");
    }
  }

  // Gestione form nuova zona
  function handleNewZoneChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setNewZone((prev) => ({
      ...prev,
      [name]:
        name === "latitudine" || name === "longitudine" ? parseFloat(value) : value,
    }));
  }

  // Cambia città da autocomplete
  function onCityChange(val: string) {
    setNewZone((prev) => ({
      ...prev,
      nomeCitta: val,
    }));
  }

  // Cambia posizione città da autocomplete
  function onCityPositionChange(lat: number, lng: number, address?: string) {
    setNewZone((prev) => ({
      ...prev,
      latitudine: lat,
      longitudine: lng,
      nomeCitta: address || prev.nomeCitta || "",
    }));
  }

  // Salva nuova zona
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (
      !newZone.nome ||
      !newZone.descrizione ||
      newZone.latitudine === undefined ||
      newZone.longitudine === undefined ||
      !newZone.livelloPericolo ||
      !newZone.nomeCitta
    ) {
      alert("Per favore, compila tutti i campi.");
      return;
    }
    try {
      await createZone(newZone as ZoneRischioForm, token);
      setNewZone({
        nome: "",
        descrizione: "",
        latitudine: 0,
        longitudine: 0,
        livelloPericolo: "BASSO",
        nomeCitta: "",
      });
      await loadZones(); // Aggiorna dati dopo creazione
    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore sconosciuto");
    }
  }

  if (loading)
    return <p className="text-center mt-12 text-lg font-semibold text-gray-700">Caricamento zone rischio...</p>;

  if (error)
    return <p className="text-center mt-12 text-lg font-semibold text-red-600">{error}</p>;

 return (
  <div className="p-3 max-w-[98%] mx-auto text-sm">
    <h1 className="text-xl font-semibold text-blue-900 mb-4">📍 Gestione Zone a Rischio</h1>

    {/* FORM creazione */}
    <form
      onSubmit={handleCreate}
      className="mb-4 border border-gray-300 rounded-lg p-3 bg-white"
    >
      <h2 className="text-base font-medium mb-3 text-gray-700">➕ Aggiungi Zona</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <input type="text" name="nome" placeholder="Nome zona" value={newZone.nome} onChange={handleNewZoneChange} required className="border rounded px-2 py-1" />
        <input type="text" name="descrizione" placeholder="Descrizione" value={newZone.descrizione} onChange={handleNewZoneChange} required className="border rounded px-2 py-1" />
        <input type="number" step="any" name="latitudine" placeholder="Latitudine" value={newZone.latitudine} onChange={handleNewZoneChange} required className="border rounded px-2 py-1" />
        <input type="number" step="any" name="longitudine" placeholder="Longitudine" value={newZone.longitudine} onChange={handleNewZoneChange} required className="border rounded px-2 py-1" />
        <select name="livelloPericolo" value={newZone.livelloPericolo} onChange={handleNewZoneChange} required className="border rounded px-2 py-1">
          <option value="BASSO">Basso</option>
          <option value="MEDIO">Medio</option>
          <option value="ALTO">Alto</option>
        </select>
        <MappaConAutocomplete
          label="Città"
          placeholder="Scrivi nome città..."
          value={newZone.nomeCitta || ""}
          countryCodes="it"
          onChange={onCityChange}
          onPositionChange={onCityPositionChange}
          style={{ width: "100%" }}
        />
      </div>

      <button type="submit" className="mt-3 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm">
        Aggiungi
      </button>
    </form>

    {/* TABELLA zone rischio */}
    {zones.length === 0 ? (
      <p className="italic text-center text-gray-500">Nessuna zona registrata.</p>
    ) : (
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="py-2 px-2 border">Nome</th>
              <th className="py-2 px-2 border">Descrizione</th>
              <th className="py-2 px-2 border text-center">Lat</th>
              <th className="py-2 px-2 border text-center">Long</th>
              <th className="py-2 px-2 border text-center">Livello</th>
              <th className="py-2 px-2 border">Città</th>
              <th className="py-2 px-2 border text-center">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr
                key={z.id}
                className={editingId === z.id ? "bg-blue-50" : "bg-white"}
              >
                <td className="py-2 px-2 border">{z.nome}</td>
                <td className="py-2 px-2 border max-w-[200px] truncate">{z.descrizione}</td>
                <td className="py-2 px-2 border text-center">{z.latitudine.toFixed(4)}</td>
                <td className="py-2 px-2 border text-center">{z.longitudine.toFixed(4)}</td>
                <td className="py-2 px-2 border text-center">
                  {editingId === z.id ? (
                    <form onSubmit={handleUpdate} className="inline-flex items-center gap-1">
                      <select
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value as DangerLevel)}
                        className="rounded border p-1"
                      >
                        <option value="BASSO">Basso</option>
                        <option value="MEDIO">Medio</option>
                        <option value="ALTO">Alto</option>
                      </select>
                      <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        ✔
                      </button>
                      <button type="button" onClick={cancelEdit} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                        ✖
                      </button>
                    </form>
                  ) : (
                    z.livelloPericolo
                  )}
                </td>
                <td className="py-2 px-2 border">{z.nomeCitta ?? "N/D"}</td>
                <td className="py-2 px-2 border text-center">
                  {editingId !== z.id && (
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button
                        onClick={() => startEdit(z)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(z.id!)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Elimina
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
}
