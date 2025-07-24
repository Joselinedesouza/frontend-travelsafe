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
    await loadUsers(); // Ricarica utenti dopo modifica
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
    await loadUsers(); // Ricarica utenti dopo modifica
  } catch (e) {
    alert(e instanceof Error ? e.message : "Errore riattivazione");
  }
}

async function handleDelete(id: number) {
  if (!window.confirm("Sei sicuro di voler eliminare l'utente?")) return;

  try {
    await deleteUser(id, token);
    alert("Utente eliminato.");
    await loadUsers(); // Ricarica utenti dopo cancellazione
  } catch (e) {
    alert(e instanceof Error ? e.message : "Errore eliminazione");
  }
}
  return (
  <div className="p-4 mt-6">
    <h1 className="text-2xl font-bold text-blue-900 mb-4">👥 Gestione Utenti</h1>

    {loading ? (
      <p className="text-gray-700">Caricamento utenti...</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-blue-100 text-blue-900 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Ruolo</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-blue-50 transition duration-150"
              >
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">{u.nome}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 uppercase text-sm text-gray-700">
                  {String(u.role)}
                </td>
                <td className="px-4 py-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    u.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {u.enabled ? "Attivo" : "Disattivo"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {u.enabled ? (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                      >
                        Disattiva
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(u.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                      >
                        Attiva
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs"
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
