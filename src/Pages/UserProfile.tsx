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

        // Salvo email utente per sincronizzare la TopBarHome
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
        },
        body: formPayload,
      });
      if (!res.ok) throw new Error("Errore nel salvataggio");
      const updated = await res.json();

      setUser(updated);
      setFormData(updated);

      // Salvo in localStorage dati specifici per utente email
      if (updated.email) {
        localStorage.setItem(`profileImage_${updated.email}`, updated.immagineProfilo || "");
        localStorage.setItem(`nome_${updated.email}`, updated.nome);
        localStorage.setItem(`cognome_${updated.email}`, updated.cognome);
        localStorage.setItem("userEmail", updated.email);
      }

      // Notifico TopBarHome di aggiornamento profilo
      window.dispatchEvent(new Event("profileUpdated"));

      setIsEditing(false);
      setPreviewImg(null);
      setImageFile(null);
      alert("Profilo aggiornato con successo!");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (error)
    return (
      <p
        style={{
          color: "red",
          textAlign: "center",
          marginTop: 20,
          fontFamily: "'Arial', sans-serif",
        }}
      >
        {error}
      </p>
    );
  if (!user)
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: 20,
          fontFamily: "'Arial', sans-serif",
        }}
      >
        Caricamento...
      </p>
    );

  const inputStyle = {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "none",
    background: isEditing
      ? "linear-gradient(90deg, #003f66, #66a7a3)"
      : "#f0f0f0",
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

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(90deg, #003f66, #66a7a3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        boxSizing: "border-box",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: "100%",
          padding: 20,
          borderRadius: 8,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          color: "white",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Il tuo profilo
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
            position: "relative",
          }}
        >
          <img
            src={previewImg || user.immagineProfilo || "/default-profile.png"}
            alt="Immagine Profilo"
            style={{
              width: 128,
              height: 128,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid white",
              display: "block",
            }}
          />
          {isEditing && (
            <>
              <input
                type="file"
                accept="image/*"
                id="upload-profile-image"
                onChange={handleImageChange}
                style={{
                  display: "none",
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
              <label
                htmlFor="upload-profile-image"
                style={{
                  cursor: "pointer",
                  color: "white",
                  width: 32,
                  height: 32,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: "50%",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
                title="Cambia immagine profilo"
              >
                <FaPencilAlt size={16} />
              </label>
            </>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Nome
          </label>
          <input
            value={user.nome}
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

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Cognome
          </label>
          <input
            value={user.cognome}
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

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            value={user.email}
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

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Nickname
          </label>
          <input
            name="nickname"
            value={formData.nickname || ""}
            onChange={handleChange}
            disabled={!isEditing}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Telefono
          </label>
          <input
            name="telefono"
            value={formData.telefono || ""}
            onChange={handleChange}
            disabled={!isEditing}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            disabled={!isEditing}
            rows={3}
            style={{
              ...inputStyle,
              resize: "none",
              height: 80,
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(user);
                  setPreviewImg(null);
                  setImageFile(null);
                  setError(null);
                }}
                style={{
                  ...buttonBaseStyle,
                  background: "#f44336", // rosso annulla
                }}
              >
                Annulla
              </button>
              <button onClick={handleSave} style={buttonBaseStyle}>
                Salva
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  ...buttonBaseStyle,
                  background: "#22c55e", // verde modifica
                }}
              >
                Modifica profilo
              </button>
              <button
                onClick={() => navigate("/home")}
                style={{
                  ...buttonBaseStyle,
                  background: "#6b7280", // grigio
                }}
              >
                Torna alla Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
