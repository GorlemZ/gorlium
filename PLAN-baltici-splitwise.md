# Baltici — Splitwise light dentro Gorlium

> Obiettivo: una versione **leggera di Splitwise** per regolare i conti durante una
> vacanza tra 8 persone (tu + 7 amici). Vive come nuova "area" **`baltici`** del hub,
> rimpiazzando la tile disabilitata **`maglia` / "Knitting & Crochet"**.
>
> **Come usare questo documento:** ogni feature è una user story con un ID.
> Segna con `[x]` quelle che vuoi. Ci sono tre livelli suggeriti (MVP / Consigliate /
> Extra). Alla fine c'è una sezione **Decisioni aperte** da chiudere prima di implementare.

---

## ✅ Selezione finale (2026-07-19)

Feature confermate per l'implementazione:

**Gruppo & persone** — US-01 (crea gruppo), US-02 (aggiungi persone), US-03
(modifica/rimuovi persona), US-05 (avatar/colore). → **Un solo gruppo** (D2: no US-04).

**Spese** — US-10 (aggiungi spesa: importo/descrizione/pagante/data), US-11 (split
parti uguali), US-12 (split su sottoinsieme), US-13 (split per importi esatti).
→ **Nessun extra**: niente categorie, foto, multi-valuta, grafici, più paganti,
split % o per articoli.

**Saldi** — US-20 (saldo per persona: credito/debito), US-21 (chi-deve-a-chi), US-22
(semplificazione debiti), US-24 (totale vacanza + speso per persona). → **Solo
visualizzazione dello stato attuale**, derivato dalle spese: niente registrazione
pagamenti (**US-23 settle up esclusa** — i saldi si regolano tra le persone a fine
vacanza, fuori dall'app).

**Storico** — US-30 (lista spese, ordinabile per data), US-31 (aggiungi/modifica/rimuovi
spesa). → **US-32 (feed attività) esclusa**: ridondante con la lista spese.

**Dati** — US-40 (persistenza locale). → US-41/42/43 esclusi per ora; **D1
(architettura dati) rimandata**.

**Area (D5)** — nome **"Baltici"**, per ora **riuso `maglia.svg`** (icona dedicata dopo).

### ⚠️ Vincoli semantici confermati (importanti)

- **Nessun login / nessun "utente corrente" (D4: niente auth).** L'app non sa chi sta
  inserendo una spesa. → Il pagante va **sempre scelto esplicitamente** dalla lista
  (nessun default "Tu"); non esiste il concetto di "me". Chiunque apra l'app vede e
  modifica gli stessi dati.
- **I saldi sono solo derivati e in sola lettura.** Mostrano lo stato attuale
  (credito/debito per persona + chi-deve-a-chi semplificato). Non si registrano
  pagamenti nell'app.
- **Pagante incluso nella divisione, ma deselezionabile** (in "tutti" è incluso; in
  "sottogruppo" è pre-selezionato ma togglabile).
- **Arrotondamenti:** split calcolato in centesimi, lo scarto (1-2 cent) assegnato a una
  persona così la somma delle quote fa sempre esattamente il totale.

**Escluse:** US-04, US-14, US-15, US-16, US-17, US-23, US-32, US-33, US-41, US-42,
US-43, US-50, US-51, US-52, US-53, US-54.

> ⏸️ Resta aperta solo **D1** (dove vivono i dati) — vedi
> [Architettura dati (D1)](#architettura-dati-d1). Nota: senza login, con backend
> condiviso (D1-A/C) chiunque abbia il link vede/modifica i dati. Nota su US-32 (feed
> attività): senza "utente corrente" il feed è una cronologia delle spese
> aggiunte/rimosse (non "chi" le ha toccate).

---

## Contesto tecnico (dallo stato attuale del repo)

Cose importanti che condizionano lo scope:

- **Nessun backend, nessun database.** Oggi l'app è 100% front-end (Vite + React).
  L'unica chiamata di rete è il form contatti verso Telegram. → La persistenza dei
  dati è una **decisione da prendere** (vedi *Decisioni aperte* D1).
- **Nessuno stato globale** (no Redux/Zustand): solo `useState` locale. Per Baltici
  servirà introdurre un piccolo store (Context o libreria leggera).
- **Design system "brutalista"** già disponibile (`@gorlium/design-system`): `Stack`,
  `Card`, `Button`, `TextField`, `Form`, `Tabs`, `Badge`, `Header`, `Callout`… → le
  useremo per la UI delle pagine, come fa l'area *terrariums*.
- **i18n** tutto in inglese (`locales/en.json`). Le stringhe di Baltici andranno lì.
- La tile `maglia` è oggi **disabilitata** (`href: null`): basta ripuntarla a
  `/baltici` per attivare l'area.

---

## Legenda priorità

- 🟢 **MVP** — il minimo per regolare i conti della vacanza. Senza questo l'app non serve.
- 🟡 **Consigliata** — migliora molto l'esperienza, poco costo aggiuntivo.
- 🔵 **Extra** — bello da avere, ma opzionale / più costoso.

---

## 1. Gruppo & persone

- [x] **US-01** 🟢 Come utente, voglio **creare un gruppo** (es. "Vacanza Baltici 2026")
      con un nome, così tutte le spese vivono in un contesto.
- [x] **US-02** 🟢 Come utente, voglio **aggiungere le persone** del gruppo (i miei 7
      amici + me, con un nome ciascuno), così posso assegnare le spese.
- [x] **US-03** 🟡 Come utente, voglio **modificare/rimuovere una persona**, così correggo
      errori di battitura o chi si aggiunge/lascia in corsa.
- [ ] **US-04** 🔵 Come utente, voglio **più gruppi** (es. una vacanza diversa), così
      riuso l'app in futuro. *(Se no: un solo gruppo hardcoded, più semplice.)*
- [x] **US-05** 🔵 Come persona, voglio un **avatar/colore** per ognuno, così i conti
      si leggono a colpo d'occhio.

## 2. Registrare le spese

- [x] **US-10** 🟢 Come utente, voglio **aggiungere una spesa** con importo, descrizione,
      **chi ha pagato** e **data**, così la registro sul momento.
- [x] **US-11** 🟢 Come utente, voglio **dividere la spesa in parti uguali** tra tutti,
      così nel caso più comune non devo fare calcoli.
- [x] **US-12** 🟢 Come utente, voglio **dividere tra un sottoinsieme** di persone (es.
      solo chi era a cena), così le spese non riguardano sempre tutti.
- [x] **US-13** 🟡 Come utente, voglio **dividere per importi esatti** (a X tot, a Y tot),
      così gestisco i casi in cui le quote non sono uguali.
- [ ] **US-14** 🟡 Come utente, voglio **dividere per quote/percentuali** (es. 2 quote a
      chi ha la stanza doppia), così modello divisioni non uniformi in modo rapido.
- [ ] **US-15** 🔵 Come utente, voglio assegnare una **categoria** (cibo, alloggio,
      trasporti…), così vedo dove sono andati i soldi.
- [ ] **US-16** 🔵 Come utente, voglio **allegare una nota / foto dello scontrino**, così
      ho traccia del giustificativo. *(La foto richiede storage → vedi D1.)*
- [ ] **US-17** 🔵 Come utente, voglio registrare **"più persone hanno pagato"** una spesa
      unica, così gestisco pagamenti condivisi.

## 3. Saldi & chi deve a chi

- [x] **US-20** 🟢 Come utente, voglio vedere il **saldo di ogni persona** (in positivo /
      in negativo), così so a colpo d'occhio chi è avanti e chi indietro.
- [x] **US-21** 🟢 Come utente, voglio vedere **chi deve quanto a chi**, così sappiamo
      concretamente i pagamenti da fare.
- [x] **US-22** 🟡 Come utente, voglio la **semplificazione dei debiti** (minimo numero di
      transazioni), così invece di 20 bonifici incrociati ne facciamo pochi.
- [ ] **US-23** ⛔ ~~Registrare un pagamento / "settle up"~~ — **ESCLUSA**: i saldi si
      regolano tra le persone a fine vacanza, fuori dall'app. In-app solo visualizzazione.
- [x] **US-24** 🔵 Come utente, voglio un **totale complessivo della vacanza** e quanto ha
      speso in totale ciascuno, così ho il quadro finale.

## 4. Storico & modifiche

- [x] **US-30** 🟢 Come utente, voglio **vedere la lista di tutte le spese** (con importo,
      pagante, data), così controllo cosa è stato inserito.
- [x] **US-31** 🟢 Come utente, voglio **modificare o cancellare una spesa**, così correggo
      gli errori.
- [ ] **US-32** ⛔ ~~Feed attività~~ — **ESCLUSA**: ridondante con la lista spese (US-30),
      già ordinabile per data e con aggiungi/rimuovi. Senza login non c'è il "chi".
- [ ] **US-33** 🔵 Come utente, voglio **cercare/filtrare** le spese (per persona,
      categoria, data), così ritrovo velocemente una voce.

## 5. Condivisione dei dati tra gli 8 (⚠️ dipende da D1)

> Questo blocco è il vero bivio architetturale. Senza backend, i dati restano **solo
> sul tuo browser** e gli altri non li vedono.

- [x] **US-40** 🟢 Come utente, voglio che i dati **restino salvati** anche se chiudo e
      riapro l'app (persistenza locale nel browser).
- [ ] **US-41** 🟡 Come gruppo, vogliamo **vedere e modificare gli stessi dati** dai nostri
      telefoni in tempo (quasi) reale, così ognuno inserisce le proprie spese.
      *(Richiede un backend o un servizio dati esterno → D1.)*
- [ ] **US-42** 🔵 Come utente, voglio **esportare** i conti (CSV / testo da incollare in
      chat), così condivido il riepilogo anche senza sync.
- [ ] **US-43** 🔵 Come utente, voglio **importare/ripristinare** i dati da un file, così
      posso fare backup e passaggio manuale tra dispositivi.

## 6. Extra & rifiniture

- [ ] **US-50** 🔵 **Multi-valuta** (spese in EUR e valuta locale baltica con tasso di
      cambio), così gestisco spese fatte in valute diverse.
- [ ] **US-51** 🔵 **Grafico spese** per categoria o per persona, così visualizzo la spesa.
- [ ] **US-52** 🔵 **Spese ricorrenti** (es. affitto casa diviso per notti), così non le
      reinserisco.
- [ ] **US-53** 🔵 **Split per articoli** (dividi lo scontrino voce per voce), così i conti
      del supermercato sono precisi.
- [ ] **US-54** 🔵 **Modalità offline / PWA installabile sul telefono**, così la uso comoda
      durante la vacanza senza connessione.

---

## Set consigliato per la vacanza (proposta)

Un MVP realistico e utile in vacanza, se i dati restano **sul tuo dispositivo**
(tu tieni i conti per tutti):

> US-01, US-02, US-10, US-11, US-12, US-13, US-20, US-21, US-22, US-23, US-30,
> US-31, US-40, US-42

Se invece volete che **ognuno inserisca le proprie spese dal suo telefono** (US-41),
serve prima chiudere D1 con una scelta di backend.

---

## Decisioni aperte (da chiudere prima di implementare)

- **D1 — Dove vivono i dati? → ✅ DECISO: InstantDB** (backend-as-a-service reattivo,
  client-side, no login). Motivi: read/write anonimi (regola permessi `"true"`), SDK
  `@instantdb/react` su Vite senza server, **realtime + offline inclusi**, app ID
  pubblico via `VITE_*` (come Telegram), free tier "free forever". Dettagli e confronto
  con le alternative: [Architettura dati (D1)](#architettura-dati-d1).
- **D2 — Un solo gruppo o più gruppi?** (US-04) Un solo gruppo semplifica molto tutto.
- **D3 — Multi-valuta sì/no?** (US-50) Se le spese sono tutte in EUR, si taglia.
- **D4 — Autenticazione? → ✅ DECISO: nessuna.** App "aperta": chiunque abbia il link
  vede/modifica i conti (permessi InstantDB `read/write = "true"`). Rischio accettabile
  per un gruppo-vacanza privato; l'app ID è comunque pubblico by design.
- **D5 — Nome dell'area:** confermi **"Baltici"** come label della tile? E vuoi anche una
  nuova icona SVG (`/gorlium/baltici.svg`) al posto di `maglia.svg`?

---

## Architettura dati (D1)

> ✅ **DECISO: InstantDB** (opzione E). Sotto: la scelta e il confronto con le
> alternative valutate.

### ✅ Scelta: E. InstantDB — backend reattivo, client-side, no login (verificato)

- Nuove dipendenze: **1** → `@instantdb/react` (usabile anche vanilla).
- Init `init({ appId, schema })`; **app ID pubblico** → in `VITE_INSTANT_APP_ID`
  (stesso pattern env-var di Telegram). Nessun server, gira su Vite/React client-side.
- **No login:** permessi permissivi; si abilita read/write anonimi con regola `"true"`.
- **Realtime + offline inclusi** (sync live tra i telefoni, cache offline).
- Free tier "free forever", nessun pause, uso commerciale ok, no carta.
- Impatto sul piano tecnico: sostituisce lo store `load/save` + write-queue con modello
  reattivo (`useQuery`/`transact`) → **elimina** le mitigazioni localStorage (write-queue
  finding #1, decode/version finding #4); aggiunge schema InstantDB + regole permessi.
  Motore di calcolo e UI **invariati**. Dettagli in `PLAN-baltici-implementation.md`.
- Unico neo: prodotto **relativamente giovane** (dipendenza da un servizio recente).

### Alternative valutate (non scelte)

### Stato attuale del repo (verificato)

- `packages/app` dipende **solo** da: react, react-dom, react-router-dom, i18next &
  co. **Nessuna dipendenza dati** (no db, no client di storage).
- `netlify.toml` contiene **solo** il redirect SPA (`/* → /index.html`). **Nessuna
  Netlify Function**, nessuna cartella `netlify/`.
- Precedente utile: il form contatti (`Contacts.tsx`) parla con un servizio esterno
  (Telegram) **direttamente dal browser** usando env var `VITE_*` iniettate da Netlify
  al build. → Lo stesso identico pattern vale per un DB client-side.

Conseguenza: per **condividere** i dati tra gli 8 serve un servizio dati ospitato
(non può vivere dentro la SPA). Quanto si tocca la struttura di gorlium dipende
dall'opzione.

### Opzioni

**A. Supabase — Postgres gestito, client dal browser** 🟢 *(più leggera per DB condiviso)*
- Nuove dipendenze: **1** → `@supabase/supabase-js`.
- Modifiche a gorlium: **minime** — resta una SPA. Si aggiunge un modulo dati
  (`src/baltici/data.ts`) + 2 env var Netlify (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`), **stesso pattern di Telegram**. Build/deploy invariati.
- Infra esterna: account Supabase (free tier) + creare le tabelle.
- Sync tra telefoni: **realtime ✅**.

**B. Netlify Blobs / Functions — dentro l'host attuale**
- Nuove dipendenze: 1–2 (`@netlify/blobs`, event. `@netlify/functions`).
- Modifiche a gorlium: **medie** — introduce `netlify/functions/`, la SPA non è più
  "solo statica", va configurato il build delle functions in `netlify.toml`.
- Infra esterna: nessun terzo account (è Netlify, già in uso).
- Sync: **polling** (niente realtime automatico). Blobs = key-value, ottimo per un
  singolo JSON di gruppo.

**C. Firebase Firestore — client dal browser**
- Nuove dipendenze: 1 (`firebase`, pacchetto più pesante).
- Modifiche a gorlium: minime (come A). Infra: account Firebase (free tier).
- Sync: **realtime ✅**. API più verbose di Supabase.

**D. Solo localStorage — nessuna condivisione**
- Nuove dipendenze: **0**. Modifiche: **nessuna** (persistenza browser).
- Sync: **❌**. I dati stanno solo sul tuo browser → **una persona tiene i conti**.
- Abbinabile a esporta/importa (US-42/US-43) per una sync manuale.

### Confronto sintetico

| Opzione | Nuove dipendenze | Modifiche a gorlium | Sync tra telefoni | Infra |
|---|---|---|---|---|
| **A. Supabase** | 1 | minime (come Telegram) | realtime ✅ | account free |
| **B. Netlify Blobs** | 1–2 | medie (functions + toml) | polling | incluso Netlify |
| **C. Firebase** | 1 (pesante) | minime | realtime ✅ | account free |
| **D. localStorage** | 0 | nessuna | ❌ | zero |

**Indicazione:** se serve che **ognuno inserisca dal proprio telefono** → **A (Supabase)**
è la più leggera. Se basta che **una persona tenga i conti** → **D (localStorage)**,
eventualmente + export per condividere il riepilogo.

*(Nota: la logica di calcolo — saldi, chi-deve-a-chi, semplificazione debiti — è
identica in tutte le opzioni. Cambia solo il layer di persistenza, isolabile dietro
un'unica interfaccia dati: si può partire con D e migrare ad A senza riscrivere la UI.)*

---

## Nota di implementazione (per dopo la selezione)

Riepilogo di cosa si tocca, così è chiaro lo scope:
1. `packages/app/src/pages/Hub.tsx` — ripuntare la tile `maglia` → `baltici` (`href: "/baltici"`).
2. `packages/app/src/App.tsx` — aggiungere il sotto-albero di route `/baltici`.
3. `packages/app/src/layouts/BalticiLayout.tsx` — nuovo layout (sul modello di `TerrariumLayout`).
4. `packages/app/src/pages/Baltici*.tsx` — le pagine (lista spese, aggiungi spesa, saldi…).
5. Logica di calcolo saldi + semplificazione debiti (funzioni pure, testabili).
6. Store dati + persistenza (secondo D1).
7. `packages/app/src/locales/en.json` — stringhe.
8. `packages/app/public/gorlium/baltici.svg` — icona (secondo D5).
