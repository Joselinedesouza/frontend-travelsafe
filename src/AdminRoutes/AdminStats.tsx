import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ZonaPerCittaStat = {
  nomeCitta: string;
  totaleZone: number;
  livelloPericolo: "BASSO" | "MEDIO" | "ALTO";
};

const COLOR_MAP: Record<ZonaPerCittaStat["livelloPericolo"], string> = {
  BASSO: "#fde68a",
  MEDIO: "#fdba74",
  ALTO: "#fca5a5",
};

export default function AdminStats() {
  const [stats, setStats] = useState<ZonaPerCittaStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/api/zone-rischi/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel recupero delle statistiche");
        return res.json();
      })
      .then((data: ZonaPerCittaStat[]) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Errore statistiche:", err);
        setError("Errore nel recupero dati");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Caricamento statistiche...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-blue-100 p-4 rounded-xl shadow-sm max-w-3xl mx-auto space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">
        📊 Zone di rischio per città
      </h2>

      <div className="w-full">
        <div style={{ minWidth: 500, height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats}
              margin={{ top: 10, right: 30, left: 10, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nomeCitta"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fill: "#4b5563", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#f9fafb", borderRadius: 8 }}
              />
              <Bar dataKey="totaleZone" radius={[4, 4, 0, 0]}>
                {stats.map((item, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLOR_MAP[item.livelloPericolo]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-1 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#fde68a]"></span> Basso
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#fdba74]"></span> Medio
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#fca5a5]"></span> Alto
        </div>
      </div>
    </div>
  );
}
