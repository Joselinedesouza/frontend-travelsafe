🚀 TravelSafe - Web Application

📖 Descrizione
TravelSafe è un'applicazione web full-stack pensata per aiutare i turisti a muoversi in sicurezza, fornendo informazioni sulle zone a rischio, recensioni, e registrazione dei viaggi con supporto alle emergenze.

🛠️ Tecnologie utilizzate
Backend
Java 21 con Spring Boot 3.5.3

Spring Security con JWT e OAuth2 Client (Google login)

Spring Data JPA con PostgreSQL

Validation per validazione dati

Spring WebSocket con STOMP e SockJS per notifiche in tempo reale

SpringDoc OpenAPI per documentazione API interattiva

Cloudinary per upload e gestione immagini

MapStruct (se usato) per mappature DTO

Lombok per ridurre boilerplate

Spring Mail per invio email (es. reset password)

DevTools per reload automatico in sviluppo

Test con Spring Boot Starter Test e Security Test

---

🔥 Funzionalità principali
Autenticazione: login, registrazione, reset password, login con Google OAuth2

Gestione utenti: visualizzazione, attivazione/disattivazione, cancellazione

Zone a rischio: visualizzazione su mappa, ricerca per posizione, creazione/modifica/eliminazione

Recensioni: creazione, modifica, cancellazione e risposta da parte admin

Notifiche: ricezione in tempo reale tramite WebSocket con SockJS e STOMP

Registrazione viaggi: form con geolocalizzazione e mappa interattiva

Upload immagini profilo tramite Cloudinary

Documentazione API con OpenAPI UI

---

Frontend
React.js + TypeScript

React Router per routing SPA

Leaflet con OpenStreetMap per mappe interattive

React Phone Input per gestione numeri di telefono

Tailwind CSS per styling moderno e responsive

API REST per comunicazione con backend

WebSocket per notifiche in tempo reale

---

💻 Funzionamento Frontend

Il frontend di TravelSafe è una Single Page Application (SPA) realizzata con React.js e TypeScript, pensata per offrire un’esperienza utente fluida, intuitiva e reattiva.

Architettura e struttura
Routing: gestito con React Router, consente di navigare tra le pagine senza ricaricare l’intera app. Le pagine principali includono: Home, Registrazione Viaggio, Gestione Recensioni, Profilo Utente, Login/Registrazione/Reset Password.

Componenti: l’app è suddivisa in componenti modulari e riutilizzabili, organizzati nelle cartelle /Pages e /components per facilitare manutenzione e scalabilità.

Styling: utilizzo di Tailwind CSS per uno stile moderno, coerente e mobile-first, con gestione dinamica di temi e gradienti.

Funzionalità principali
Autenticazione: login e registrazione tramite form, con integrazione Google OAuth2 per accesso rapido. Lo stato di autenticazione è gestito con Context API e token JWT salvato in localStorage.

Gestione Viaggi: form con campi dinamici e autocomplete geolocalizzato tramite API Nominatim, mappa interattiva con Leaflet per selezione e visualizzazione.

Zone a Rischio: visualizzazione interattiva di zone geolocalizzate a rischio tramite cerchi colorati su mappa Leaflet, con ricerca città autocomplete.

Recensioni: inserimento, modifica, cancellazione recensioni con rating a stelle; possibilità per admin di rispondere alle recensioni.

Profilo Utente: visualizzazione e modifica dati profilo, upload e anteprima immagini integrate con backend tramite Cloudinary.

Notifiche in tempo reale: connessione WebSocket (SockJS + STOMP) per ricevere notifiche push senza ricaricare la pagina.

Comunicazione con backend
Tutte le chiamate API REST sono gestite tramite funzioni dedicate in /Service, che gestiscono token JWT, autorizzazioni e errori in modo centralizzato.

⚙️ Setup e configurazione
Backend
Assicurati di avere Java 21 e Maven installati

Configura il database PostgreSQL e aggiorna application.properties o application.yml con le tue credenziali

Imposta variabili ambiente per Cloudinary e email (se usi)

Esegui:

bash
Copia
mvn clean install
mvn spring-boot:run
L'API sarà disponibile di default su http://localhost:8080

Frontend
Assicurati di avere Node.js e npm installati

Esegui:

bash
Copia
npm install
npm run dev
L'app frontend sarà disponibile su http://localhost:5173 (Vite default)

📞 Contatti
Creato da Joseline De Souza

GitHub https://github.com/Joselinedesouza/frontend-travelsafe

GitHub Backend (aggiungi se esiste)

🤝 Ringraziamenti
Grazie a tutti i progetti open source e alle community che hanno reso possibile questo sviluppo! 🙌
