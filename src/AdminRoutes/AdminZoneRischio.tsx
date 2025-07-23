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
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestione Zone a Rischio (Admin)</h1>

      <form
        onSubmit={handleCreate}
        className="mb-6 border border-gray-300 rounded-lg p-4 bg-white text-black"
      >
        <h2 className="text-xl mb-4">Aggiungi nuova zona a rischio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* campi input e autocomplete città */}
          <input type="text" name="nome" placeholder="Nome zona" value={newZone.nome} onChange={handleNewZoneChange} required className="border rounded px-3 py-2" />
          <input type="text" name="descrizione" placeholder="Descrizione" value={newZone.descrizione} onChange={handleNewZoneChange} required className="border rounded px-3 py-2" />
          <input type="number" step="any" name="latitudine" placeholder="Latitudine" value={newZone.latitudine} onChange={handleNewZoneChange} required className="border rounded px-3 py-2" />
          <input type="number" step="any" name="longitudine" placeholder="Longitudine" value={newZone.longitudine} onChange={handleNewZoneChange} required className="border rounded px-3 py-2" />
          <select name="livelloPericolo" value={newZone.livelloPericolo} onChange={handleNewZoneChange} required className="border rounded px-3 py-2">
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

        <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Aggiungi Zona
        </button>
      </form>

      {/* Tabella zone rischio */}
      {zones.length === 0 ? (
        <p className="italic text-center text-gray-500">Nessuna zona a rischio disponibile.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="min-w-full text-left text-base">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap border">Nome Zona</th>
                <th className="py-3 px-4 whitespace-nowrap border max-w-xs">Descrizione</th>
                <th className="py-3 px-4 whitespace-nowrap text-center border">Latitudine</th>
                <th className="py-3 px-4 whitespace-nowrap text-center border">Longitudine</th>
                <th className="py-3 px-4 whitespace-nowrap text-center border">Livello Pericolo</th>
                <th className="py-3 px-4 whitespace-nowrap border">Città</th>
                <th className="py-3 px-4 whitespace-nowrap text-center border">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className={editingId === z.id ? "bg-azzurrochiaro/30" : "bg-white"}>
                  <td className="py-3 px-4 border">{z.nome}</td>
                  <td className="py-3 px-4 border max-w-xs truncate">{z.descrizione}</td>
                  <td className="py-3 px-4 border text-center whitespace-nowrap">{z.latitudine.toFixed(4)}</td>
                  <td className="py-3 px-4 border text-center whitespace-nowrap">{z.longitudine.toFixed(4)}</td>
                  <td className="py-3 px-4 border text-center whitespace-nowrap">
                    {editingId === z.id ? (
                      <form onSubmit={handleUpdate} className="inline-flex items-center gap-2">
                        <select
                          value={newLevel}
                          onChange={(e) => setNewLevel(e.target.value as DangerLevel)}
                          className="rounded border p-1 px-2 min-w-[100px]"
                          aria-label="Seleziona livello di pericolo"
                        >
                          <option value="BASSO">Basso</option>
                          <option value="MEDIO">Medio</option>
                          <option value="ALTO">Alto</option>
                        </select>
                        <button
                          type="submit"
                          disabled={newLevel === zones.find((zone) => zone.id === editingId)?.livelloPericolo}
                          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          Salva
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                        >
                          Annulla
                        </button>
                      </form>
                    ) : (
                      z.livelloPericolo
                    )}
                  </td>
                  <td className="py-3 px-4 border">{z.nomeCitta ?? "N/D"}</td>
                  <td className="py-3 px-4 border text-center whitespace-nowrap">
                    {editingId !== z.id && (
                      <>
                        <button
                          onClick={() => startEdit(z)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDelete(z.id!)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Elimina
                        </button>
                      </>
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
