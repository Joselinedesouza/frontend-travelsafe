import { useState, useEffect } from "react";

interface Note {
  id: number;
  text: string;
  email: string;
  createdAt: string;
}

function AdminNotes() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("adminNotes");
    return saved ? JSON.parse(saved) : [];
  });

  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminNotes", JSON.stringify(notes));
  }, [notes]);

  function handleSave() {
    if (noteText.trim().length === 0 || !userEmail) return;

    const newNote: Note = {
      id: Date.now(),
      text: noteText.trim(),
      email: userEmail,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setNoteText("");
  }

 return (
  <div className="max-w-4xl mx-auto p-4 sm:p-6
                  pl-14 sm:pl-0
                  relative"
       style={{ minHeight: "100vh" }}
  >
    <h2 className="mb-4 text-2xl font-semibold text-gray-800">Note per Admin</h2>

    <textarea
      className="w-full h-28 p-3 text-base resize-y rounded border border-gray-300
                 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      placeholder="Lascia qui le tue note per gli altri amministratori..."
      value={noteText}
      onChange={(e) => setNoteText(e.target.value)}
    />
    <button
      onClick={handleSave}
      disabled={!userEmail || noteText.trim().length === 0}
      className="mt-3 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded
                 hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
    >
      Salva Nota
    </button>

    <div className="mt-8 space-y-6">
      {notes.length === 0 && (
        <p className="text-center text-gray-500">Nessuna nota salvata.</p>
      )}
      {notes.map((note) => (
        <div
          key={note.id}
          className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
        >
          <p className="whitespace-pre-wrap mb-3 text-gray-900">{note.text}</p>
          <small className="text-gray-500 block text-right">
            Scritto da <strong>{note.email}</strong> il{" "}
            {new Date(note.createdAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  </div>
);
}

export default AdminNotes;
