import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Review = {
  id: number;
  cittaId: number;
  cittaNome: string;
  testo: string;
  voto: number;
  dataCreazione: string;
  autoreEmail: string;
};

type NewReviewForm = {
  cittaId: number | null;
  testo: string;
  voto: number;
};

export default function Recensioni() {
  const navigate = useNavigate();
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterCityId, setFilterCityId] = useState<number | "">("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newReview, setNewReview] = useState<NewReviewForm>({
    cittaId: null,
    testo: "",
    voto: 5,
  });

  useEffect(() => {
    fetchCities();
    fetchAllReviews();
    fetchMyReviews();
  }, []);

  async function fetchCities() {
    try {
      const res = await fetch("/api/citta", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Errore caricamento città");
      const data = await res.json();
      setCities(data);
    } catch {
      setError("Errore caricamento città");
    }
  }

  async function fetchAllReviews() {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Errore caricamento recensioni");
      const data = await res.json();
      setAllReviews(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    }
    setLoading(false);
  }

  async function fetchMyReviews() {
    try {
      const res = await fetch("/api/reviews/mine", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Errore caricamento recensioni personali");
      const data = await res.json();
      setMyReviews(data);
    } catch {
      setError("Errore caricamento recensioni personali");
    }
  }

  function startEdit(review: Review) {
    setEditingId(review.id);
    setNewReview({
      cittaId: review.cittaId,
      testo: review.testo,
      voto: review.voto,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setNewReview({ cittaId: null, testo: "", voto: 5 });
    setError(null);
  }

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newReview.cittaId) {
      setError("Seleziona una città");
      return;
    }
    setError(null);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/reviews/${editingId}` : "/api/reviews";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newReview),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Errore durante l'operazione");
      }

      cancelEdit();
      fetchAllReviews();
      fetchMyReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Sei sicuro di voler cancellare questa recensione?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Errore durante la cancellazione");
      fetchAllReviews();
      fetchMyReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    }
  }

  const filteredReviews = filterCityId
    ? allReviews.filter((r) => r.cittaId === filterCityId)
    : allReviews;

  const StarRating = ({
    rating,
    onChange,
  }: {
    rating: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex space-x-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => onChange(star)}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= rating ? "#ffd700" : "none"}
          stroke="#ffd700"
          strokeWidth={1.5}
          className="w-6 h-6"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );

  function addHoverFocusStyles(
    e:
      | React.MouseEvent<HTMLButtonElement | HTMLSelectElement | HTMLInputElement>
      | React.FocusEvent<HTMLButtonElement | HTMLSelectElement | HTMLInputElement>,
    enterColor = "#66a7a3",
    leaveColor = "#003f66"
  ) {
    (e.currentTarget as HTMLElement).style.backgroundColor =
      e.type === "mouseenter" || e.type === "focus" ? enterColor : leaveColor;
  }

  return (
    <div
      className="min-h-screen p-6 text-[#e0f2f1]"
      style={{ background: "linear-gradient(90deg, #003f66, #66a7a3)" }}
    >
      <header className="flex justify-end mb-6">
        <Link
          to="/home"
          className="text-[#e0f2f1] font-semibold underline hover:text-[#80cbc4]"
        >
          Torna alla Home
        </Link>
      </header>

      <div
        className="max-w-4xl mx-auto rounded-md mt-8 shadow-lg p-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Recensioni</h1>

        <div className="mb-6">
          <label className="block mb-2 font-semibold">Filtra recensioni per città:</label>
          <select
            value={filterCityId}
            onChange={(e) =>
              setFilterCityId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="p-2 rounded text-[#e0f2f1] border border-white"
            style={{ backgroundColor: "#003f66", transition: "background-color 0.3s" }}
            onMouseEnter={addHoverFocusStyles}
            onMouseLeave={addHoverFocusStyles}
            onFocus={addHoverFocusStyles}
            onBlur={addHoverFocusStyles}
          >
            <option value="">Tutte le città</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-semibold mb-4">Recensioni di tutti</h2>
        {loading && <p>Caricamento...</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {filteredReviews.length === 0 && !loading && (
          <p className="mb-8 text-center">Nessuna recensione disponibile.</p>
        )}

        <ul className="mb-8 space-y-4 max-h-[300px] overflow-y-auto scroll-hidden border border-white rounded-md p-2">
          {filteredReviews.map((r) => (
            <li
              key={r.id}
              className="p-4 border rounded bg-[#003f66] shadow flex flex-col border-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-xl">{r.cittaNome}</h3>
                <StarRating rating={r.voto} onChange={() => {}} />
              </div>
              <p className="italic text-gray-300 mb-2">{r.testo}</p>
              <small className="text-gray-400">
                {new Date(r.dataCreazione).toLocaleDateString()}
              </small>
              <small className="text-gray-400 italic"> - da: {r.autoreEmail}</small>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mb-4">Le mie recensioni</h2>
        {myReviews.length === 0 && !loading && (
          <p className="mb-8 text-center">Non hai ancora lasciato recensioni.</p>
        )}

        <ul className="mb-8 space-y-4 max-h-[300px] overflow-y-auto scroll-hidden border border-white rounded-md p-2">
          {myReviews.map((r) => (
            <li
              key={r.id}
              className="p-4 border rounded bg-[#003f66] shadow flex flex-col border-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-xl">{r.cittaNome}</h3>
                <StarRating rating={r.voto} onChange={() => {}} />
              </div>
              <p className="italic text-gray-300 mb-2">{r.testo}</p>
              <small className="text-gray-400">
                {new Date(r.dataCreazione).toLocaleDateString()}
              </small>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => startEdit(r)}
                  className="px-3 py-1 rounded"
                  style={{
                    backgroundColor: "#80cbc4",
                    color: "#003f66",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a6d6d1")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#80cbc4")}
                  onFocus={(e) => (e.currentTarget.style.backgroundColor = "#a6d6d1")}
                  onBlur={(e) => (e.currentTarget.style.backgroundColor = "#80cbc4")}
                >
                  Modifica
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-3 py-1 rounded"
                  style={{
                    backgroundColor: "#80cbc4",
                    color: "#003f66",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a6d6d1")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#80cbc4")}
                  onFocus={(e) => (e.currentTarget.style.backgroundColor = "#a6d6d1")}
                  onBlur={(e) => (e.currentTarget.style.backgroundColor = "#80cbc4")}
                >
                  Elimina
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Form inserimento/modifica recensione */}
        <form
          onSubmit={handleCreateOrUpdate}
          className="bg-[#003f66] p-6 rounded shadow space-y-4 border border-white"
          style={{ backgroundColor: "rgba(0, 63, 102, 0.85)" }}
        >
          <h2 className="text-xl font-semibold">
            {editingId ? "Modifica recensione" : "Aggiungi nuova recensione"}
          </h2>

          <select
            value={newReview.cittaId ?? ""}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, cittaId: Number(e.target.value) }))
            }
            required
            className="w-full p-2 rounded text-[#e0f2f1] border border-white"
            style={{ backgroundColor: "#003f66", transition: "background-color 0.3s" }}
            onMouseEnter={addHoverFocusStyles}
            onMouseLeave={addHoverFocusStyles}
            onFocus={addHoverFocusStyles}
            onBlur={addHoverFocusStyles}
          >
            <option value="" disabled>
              Seleziona città
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <textarea
            value={newReview.testo}
            onChange={(e) => setNewReview((prev) => ({ ...prev, testo: e.target.value }))}
            required
            placeholder="Scrivi la tua recensione"
            className="w-full p-2 rounded text-[#e0f2f1] border border-white h-24"
            style={{ backgroundColor: "#003f66" }}
          />

          <label className="block text-white">
            Voto:{" "}
            <StarRating
              rating={newReview.voto}
              onChange={(val) => setNewReview((prev) => ({ ...prev, voto: val }))}
            />
          </label>

          <div className="flex justify-between space-x-2">
            <button
              type="submit"
              className="transition-colors px-4 py-2 rounded font-bold text-[#003f66]"
              style={{
                background: "linear-gradient(90deg, #80cbc4, #66a7a3)",
                width: "auto",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #a6d6d1, #80cbc4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #80cbc4, #66a7a3)")
              }
              onFocus={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #a6d6d1, #80cbc4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #80cbc4, #66a7a3)")
              }
            >
              {editingId ? "Aggiorna recensione" : "Invia recensione"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="transition-colors px-4 py-2 rounded font-bold text-[#003f66]"
              style={{
                background: "linear-gradient(90deg, #80cbc4, #66a7a3)",
                width: "auto",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #a6d6d1, #80cbc4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #80cbc4, #66a7a3)")
              }
              onFocus={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #a6d6d1, #80cbc4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #80cbc4, #66a7a3)")
              }
            >
              Torna alla Home
            </button>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="transition-colors mt-2 px-4 py-2 rounded font-bold text-[#003f66]"
              style={{
                background: "linear-gradient(90deg, #80cbc4, #66a7a3)",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #a6d6d1, #80cbc4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #80cbc4, #66a7a3)")
              }
              onFocus={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #a6d6d1, #80cbc4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.background = "linear-gradient(90deg, #80cbc4, #66a7a3)")
              }
            >
              Annulla
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
