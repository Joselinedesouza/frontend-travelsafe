import { FaInstagram, FaFacebookSquare } from "react-icons/fa";

export default function ChiSiamo() {
  return (
    <div className="min-h-screen bg-[#cce6f4] flex flex-col items-center justify-center px-4 py-12 text-[#0B3D3B]">
      {/* Contenuto */}
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Chi siamo</h1>

       <p className="text-base sm:text-lg leading-relaxed">
  TravelSafe nasce dalla passione per i viaggi e dalla volontà di rendere ogni esperienza più sicura e consapevole.  
  Sono Joseline De Souza, sviluppatrice alle prime armi e appassionata di viaggi; ho creato questa app per aiutarti a esplorare il mondo con serenità,  
  offrendo informazioni aggiornate, recensioni e strumenti utili per muoverti in sicurezza.  
  <br />
  <strong>La tua sicurezza è il mio viaggio.</strong>
</p>

        {/* Card Social */}
        <div className="bg-[#f5f5dc] p-6 rounded-xl shadow-md text-center text-[#0B3D3B] space-y-4">
          <h2 className="text-xl font-semibold">Seguimi sui social</h2>
          <div className="flex justify-center gap-6 text-3xl">
            <a
              href="https://www.instagram.com/desouzajoseline15_"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=dsjoseline"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 transition"
              aria-label="Facebook"
            >
              <FaFacebookSquare />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
