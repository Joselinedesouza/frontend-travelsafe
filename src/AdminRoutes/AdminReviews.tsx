import React, { useEffect, useState, useCallback } from "react";
import { fetchAllReviews, replyReview } from "../Service/Api";

type Review = {
  id: number;
  testo: string;
  voto: number;
  dataCreazione: string;
  autoreEmail: string;
  risposta?: string | null;
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const token = localStorage.getItem("token") || "";

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllReviews(token);

      const normalizedReviews = data.map(r => ({
        id: r.id,
        testo: r.testo || "",
        voto: typeof r.voto === "number" ? r.voto : 0,
        dataCreazione: typeof r.dataCreazione === "string"
          ? r.dataCreazione
          : (typeof r.data_creazione === "string" ? r.data_creazione : ""),
        autoreEmail: typeof r.autoreEmail === "string" ? r.autoreEmail : "Sconosciuto",
        risposta: typeof r.risposta === "string"
          ? r.risposta
          : (typeof r.testoRisposta === "string" ? r.testoRisposta : null),
      }));

      setReviews(normalizedReviews);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const startReply = (id: number, currentReply?: string | null) => {
    setReplyingId(id);
    setReplyText(currentReply || "");
  };

  const cancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyingId === null) return;
    try {
      await replyReview(replyingId, replyText, token);
      await loadReviews();
      cancelReply();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Errore durante l’invio della risposta");
    }
  };

  if (loading) return <p>Caricamento recensioni...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestione Recensioni (Admin)</h1>

      {reviews.length === 0 ? (
        <p>Nessuna recensione trovata.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left whitespace-nowrap">ID</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Autore</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Testo</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Voto</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Data</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Risposta Admin</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="bg-gray-50 even:bg-white">
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">{r.id}</td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">{r.autoreEmail}</td>
                  <td className="py-2 px-4 border border-gray-300 max-w-xs truncate">{r.testo}</td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">{r.voto}</td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">
                    {new Date(r.dataCreazione).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border border-gray-300 max-w-xs">
                    {r.risposta ? (
                      <p className="bg-teal-100 p-2 rounded break-words">{r.risposta}</p>
                    ) : (
                      <span className="italic text-gray-400">Nessuna risposta</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border border-gray-300 whitespace-nowrap">
                    {replyingId === r.id ? (
                      <form onSubmit={sendReply} className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded resize-y"
                          placeholder="Scrivi la tua risposta..."
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          >
                            Invia
                          </button>
                          <button
                            type="button"
                            onClick={cancelReply}
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                          >
                            Annulla
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => startReply(r.id, r.risposta)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Rispondi
                      </button>
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
