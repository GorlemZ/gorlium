# Baltici — Piano d'implementazione

> Piano tecnico per l'area **Baltici** (Splitwise light) dentro `packages/app`.
> Scope e feature: vedi [PLAN-baltici-splitwise.md](PLAN-baltici-splitwise.md).
>
> **Stato:** ✅ **codex-review APPROVED** — piano base (6 finding) + integrazione
> **InstantDB** (altri 4 finding: refs stale, ordine canonico persistito, permessi
> `delete=false`+soft-delete, typing env). **D1 RISOLTA → InstantDB** (backend reattivo
> client-side, no login): §4/§5 hanno rimpiazzato il layer localStorage.
> ⏳ Implementazione in attesa di via libera + app ID InstantDB.
>
> ⚠️ Alcune parti sotto sono state riviste col codex assumendo **localStorage**. Con
> InstantDB restano validi **motore di calcolo (§3), modello (§2), validazione (§6b),
> UI (§6), routing/hub (§7)**; sono cambiati **persistenza (§4)** e **store (§5)** — le
> mitigazioni localStorage (write-queue, decode/version) **non servono più** perché
> InstantDB gestisce sync/persistenza/concorrenza.

## 0. Scope in una riga

App per 8 persone, **senza login**, per: gestire persone di un gruppo, aggiungere/
rimuovere spese (split *tutti* / *sottogruppo* / *importi esatti*), e **vedere lo stato
attuale dei conti** (credito/debito per persona, chi-deve-a-chi semplificato, totale
vacanza + speso per persona). Nessun settle-up in-app. Persistenza: **InstantDB**
(backend reattivo client-side, dati condivisi in realtime tra i telefoni, no login).

---

## 1. Principi architetturali

1. **Logica di calcolo = funzioni pure, isolate e testabili.** Nessuna dipendenza da
   React o dallo storage. Sono il cuore corretto dell'app (saldi, chi-deve-a-chi,
   semplificazione debiti, arrotondamenti).
2. **Persistenza = InstantDB, isolata dietro un mapper** (`toGroupState`) + azioni
   `db.transact`. Il resto dell'app lavora su `GroupState` (§2) senza sapere di
   InstantDB → se un domani si cambiasse backend, si tocca solo `db.ts` + store.
3. **Tutti gli importi in centesimi interi** (`number` intero). Mai float per i soldi:
   si evita `0.1 + 0.2`. Formattazione a €X,XX solo in visualizzazione.
4. **UI con il design-system** dove copre; piccoli componenti locali (stilati coi token
   DS) dove il DS non arriva (select, toggle, input numerico).
5. **Un solo gruppo** (D2). Niente concetto di "utente corrente" (D4): il pagante è
   sempre scelto esplicitamente.

---

## 2. Modello dati

`packages/app/src/baltici/model.ts`

```ts
export type PersonId = string;
export type ExpenseId = string;

export interface Person {
  id: PersonId;
  name: string;
  color: string;        // US-05: avatar/colore (uno da una palette fissa)
}

export type SplitMode = "equal" | "exact";
// "equal" copre sia "tutti" (participants = tutte le persone) sia "sottogruppo"
// (participants = sottoinsieme). "exact" = importi esatti per persona.

// Discriminated union → UNA sola fonte di verità per il "chi divide" (finding #2):
// - equal: la verità è `participants`.
// - exact: la verità è `exactShares`; i partecipanti si DERIVANO dalle sue chiavi
//   (non esiste un `participants` separato da tenere in sync).
interface ExpenseBase {
  id: ExpenseId;
  description: string;
  amountCents: number;              // totale, intero in centesimi (> 0)
  payerId: PersonId;                // scelto esplicitamente
  date: string;                     // "YYYY-MM-DD"
  createdAt: number;                // Date.now(), per ordinamento stabile
}
export interface EqualExpense extends ExpenseBase {
  splitMode: "equal";
  participants: PersonId[];         // ≥ 1, unici; ordine non significativo (canonizzato in calc)
}
export interface ExactExpense extends ExpenseBase {
  splitMode: "exact";
  exactShares: Record<PersonId, number>; // cent per persona, somma === amountCents
}
export type Expense = EqualExpense | ExactExpense;

// Helper unico usato ovunque (store, calc, validazione removePerson):
export function participantsOf(e: Expense): PersonId[];   // equal→participants, exact→keys(exactShares)
export function personIdsInExpense(e: Expense): PersonId[]; // = [payerId, ...participantsOf(e)] deduplicati

export interface GroupState {
  version: 1;
  name: string;                     // es. "Vacanza Baltici 2026"
  people: Person[];                 // ordine = ordine canonico (vedi calc §3)
  expenses: Expense[];
}
```

Note:
- Il pagante **può** non essere tra i partecipanti (paga ma non partecipa) → gestito
  naturalmente: il suo "paid" è comunque conteggiato, la sua quota è 0.
- **`exact` valido solo se** `Object.keys(exactShares).length ≥ 1`, tutti gli id
  esistono in `people`, ogni share è intero `≥ 0`, e `sum(shares) === amountCents`.
- **`equal` valido solo se** `participants.length ≥ 1` e tutti gli id esistono in `people`.
- **Numero di persone: N flessibile, nessun limite hard-coded** (finding #6). "8" è lo
  scenario d'uso, non un vincolo: lo store non blocca su 8, i toggle e la palette colori
  gestiscono N qualsiasi (palette che cicla / genera colori). Nessuna UI assume esattamente 8.

---

## 3. Motore di calcolo (funzioni pure)

`packages/app/src/baltici/calc.ts` — nessun import da React/storage.

```ts
// Quota dovuta da ciascun partecipante per UNA spesa, in centesimi interi.
// equal: amount diviso equamente tra i participants. Il resto (1..N-1 cent) è
//        distribuito 1 cent a testa seguendo l'ORDINE CANONICO (finding #3):
//        i partecipanti sono ordinati per la loro posizione in `people` (non per
//        l'ordine dell'array `participants`, che dipende dai toggle). Stesso
//        sottoinsieme logico ⇒ stessa assegnazione del resto, sempre.
// exact: ritorna direttamente exactShares.
// Richiede input valido (vedi validazione §6). Su spesa "equal" con 0 partecipanti
// è uno stato illegale che la validazione impedisce a monte; calc lancia (fail-fast),
// non divide per zero.
export function shareOf(expense: Expense, people: Person[]): Record<PersonId, number>;

// Saldo netto per persona su TUTTE le spese, in centesimi.
// net = somma(anticipato come payer) − somma(quote dovute).
// > 0 = in credito (il gruppo gli deve), < 0 = in debito.
export function balances(state: GroupState): Record<PersonId, number>;

// US-24: totale speso (come payer) per persona + totale complessivo gruppo.
export function totals(state: GroupState): {
  perPerson: Record<PersonId, number>;
  grand: number;
};

// US-21 + US-22: dai saldi netti, lista minima di pagamenti "X → Y : importo"
// (greedy min-cash-flow: match del maggior creditore col maggior debitore).
export interface Settlement { fromId: PersonId; toId: PersonId; amountCents: number; }
export function simplifyDebts(net: Record<PersonId, number>): Settlement[];
```

**Correttezza da garantire (invarianti testabili):**
- Per ogni spesa, `sum(shareOf) === amountCents` (nessun cent perso/creato).
- `sum(balances) === 0` sempre.
- `sum(settlement.amount)` coerente; ogni saldo azzerato dalla lista dei pagamenti.
- Arrotondamento deterministico (stesso input → stesso output, no `Math.random`).

Questi diventano **unit test** (vitest) — vedi §9.

---

## 4. Persistenza — InstantDB (D1 risolta)

Dipendenza: `@instantdb/react`. Config in `packages/app/src/baltici/db.ts`:

```ts
import { init, i } from "@instantdb/react";

// app ID pubblico → env var al build Netlify (come i VITE_ di Telegram)
const APP_ID = import.meta.env.VITE_INSTANT_APP_ID;

const schema = i.schema({
  entities: {
    people: i.entity({
      name: i.string(),
      color: i.string(),
      createdAt: i.number(),      // FINDING #2: ordine canonico PERSISTITO (per §3).
                                  // toGroupState ordina people per createdAt — mai
                                  // per l'ordine di ritorno della query (non garantito).
    }),
    expenses: i.entity({
      description: i.string(),
      amountCents: i.number(),
      payerId: i.string(),        // id di una row `people`
      date: i.string(),           // "YYYY-MM-DD"
      splitMode: i.string(),      // "equal" | "exact"
      participants: i.json(),     // PersonId[] (solo equal)
      exactShares: i.json(),      // Record<PersonId, number> (solo exact)
      createdAt: i.number(),
      deleted: i.boolean(),       // FINDING #3: soft-delete (US-31). La rimozione è un
                                  // update deleted=true, non un delete distruttivo →
                                  // dato recuperabile, resistente a cancellazioni
                                  // accidentali/malevole. toGroupState filtra i deleted.
    }),
    meta: i.entity({ groupName: i.string() }), // singola row
  },
});

export const db = init({ appId: APP_ID, schema });
export type DbSchema = typeof schema;
```

Note:
- **Namespace vs GroupState:** i dati vivono in InstantDB come entità (`people`,
  `expenses`, `meta`); il `GroupState` del §2 è la **vista in memoria** ricomposta dalla
  query (people ordinate → ordine canonico per §3). `exactShares`/`participants` restano
  la union del §2, serializzati come campi `i.json()`.
- **Permessi (no login) + mitigazioni rischio (finding #3):** l'app ID è nel bundle,
  quindi "aperto" significa *scrivibile da chiunque carichi il sito*, non solo da chi ha
  il link. Rischio accettato per dati di vacanza a basso valore, **ma** mitigato:
  - **niente hard-delete:** permessi `view/create/update = "true"`, **`delete = "false"`**
    su tutte le entità → nessuna cancellazione distruttiva possibile; la rimozione spese
    è soft (`deleted=true`), i dati restano recuperabili.
  - **app ID separati per ambiente** (dev vs prod) → i test non toccano i dati reali.
  - **backup/restore** via dashboard InstantDB se qualcosa va storto.
  - documentato come **intenzionalmente pubblico e a basso rischio** (piccolo blast
    radius: un solo gruppo-vacanza).
  Configurazione in dashboard o `instant.perms.ts`. (D4: nessuna auth.)
- **id:** li genera InstantDB (`id()` / `db.transact`), non serve `crypto.randomUUID()`.
- **Typing env (finding #4):** aggiungere `VITE_INSTANT_APP_ID: string` a
  `packages/app/src/vite-env.d.ts` (oggi dichiara solo le due var Telegram), altrimenti
  `import.meta.env.VITE_INSTANT_APP_ID` non è tipato sotto la config TS attuale.
- **Cosa NON serve più** (rispetto alla vecchia impl. localStorage): interfaccia
  `BalticiRepository`, `decodeGroupState`/versioning (finding #4), write-queue
  serializzata (finding #1). InstantDB gestisce sync, persistenza, offline e ordine
  delle scritture lato servizio. *(La validazione della shape resta utile solo in forma
  “difensiva” leggera nel mapping query→GroupState.)*

> **Gancio D1:** quando si sceglie l'architettura dati, si aggiunge
> `supabaseRepository.ts` (stessa interfaccia) e si cambia **una riga** nel provider.
> Calcolo e UI restano identici.

---

## 5. Store (stato applicativo)

`packages/app/src/baltici/store.tsx` — hook **reattivo** su InstantDB (niente Redux,
niente Context di stato: la reattività la dà InstantDB).

- **Lettura live.** `db.useQuery({ people: {}, expenses: {}, meta: {} })` restituisce i
  dati in realtime. Un mapper puro `toGroupState(queryResult): GroupState` li ricompone
  nella vista del §2:
  - **people ordinate per `people.createdAt`** → ordine canonico stabile e persistito
    (finding #2), MAI l'ordine di ritorno della query;
  - **expenses filtrate** su `deleted !== true` (finding #3), poi mappate alla union
    `Equal|Exact`.
  Il resto dell'app lavora su `GroupState`, ignaro di InstantDB.
- **Derivati memoizzati** (`useMemo` su `GroupState`): `balances`, `totals`,
  `simplifyDebts` — ricalcolati quando la query cambia. Identici a prima.
- **Scritture:** `db.transact(...)` con le azioni:
  - persone: `addPerson` (setta `createdAt`), `renamePerson`, `removePerson`,
  - spese: `addExpense` (setta `createdAt`, `deleted=false`), `updateExpense`,
    `removeExpense` = **update `deleted=true`** (soft-delete, finding #3; nessun hard-delete),
  - gruppo: `setGroupName` (update della row `meta`).
  InstantDB serializza/ordina le scritture lato servizio e propaga in realtime → **niente
  write-queue** (l'ex finding #1 non si applica più). Update ottimistico è nativo.
- **StrictMode:** con `useQuery`/`transact` il doppio-mount in dev è innocuo (nessun
  `load/save` manuale idempotente da gestire).
- `removePerson` **bloccante** (T2): prima della `transact` di delete, si controlla in
  memoria (su `GroupState`) se la persona compare in **qualsiasi** spesa come pagante
  **o** partecipante **o** chiave di `exactShares`. Il check usa `personIdsInExpense(e)`
  (include le chiavi di `exactShares`) → nessun riferimento sfugge (finding #2). Se
  coinvolta → si blocca con messaggio, niente transact.

Gli id delle row li genera InstantDB (helper `id()` dell'SDK), non `crypto.randomUUID()`.

---

## 6. UI — pagine e componenti

Pattern: layout con `<Outlet/>` come `TerrariumLayout`, pagine che usano il DS +
componenti locali. **Nessun provider di stato**: `db` è un singleton di modulo (`db.ts`)
e le pagine leggono/scrivono chiamando l'hook `useBaltici()` (che dentro usa
`db.useQuery`/`db.transact`). La condivisione dello stato tra pagine la garantisce la
reattività di InstantDB, non un Context.

### Pagine (`packages/app/src/pages/baltici/`)
| File | Route | Contenuto | Stories |
|---|---|---|---|
| `BalticiHome.tsx` | `/baltici` (index) | Riepilogo: saldi per persona (credito/debito), totale vacanza, link alle altre viste | US-20, US-24 |
| `BalticiExpenses.tsx` | `/baltici/expenses` | Lista spese ordinata per data + bottone "aggiungi"; ogni riga con rimuovi/modifica | US-30, US-31 |
| `BalticiAddExpense.tsx` | `/baltici/expenses/new` (+ `/:id/edit`) | Form aggiungi/modifica spesa | US-10..13, US-31 |
| `BalticiSettleUp.tsx` | `/baltici/who-owes` | Chi-deve-a-chi semplificato (sola lettura) | US-21, US-22 |
| `BalticiPeople.tsx` | `/baltici/people` | Gestione persone (+ nome gruppo) | US-01, US-02, US-03, US-05 |

### Componenti locali (`packages/app/src/baltici/components/`)
DS non ha questi → li costruiamo (stilati coi token DS `var(--...)`):
- `PersonSelect` — dropdown "ha pagato" (native `<select>` stilizzata).
- `ParticipantsToggle` — griglia toggle per le N persone (US-11/12), con scorciatoia "tutti".
- `AmountInput` — input importo → centesimi. Vedi regole di parsing sotto.
- `ExactSharesEditor` — un `AmountInput` per persona con badge "resto: €X" (US-13).
- `SplitModeTabs` — segmented `Tutti | Sottogruppo | Importi esatti` (usare DS `Tabs`
  se adatto, altrimenti locale).
- `PersonAvatar` — cerchio con iniziale + colore (US-05).
- `BalanceRow` / `MoneyText` — riga saldo + formattazione €.

### Layout
`packages/app/src/layouts/BalticiLayout.tsx` — copia di `TerrariumLayout`: link "←
GORLIUM HUB", `Header` con le tab Baltici (Home / Spese / Chi deve a chi / Persone),
`<Outlet/>`. Nessun provider da avvolgere (vedi sopra: `db` è un singleton di modulo).

---

## 6b. Validazione (input importi e spese) — finding #5

Nessun pattern di input monetario esiste nel repo/DS → va definito qui.

**`AmountInput` — parsing importo → centesimi interi** (`parseAmountToCents`):
- Accetta virgola **o** punto come separatore decimali (`12,50` e `12.50` → `1250`).
- Ignora spazi; opzionale separatore migliaia; max 2 decimali (i decimali extra → errore
  o troncati, da fissare: **errore** per non nascondere input sbagliati).
- **Rifiuta**: vuoto, non-numerico, negativo, **zero** → l'importo dev'essere `> 0`.
- Ritorna `{ cents: number } | { error: string }`; il form mostra l'errore inline e
  disabilita il salvataggio finché non è valido.

**Validazione spesa a monte del `save` (`validateExpense`)** — impedisce stati illegali:
- `amountCents > 0`, `payerId` esiste, `date` valida.
- `equal`: `participants.length ≥ 1`, id unici ed esistenti → così `shareOf` non divide
  mai per zero.
- `exact`: chiavi esistenti, ogni share intero `≥ 0`, **`sum(shares) === amountCents`**
  (l'editor mostra il "resto" e blocca finché non è 0).
- La stessa `validateExpense` è riusata dalle **azioni dello store** (guardia prima di
  `db.transact`, così non si scrivono spese illegali) e dagli **unit test**.

## 7. Routing & Hub

**`App.tsx`** — aggiungere sotto il blocco terrariums:
```tsx
<Route path="/baltici" element={<BalticiLayout />}>
  <Route index element={<BalticiHome />} />
  <Route path="expenses" element={<BalticiExpenses />} />
  <Route path="expenses/new" element={<BalticiAddExpense />} />
  <Route path="expenses/:id/edit" element={<BalticiAddExpense />} />
  <Route path="who-owes" element={<BalticiSettleUp />} />
  <Route path="people" element={<BalticiPeople />} />
</Route>
```

**`Hub.tsx:40`** — trasformare la tile `maglia`:
```tsx
{ slug: "baltici", name: "Baltici", accent: "#cc7a4f",
  desc: "Trip expenses, split fair.", img: "/gorlium/maglia.svg",
  href: "/baltici", restricted: false },
```
(D5: si riusa `maglia.svg` per ora; `href` non-null → tile attiva. `desc` in EN come il
resto del hub.)

---

## 8. i18n

Aggiungere `translation.baltici.*` e le voci `header.*` per le tab in
`packages/app/src/locales/en.json`. Tutte le stringhe in **inglese** (coerenza col
resto). Il tipo di `t()` è generato da `i18next.d.ts` → nuove chiavi tipizzate in
automatico. *(Nota: i **dati** utente — nomi persone, descrizioni spese — sono runtime,
non i18n.)*

---

## 9. Testing

- **Unit (vitest)** su `calc.ts` + validazione + mapper `toGroupState` — la parte a rischio:
  - split equal con resto non divisibile (es. €10 tra 3 → 3,34/3,33/3,33, somma 10,00);
  - **ordine canonico del resto (finding #3):** lo stesso sottoinsieme passato con
    `participants` in ordini diversi produce **la stessa** assegnazione del resto;
  - pagante escluso dai partecipanti;
  - `sum(balances) === 0` su scenari casuali;
  - `simplifyDebts` azzera tutti i saldi e non crea pagamenti negativi;
  - `parseAmountToCents`: `12,50`/`12.50`→1250; vuoto/negativo/zero/3-decimali → errore;
  - `validateExpense`: equal con 0 partecipanti → invalido; exact con somma ≠ totale →
    invalido;
  - `toGroupState`: mapping query InstantDB → `GroupState` (people ordinate = ordine
    canonico; expenses → union corretta; row con campi mancanti gestite in modo difensivo).
- *(Nota: vitest non è ancora nel repo → va aggiunto come devDependency in
  `packages/app`, con script `test`. Da confermare: OK aggiungerlo?)*
- **Verifica manuale** nel browser (preview) sullo scenario "paghi €120, tutti, 8
  persone → +€105 / −€15 ×7", e su un caso sottogruppo.

---

## 10. Ordine di lavoro (incrementale, sempre verde)

1. **Modello + calcolo + test** (`model.ts`, `calc.ts`, test). Nessuna UI: si valida la
   correttezza per prima.
2. **InstantDB + store reattivo** (`db.ts` schema/init, permessi con `delete="false"`,
   `store.tsx` con `useQuery`/`transact` + mapper `toGroupState`). Setup app InstantDB +
   `VITE_INSTANT_APP_ID` (Netlify + `.env` locale) + riga in `vite-env.d.ts`.
3. **Attivazione area**: `Hub.tsx` (tile), `App.tsx` (route), `BalticiLayout.tsx`,
   `BalticiHome.tsx` minima → l'area si apre e mostra "stato vuoto".
4. **Persone** (`BalticiPeople.tsx` + `PersonAvatar`, `PersonSelect`) → si popolano gli 8.
5. **Aggiungi spesa** (`BalticiAddExpense.tsx` + componenti split) → il flusso completo.
6. **Lista + rimozione/modifica** (`BalticiExpenses.tsx`).
7. **Saldi & chi-deve-a-chi** (`BalticiHome` completa, `BalticiSettleUp.tsx`).
8. **i18n**, rifiniture, responsive (mobile: l'app si userà da telefono).

Ogni step chiude con `pnpm --filter @gorlium/app typecheck` verde.

---

## 10b. Note di implementazione (deviazioni emerse)

Scoperte durante lo sviluppo, recepite nel codice:

1. **`init()` di InstantDB lancia in modo sincrono** se l'app ID non è un UUID valido
   (verificato: "…is not a valid uuid"). Siccome `db.ts` è importato all'avvio (App →
   BalticiLayout → db), un app ID malformato manderebbe in blank **tutto il sito**. →
   `db.ts` inizializza in modo difensivo (`createDb()` in try/catch): in caso di
   fallimento `db = null`, `isConfigured = false`, l'area mostra "non configurato" e il
   resto del sito continua a funzionare. In più, `<ErrorBoundary>` attorno all'`<Outlet/>`
   di Baltici come difesa in profondità. Verificato in browser (hub + gate ok con id non valido).
2. **Soft-delete anche sulle persone.** Dato che i permessi vietano l'hard-delete su
   tutte le entità (`delete="false"`), anche `people` ha un campo `deleted`; `removePerson`
   fa update `deleted=true` (solo se non referenziata — blocco T2 invariato). `toGroupState`
   filtra le persone `deleted`.
3. **Storage dei campi split.** Ogni riga spesa memorizza sia `participants` sia
   `exactShares` (equal → `exactShares={}`, exact → `participants=[]`); `toGroupState`
   ricostruisce la union in base a `splitMode`.

## 11. Decisioni tecniche (confermate)

- **T1 — vitest:** ✅ **Sì.** Aggiungere vitest come devDependency a `packages/app` con
  script `test`, e coprire `calc.ts` con gli unit test di §9.
- **T2 — `removePerson` con spese collegate:** ✅ **Bloccare.** Se la persona è pagante o
  partecipante di almeno una spesa, la rimozione è vietata con messaggio esplicativo.
  (Prima si cancellano/modificano le spese che la coinvolgono.)
- **T3 — D1 (persistenza condivisa):** ✅ **InstantDB** (deciso). Backend reattivo
  client-side, no login, realtime tra i telefoni. Serve creare l'app su InstantDB e
  impostare `VITE_INSTANT_APP_ID` su Netlify + permessi "aperti".
- **T4 — branch/PR:** su branch dedicato `feat/baltici` + PR (come i lavori precedenti).
  ⏳ **Implementazione in attesa di via libera** (piano prima validato col codex).
