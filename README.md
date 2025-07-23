🚀 TravelSafe - Web Application
Backend GitHub repository:
https://github.com/Joselinedesouza/travelsafebackend

📖 Descrizione
TravelSafe è un'applicazione web full-stack che ho creato per aiutare i turisti a muoversi in sicurezza, fornendo informazioni sulle zone a rischio, recensioni e la registrazione dei viaggi con supporto alle emergenze. Ho deciso di realizzare questa app perché più volte mi sono trovata in situazioni in cui non sapevo esattamente dove fossi e provavo una forte sensazione di insicurezza e paura nel viaggiare da sola.

Spero che questa applicazione possa tornare utile a chi viaggia spesso, sia per lavoro che per passione e curiosità. Da oggi, tutti noi potremo viaggiare con una sicurezza in più, affrontando ogni esperienza con maggiore consapevolezza.

Che il tuo prossimo viaggio sia sempre una splendida avventura, con TravelSafe al tuo fianco per proteggerti, e tu libero di vivere ogni istante in modo unico e indimenticabile.

🛠️ Tecnologie utilizzate
Backend
Java 21 con Spring Boot 3.5.3

Spring Security con JWT e OAuth2 Client (login Google)

Spring Data JPA con PostgreSQL

Validation per la validazione dati

Spring WebSocket con STOMP e SockJS per notifiche in tempo reale

SpringDoc OpenAPI per documentazione API interattiva

Cloudinary per upload e gestione immagini

MapStruct (se usato) per mappature DTO

Lombok per ridurre boilerplate

Spring Mail per invio email (es. reset password)

DevTools per reload automatico in sviluppo

Test con Spring Boot Starter Test e Security Test

Frontend
React.js + TypeScript

React Router per routing SPA

Leaflet con OpenStreetMap per mappe interattive

React Phone Input per gestione numeri di telefono

Tailwind CSS per styling moderno e responsive

API REST per comunicazione con backend

WebSocket per notifiche in tempo reale

💻 Funzionamento Frontend
Ho realizzato il frontend come Single Page Application (SPA) con React.js e TypeScript, pensata per offrire un’esperienza utente fluida, intuitiva e reattiva.

Architettura e struttura:

Routing con React Router, per navigare tra le pagine senza ricaricare l’intera app.

Componenti modulari e riutilizzabili organizzati nelle cartelle /Pages e /components.

Styling moderno e responsive con Tailwind CSS, mobile-first, con gestione dinamica di temi e gradienti.

Funzionalità principali:

Autenticazione: login e registrazione tramite form, con integrazione Google OAuth2 per accesso rapido. Stato di autenticazione gestito con Context API e token JWT salvato in localStorage.

Gestione Viaggi: form con campi dinamici e autocomplete geolocalizzato tramite API Nominatim, mappa interattiva con Leaflet.

Zone a Rischio: visualizzazione interattiva di zone geolocalizzate a rischio tramite cerchi colorati su mappa Leaflet, con ricerca città autocomplete.

Recensioni: inserimento, modifica, cancellazione recensioni con rating a stelle; possibilità per admin di rispondere alle recensioni.

Profilo Utente: visualizzazione e modifica dati profilo, upload e anteprima immagini integrate con backend tramite Cloudinary.

Notifiche in tempo reale: connessione WebSocket (SockJS + STOMP) per ricevere notifiche push senza ricaricare la pagina.

📞 Contatti
Creato da Joseline De Souza
Email: joselinedesouza@gmail.com
Tel: +39 371 359 4430

GitHub frontend: https://github.com/Joselinedesouza/frontend-travelsafe
GitHub backend: https://github.com/Joselinedesouza/travelsafebackend
