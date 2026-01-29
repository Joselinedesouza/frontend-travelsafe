import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Img from "../assets/guidaesupporto.jpg"
type FaqItem = {
  question: string;
  answer: string;
};

export function GuidaSupporto() {
  const faqs: FaqItem[] = useMemo(
    () => [
      {
        question: "Come modifico il mio profilo?",
        answer:
          "Vai su Profilo e aggiorna nickname, telefono, bio e immagine. Ricorda di salvare prima di uscire.",
      },
      {
        question: "Non vedo i contenuti aggiornati: cosa posso fare?",
        answer:
          "Ricarica la pagina. Se il problema continua, fai logout/login. Su mobile può aiutare chiudere e riaprire l’app.",
      },
      {
        question: "Ho problemi con il login: come risolvo?",
        answer:
          "Controlla email/password (attenzione a spazi e maiuscole). Se usi l’autocompilazione, riscrivi la password manualmente.",
      },
      {
        question: "L’immagine profilo non si carica: perché?",
        answer:
          "Prova un file JPG/PNG, riduci la dimensione e ripeti l’upload. Se sei su rete mobile, prova con il Wi-Fi.",
      },
    ],
    []
  );

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-petrolio to-azzurrochiaro px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8 rounded-2xl bg-white/85 p-6 shadow-lg backdrop-blur-md">
          <h1 className="text-3xl font-bold text-gray-900">Guida e Supporto</h1>
          <p className="mt-2 text-gray-700">
            Trova rapidamente risposte, risolvi problemi comuni e contatta il supporto se hai bisogno.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#faq"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              FAQ
            </a>
            <a
              href="#problemi"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Problemi comuni
            </a>
            <a
              href="#account"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Account
            </a>
            <a
              href="#contatti"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Contatti
            </a>
          </div>
        </header>

        <main className="space-y-6">
<section id="faq" className="rounded-2xl bg-white/85 p-6 shadow-lg backdrop-blur-md">
  <div className="grid gap-8 md:grid-cols-[320px_1fr] md:items-stretch">
  
    <div className="h-full">
      <img
        className="h-full w-full rounded-xl object-cover shadow-sm"
        src={Img}
        alt="Supporto e guida"
        loading="lazy"
      />
    </div>
    <div className="min-h-full">
      <p className="text-sm font-medium text-indigo-600">FAQ</p>
      <h2 className="mt-1 text-3xl font-semibold text-gray-900">Cerchi una risposta?</h2>
      <p className="mt-2 text-sm text-slate-500">
        Qui trovi le risposte più frequenti. Se non basta, scrivi al supporto con i dettagli del problema.
      </p>

      <div className="mt-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question} className="border-b border-slate-200 py-4">
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-base font-medium text-gray-900">{faq.question}</h3>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                >
                  <path
                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                    stroke="#1D293D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p
                  className={`max-w-md pt-3 text-sm text-slate-500 ${
                    isOpen ? "translate-y-0" : "-translate-y-1"
                  } transition-transform duration-300`}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</section>

          {/* Problemi comuni */}
          <section id="problemi" className="rounded-2xl bg-white/85 p-6 shadow-lg backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-gray-900">Problemi comuni</h2>
            <p className="mt-1 text-sm text-gray-600">Piccoli controlli che risolvono la maggior parte dei casi.</p>

            <ul className="mt-5 space-y-3">
              <li className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-900">Login non riuscito</p>
                <p className="mt-1 text-gray-700">
                  Verifica email/password, controlla che non ci siano spazi e prova di nuovo. Se usi l’autocompilazione,
                  riscrivi manualmente la password.
                </p>
              </li>

              <li className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-900">Immagine profilo non si carica</p>
                <p className="mt-1 text-gray-700">
                  Prova un formato comune (JPG/PNG), riduci la dimensione del file e ripeti l’upload. Se sei su rete
                  mobile, prova il Wi-Fi.
                </p>
              </li>

              <li className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-900">L’app è lenta o si blocca</p>
                <p className="mt-1 text-gray-700">
                  Ricarica la pagina, chiudi tab inutili e verifica la connessione. Se succede sempre in una specifica
                  schermata, segnala al supporto cosa stavi facendo.
                </p>
              </li>
            </ul>
          </section>

          {/* Account */}
          <section id="account" className="rounded-2xl bg-white/85 p-6 shadow-lg backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-gray-900">Gestione account</h2>
            <p className="mt-1 text-sm text-gray-600">Gestisci in modo sicuro i tuoi dati e le azioni sensibili.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-gray-900">Aggiorna dati</h3>
                <p className="mt-2 text-gray-700">
                  Modifica nickname, telefono e bio dal tuo profilo. Mantieni i dati aggiornati per una migliore
                  esperienza.
                </p>
                <div className="mt-4">
                  <Link
                    to="/profilo"
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Vai al profilo
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-red-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-gray-900">Elimina account</h3>
                <p className="mt-2 text-gray-700">
                  Azione definitiva. Dopo l’eliminazione potresti perdere dati e contenuti associati al tuo profilo.
                </p>
                <div className="mt-4">
                  <Link
                    to="/elimina-profilo"
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Elimina account
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-700">
                Suggerimento: prima di eliminare l’account, fai uno screenshot delle informazioni importanti o salva
                quello che ti serve.
              </p>
            </div>
          </section>

          {/* Contatti */}
          <section id="contatti" className="rounded-2xl bg-white/85 p-6 shadow-lg backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-gray-900">Contatta il supporto</h2>
            <p className="mt-1 text-sm text-gray-600">
              Se il problema continua, scrivi indicando: email account, dispositivo, cosa stavi facendo e (se possibile)
              uno screenshot.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="font-semibold text-gray-900">Email</p>
                <p className="mt-2 text-gray-700">
                  <a
                    href="mailto:safetravel130@gmail.com?subject=Supporto%20App%20-%20Richiesta%20aiuto"
                    className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                  >
                    safetravel130@gmail.com
                  </a>
                </p>
                <p className="mt-2 text-sm text-gray-600">Risposta tipica: entro 24–48h lavorative.</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="font-semibold text-gray-900">Prima di scrivere</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                  <li>Hai provato a fare logout/login?</li>
                  <li>Hai ricaricato la pagina?</li>
                  <li>Connessione stabile (Wi-Fi o rete mobile)?</li>
                  <li>Il problema è riproducibile? (passi)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-700">Nota privacy: non inviare password o dati sensibili via email.</p>
            </div>
          </section>
        </main>

        <footer className="mt-8 text-center text-sm text-white/90">
          <p className="drop-shadow">© {new Date().getFullYear()} TravelSafe — Guida & Supporto</p>
        </footer>
      </div>
    </div>
  );
}
