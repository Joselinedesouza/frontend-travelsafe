import { useState } from "react";
import { Link } from "react-router-dom";

type News = {
  title: string;
  description: string;
  url: string;
  sourceName: string;
  publishedAt: string;
};

export default function NewsByCity() {
  const [city, setCity] = useState("");
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchNews() {
    if (!city.trim()) {
      setError("Inserisci il nome di una città");
      setNews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8080/api/news?city=${encodeURIComponent(city)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        let message = "Errore nel recupero delle notizie";
        try {
          const data = await res.json();
          message = data.message || message;
        } catch {
          // ignore json parse errors
        }
        throw new Error(message);
      }

      const data: News[] = await res.json();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #003f66, #66a7a3)",
        minHeight: "100vh",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        className="max-w-4xl w-full rounded-md p-6 mt-20"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">News Città</h1>
          <Link
            to="/home"
            className="w-max px-4 py-2 rounded-md font-bold text-white transition-colors duration-300"
            style={{ backgroundColor: "#003f66" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
          >
            Torna alla Home
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Inserisci nome città"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchNews();
            }}
            className="flex-grow p-2 rounded border border-white bg-[#003f66] text-white focus:outline-none focus:ring-2 focus:ring-[#66a7a3]"
            style={{ transition: "background-color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
          />
          <button
            onClick={fetchNews}
            disabled={loading}
            className="w-max px-4 py-2 rounded-md font-bold text-white transition-colors duration-300"
            style={{ backgroundColor: "#003f66" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#66a7a3")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "#003f66")}
          >
            Cerca
          </button>
        </div>

        {loading && (
          <p className="text-center text-white font-semibold mb-4">Caricamento notizie...</p>
        )}

        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

        <div
          className="space-y-4 scroll-hidden"
          style={{ maxHeight: "calc(100vh - 250px)", overflowY: "scroll" }}
        >
          {news.length === 0 && !loading && (
            <p className="text-center text-white/70">Nessuna notizia trovata.</p>
          )}

          {news.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-md shadow-md transition-shadow"
              style={{
                backgroundColor: "#003f66",
                color: "white",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#66a7a3";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#003f66";
              }}
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-semibold hover:underline"
                style={{ color: "inherit" }}
              >
                {item.title}
              </a>
              <p className="mt-2">{item.description}</p>
              <div className="flex justify-between mt-3 text-sm text-gray-300">
                <span>{item.sourceName}</span>
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
