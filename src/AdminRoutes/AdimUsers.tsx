import { useEffect, useState, useCallback } from "react";
import { fetchUsers, activateUser, deactivateUser, deleteUser } from "../Service/Api";
import type { User } from "../Service/Api";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token") || "";

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(token);

      // Normalizza per sicurezza: aggiungi proprietà obbligatorie se mancanti
      const normalizedUsers = data.map(u => ({
        ...u,
        role: typeof u.role === "string" ? u.role : "UNKNOWN",
        enabled: typeof u.enabled === "boolean" ? u.enabled : true,
      }));

      setUsers(normalizedUsers);
    } catch (e) {
      alert("Errore caricamento utenti");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleDeactivate(id: number) {
    const motivo = prompt("Inserisci il motivo della disattivazione:");
    if (!motivo) return;

    try {
      await deactivateUser(id, { motivo }, token);
      alert("Utente disattivato e mail inviata.");
      await loadUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore disattivazione");
    }
  }

  async function handleActivate(id: number) {
    const motivo = prompt("Inserisci il motivo della riattivazione:");
    if (!motivo) return;

    try {
      await activateUser(id, { motivo }, token);
      alert("Utente riattivato e mail inviata.");
      await loadUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore riattivazione");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Sei sicuro di voler eliminare l'utente?")) return;

    try {
      await deleteUser(id, token);
      alert("Utente eliminato.");
      await loadUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore eliminazione");
    }
  }

  return (
    <div className="p-4 mt-5">
      <h1 className="text-2xl font-bold mb-6">Gestione Utenti</h1>

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left whitespace-nowrap">ID</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Nome</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Email</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Ruolo</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Stato</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={u.enabled ? "bg-green-100" : "bg-red-100"}
                >
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">{u.id}</td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">{u.nome}</td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">{u.email}</td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">{String(u.role)}</td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">
                    {u.enabled ? "Attivo" : "Disattivo"}
                  </td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {u.enabled ? (
                        <button
                          onClick={() => handleDeactivate(u.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Disattiva
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(u.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                          Attiva
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
                      >
                        Elimina
                      </button>
                    </div>
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
