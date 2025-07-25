import { useEffect, useState } from "react";

type AdminInfo = {
  nome: string;
  cognome: string;
  email: string;
  ruolo: string;
};

export default function AdminProfileHeader() {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAdmin)
      .catch((err) => {
        console.error("Errore nel recupero profilo admin:", err);
      });
  }, []);

  if (!admin) return null;

  return (
    <div className="bg-blue-100 py-3 px-5 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">
           Bentornato, e buon lavoro!
          </h1>
          <p className="text-sm text-gray-600">
            {admin.nome} {admin.cognome} ·{" "}
            <span className="font-medium uppercase text-blue-600">
              {admin.ruolo}
            </span>
          </p>
          <p className="text-xs text-gray-500">{admin.email}</p>
        </div>
        <div>
          <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
            🟢 Online
          </span>
        </div>
      </div>

      {/* Riga sottile di separazione */}
      <div className="mt-3 border-t border-gray-200"></div>
    </div>
  );
}
