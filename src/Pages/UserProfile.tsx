import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";

type UserProfile = {
  nome: string;
  cognome: string;
  email: string;
  nickname: string;
  telefono?: string;
  bio?: string;
  immagineProfilo?: string;
};

export function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Non sei autenticato");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento profilo");
        return res.json();
      })
      .then((data: UserProfile) => {
        setUser(data);
        setFormData(data);
        if (data.email) {
          localStorage.setItem("userEmail", data.email);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Seleziona un file immagine valido");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewImg(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!formData.nickname) {
      alert("Il nickname è obbligatorio");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Non sei autenticato");
      return;
    }

    setIsSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("nickname", formData.nickname || "");
      if (formData.telefono) formPayload.append("telefono", formData.telefono);
      if (formData.bio) formPayload.append("bio", formData.bio);
      if (imageFile) formPayload.append("immagineProfilo", imageFile);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ non forzare Content-Type
        },
        body: formPayload,
      });

      if (!res.ok) throw new Error("Errore nel salvataggio");
      const updated = await res.json();

      setUser(updated);
      setFormData(updated);
      setPreviewImg(null);
      setImageFile(null);

      if (updated.email) {
        localStorage.setItem(`profileImage_${updated.email}`, updated.immagineProfilo || "");
        localStorage.setItem(`nome_${updated.email}`, updated.nome);
        localStorage.setItem(`cognome_${updated.email}`, updated.cognome);
        localStorage.setItem("userEmail", updated.email);
      }

      window.dispatchEvent(new Event("profileUpdated"));
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "none",
    background: isEditing ? "linear-gradient(90deg, #003f66, #66a7a3)" : "#f0f0f0",
    color: isEditing ? "white" : "#666",
    fontWeight: isEditing ? "600" : "normal",
  };

  const buttonBaseStyle = {
    padding: "10px 18px",
    borderRadius: 6,
    border: "none",
    background: "linear-gradient(90deg, #003f66, #66a7a3)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  };

  if (error)
    return <p style={{ color: "red", textAlign: "center", marginTop: 20 }}>{error}</p>;

  if (!user)
    return <p style={{ textAlign: "center", marginTop: 20 }}>Caricamento...</p>;

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(90deg, #003f66, #66a7a3)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      boxSizing: "border-box",
      fontFamily: "'Arial', sans-serif",
    }}>
      <div style={{
        maxWidth: 600,
        width: "100%",
        padding: 20,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        color: "white",
        backdropFilter: "blur(10px)",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Il tuo profilo</h2>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <img
            src={previewImg || user.immagineProfilo || "/default-profile.png"}
            alt="Immagine Profilo"
            style={{ width: 128, height: 128, borderRadius: "50%", objectFit: "cover", border: "2px solid white" }}
          />

          {isEditing && (
            <div style={{ marginTop: 12, width: "100%" }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                Cambia immagine profilo
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                style={{
                  padding: 8,
                  width: "100%",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  color: "#000",
                }}
              />
            </div>
          )}
        </div>

        {/* Campi utente */}
        {["nome", "cognome", "email"].map((key) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <input
              value={(user as any)[key]}
              disabled
              style={{
                ...inputStyle,
                background: "#f0f0f0",
                color: "#666",
                fontWeight: "normal",
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Nickname</label>
          <input
            name="nickname"
            value={formData.nickname || ""}
            onChange={handleChange}
            disabled={!isEditing}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Telefono</label>
          <input
            name="telefono"
            value={formData.telefono || ""}
            onChange={handleChange}
            disabled={!isEditing}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 600 }}>Bio</label>
          <textarea
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            disabled={!isEditing}
            rows={3}
            style={{ ...inputStyle, resize: "none", height: 80 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(user!);
                  setPreviewImg(null);
                  setImageFile(null);
                }}
                style={{ ...buttonBaseStyle, background: "#f44336" }}
                disabled={isSaving}
              >
                Annulla
              </button>
              <button onClick={handleSave} style={buttonBaseStyle} disabled={isSaving}>
                {isSaving ? "Salvataggio..." : "Salva"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} style={{ ...buttonBaseStyle, background: "#22c55e" }}>
                Modifica profilo
              </button>
              <button onClick={() => navigate("/home")} style={{ ...buttonBaseStyle, background: "#6b7280" }}>
                Torna alla Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
