import { Link } from "react-router-dom";

export function GuidaSupporto() {
  return (
    <div
      className="min-h-screen bg-gradient-to-r from-petrolio to-azzurrochiaro flex items-center justify-center p-4"
      style={{ backgroundBlendMode: "multiply" }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg max-w-3xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Guida e Supporto</h1>
        <p className="mb-6 text-gray-700">
          Benvenuto nella pagina di guida e supporto. Qui troverai informazioni utili per usare l'app e risolvere problemi comuni.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Gestione utenti</h2>
        <p className="mb-6 text-gray-700">
          Per eliminare il tuo account, schiaccia questo pulsante{" "}
          <Link to="/elimina-profilo" className="font-semibold text-blue-600 underline hover:text-blue-800">
            “Elimina”
          </Link>.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contatti supporto</h2>
        <p className="mb-6 text-gray-700">
          In caso di problemi contatta{" "}
          <a href="mailto:Joselinedesouza022@gmail.com" className="text-blue-600 underline hover:text-blue-800">
            Joselinedesouza022@gmail.com
          </a>.
        </p>

      </div>
    </div>
  );
}
