import { useEffect, useState } from "react";

type Viaggio = {
  id: number;
  nome: string;
  cognome: string;
  email?: string;
  nomeStrutturaAlloggio?: string;
  motivoViaggio: string;
  telefonoCompleto?: string;
  numeroEmergenza?: string;
  numeroEmergenzaAlternativo?: string;
  latitudine?: number;
  longitudine?: number;
  dataRegistrazione?: string;
};

export function MyTrips() {
  const [viaggi, setViaggi] = useState<Viaggio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTrips() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trovato, esegui il login.");
      }
      const res = await fetch("http://localhost:8080/api/viaggi/mine", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMsg = "Errore nel caricamento dei viaggi";
        try {
          const errData = await res.json();
          if (errData?.message) errorMsg = errData.message;
        } catch {
          // Ignoro errore nel parsing
        }
        throw new Error(errorMsg);
      }

      const data: Viaggio[] = await res.json();
      console.log("Dati ricevuti:", data); // <--- Qui stampo i dati ricevuti
      setViaggi(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
      setViaggi([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTrip(id: number) {
    if (!window.confirm("Sei sicuro di voler eliminare questo viaggio?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Devi effettuare il login.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/viaggi/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Errore durante la cancellazione");
      }

      // Aggiorna la lista rimuovendo il viaggio cancellato
      setViaggi((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Errore sconosciuto");
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  if (loading) return <p>Caricamento viaggi...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">I miei viaggi</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-200 text-red-800 rounded">
          <p>{error}</p>
          <button
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => fetchTrips()}
          >
            Riprova
          </button>
        </div>
      )}

      {!error && viaggi.length === 0 && (
        <p className="italic">Non hai ancora registrato viaggi.</p>
      )}

      {!error && viaggi.length > 0 && (
        <ul className="space-y-4">
          {viaggi.map((v) => (
            <li
              key={v.id}
              className="border rounded p-4 shadow bg-white text-black"
            >
              <p>
                <strong>Nome:</strong> {v.nome} {v.cognome}
              </p>
              <p>
                <strong>Email:</strong> {v.email ?? "N/D"}
              </p>
              <p>
                <strong>Indirizzo alloggio:</strong> {v.nomeStrutturaAlloggio ?? "N/D"}
              </p>
              <p>
                <strong>Motivo viaggio:</strong> {v.motivoViaggio}
              </p>
              <p>
                <strong>Telefono:</strong> {v.telefonoCompleto ?? "N/D"}
              </p>
              <p>
                <strong>Numero emergenza personale:</strong> {v.numeroEmergenza ?? "N/D"}
              </p>
              {v.numeroEmergenzaAlternativo && (
                <p>
                  <strong>Numero emergenza alternativo:</strong> {v.numeroEmergenzaAlternativo}
                </p>
              )}
              <p>
                <strong>Data registrazione:</strong>{" "}
                {v.dataRegistrazione
                  ? new Date(v.dataRegistrazione).toLocaleString()
                  : "N/D"}
              </p>
              <button
                onClick={() => deleteTrip(v.id)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Elimina viaggio
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
