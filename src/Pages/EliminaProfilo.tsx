import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function EliminaProfilo() {
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState("");
  const navigate = useNavigate();

  async function handleDelete() {
  if (!motivo.trim()) {
    toast.error("Inserisci un motivo per l'eliminazione");
    return;
  }

  if (!window.confirm("Sei sicuro di voler eliminare definitivamente il tuo profilo?")) {
    return;
  }

  setLoading(true);
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:8080/api/users/me", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ motivo }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Errore durante la cancellazione");
    }

    toast.success("Profilo eliminato con successo.");

    // Aspetta 1.5 secondi prima di fare redirect
    setTimeout(() => {
      localStorage.clear();
      navigate("/login");
    }, 1500);

  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.error("Errore sconosciuto");
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-petrolio to-azzurrochiaro p-6">
      <ToastContainer />
      <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded shadow-md max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Elimina il mio profilo</h1>
        <p className="mb-6 text-gray-700">
          Questa azione è <strong>irreversibile</strong>. Tutti i tuoi dati saranno cancellati definitivamente.
        </p>

        <textarea
          className="w-full p-3 mb-6 border border-gray-300 rounded resize-none"
          placeholder="Scrivi qui il motivo dell'eliminazione..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={4}
          disabled={loading}
        />

        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Eliminazione in corso..." : "Elimina definitivamente"}
        </button>
      </div>
    </div>
  );
}
