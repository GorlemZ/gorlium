# Piano: migrazione TypeScript 7 (tsgo) + leggibilità del repo

Repo: `gorlium-bento` (pnpm monorepo: `packages/app` Vite+React, `packages/design-system` tsup).
Obiettivo: rendere il repo pronto per TypeScript 7 (compiler nativo, oggi `@typescript/native-preview` / `tsgo`)
e più leggibile/manutenibile, applicando KISS, DRY e i principi SOLID **senza over-engineering**
(è un sito personale di ~1000 righe: la semplicità È la best practice).

Evidenze già raccolte empiricamente (tsgo 7.0.0-dev eseguito sul repo):
- `packages/app`: tsgo passa pulito (exit 0).
- `packages/design-system`: 2 errori `TS2882` sugli import CSS side-effect (`./tokens/tokens.css`, `./styles.css`) — tsc 5.7 li accetta, TS7 no.
- Con `verbatimModuleSyntax` + `isolatedModules`: ~31 errori app + ~15 DS, tutti `TS1484` meccanici (import type), autofissabili.
- `src/i18next.d.ts` importa `./i18n/i18n` che NON esiste (il file vero è `packages/app/i18n.ts`): l'augmentation `CustomTypeOptions` è dead code, silenziata da `skipLibCheck`. Conseguenza reale: `t()` mai tipizzato → è il buco che ha lasciato passare il crash prod della pagina how-to (string vs string[] in en.json).
- `packages/app/tsconfig.app.json` è orfano e rotto (include `packages/app/src` relativo a `packages/app` → path inesistente); nessuno lo referenzia.
- `tsconfig.tsbuildinfo` è committato (artefatto di build).
- `Lore.tsx` non è più importato da nessuno (pagina morta dopo la ristrutturazione hub); chiave i18n `header.blog` inutilizzata.
- Typo CSS: `margintop: 1vh` in `packages/app/src/pages/Instructions.module.css:48` (warning a ogni build).
- Il design-system non viene MAI typecheckato: `build` = tsup (esbuild, no typecheck), l'unico check è indiretto via l'app.
- tsup `--dts` usa l'API JS di `typescript` 5.x: il compiler nativo non la espone → il DS deve tenere TS 5 come devDep finché tsup non supporta il nativo.

---

## PR 1 — Preparazione TS7 (rischio zero, nessun cambio di comportamento)

1. **`packages/design-system/src/css.d.ts`** con `declare module "*.css";` → risolve i 2 errori TS2882 sotto tsgo. (L'app non ne ha bisogno: `vite/client` già dichiara `*.css`.)
2. **Elimina `packages/app/tsconfig.app.json`** (orfano, include rotto).
3. **Untrack `packages/app/tsconfig.tsbuildinfo`** e aggiungilo a `.gitignore`.
4. **Fix typo `margintop` → `margin-top`** in `Instructions.module.css` (attenzione: la regola ha già un `margin-top: 4vh` tre righe sotto — verificare visivamente quale dei due è l'intento e tenere UNO solo dei due valori).
5. **Script `typecheck`** in entrambi i package (`tsc --noEmit` / `tsc -p tsconfig.json --noEmit`) + **nuovo task `typecheck` in `turbo.json`** (oggi non esiste: turbo ha solo `build` e `start`) → il DS diventa finalmente typecheckabile; da oggi ogni regressione di tipo nel DS si vede subito. In PR 1 gli script usano `tsc`; lo switch a `tsgo` avviene in PR 4.

Verifica: `pnpm build` verde; nessun diff visivo; check TS7 **ad-hoc** con `pnpm dlx @typescript/native-preview -p <pkg>/tsconfig.json` = 0 errori su entrambi i package (il binario `tsgo` NON è ancora una dipendenza del repo in PR 1 — lo diventa, alla root, solo in PR 4; fino ad allora la verifica nativa passa da `pnpm dlx`).

## PR 2 — Riattivare la tipizzazione i18n + pulizia dead code (prevenzione bug)

Stato verificato empiricamente (import fixato in prova su una working copy, poi ripristinato): con il solo fix dell'import le chiavi inesistenti diventano errori ✅, MA le chiavi con valore array (`instructions.*.content`, `dev.dev1.content`, ecc.) risultano **rotte nel tipo** — escluse dall'unione delle chiavi valide o con ritorno `unknown` — perché `MapLeafNodes` in `i18n.ts` non preserva fedelmente gli array; emergono ~15 errori reali in `Dev.tsx` e `Instructions.tsx`. Quindi il fix dell'import da solo NON garantisce la protezione compile-time sulla classe di bug string-vs-string[]: serve anche il punto 2.

1. **Fix import in `src/i18next.d.ts`**: `./i18n/i18n` → `../i18n`. Riattiva `CustomTypeOptions`.
2. **Eliminare `MapLeafNodes` e le cast in `i18n.ts`** (KISS + fix degli array): quella macchineria esisteva solo per il `LocalizedString` brandizzato di Bento, che oggi è `type LocalizedString = string` — è dead weight che per giunta rompe la tipizzazione degli array. Usare direttamente `export const resources = { en: enMessages } as const` (tipo = `typeof enMessages`): gli array tornano `string[]` fedeli. Poi correggere i call-site emersi (nei punti dove si consuma un array serve `t(key, { returnObjects: true })` per avere il tipo corretto, o tipizzazione esplicita del consumo in `PostSection.text` / `Instructions.content`).
   **Criterio di accettazione (entrambi obbligatori)**: (a) una chiave inventata `t("bogus.x")` deve fallire il typecheck; (b) `t("instructions.step1.content")` deve tipare `string[]` al call-site — non `unknown`, non `string`.
3. **Dead code i18n / lingua**:
   - Il sito è English-only (`lng: "en"`, switch disabilitato): rimuovere `it.json`, il blocco commentato dello switch lingua in `App`/layout, `handleLanguageChange`, e la chiave `header.blog` inutilizzata.
   - **Stato persistito**: rimuovere anche l'`useEffect` in `App.tsx` (righe ~76-80) che ripristina `localStorage["language"]` — altrimenti i browser che hanno `language=it` salvato richiamerebbero `i18n.changeLanguage("it")` su risorse italiane ormai rimosse. Attenzione: l'inizializzazione i18n avviene SOLO tramite l'import side-effect di `../i18n` in `App.tsx` → spostare quell'import in `main.tsx` (posto naturale per un side-effect di bootstrap) quando si elimina l'effect, così la rimozione non spegne i18n. La chiave stantia in localStorage può restare (innocua senza codice che la legge); niente migrazione.
   - `debug: true` in `i18n.ts` → `debug: import.meta.env.DEV` (oggi logga in produzione).
   - SOLID/ISP: `Header` dichiara `onToggleLanguage` e `initialLanguage` nelle props ma non li usa (il componente destruttura solo `list`; `LanguageSwitch` è solo codice commentato) → rimuovere le props morte dall'interfaccia e il commento.
4. **DECISIONE UTENTE — `Lore.tsx`**: pagina non raggiungibile (nessuna route). Opzioni: (a) eliminarla insieme alle chiavi `lore.*` (recuperabile da git), (b) rimontarla su una route (es. `/terrariums/lore`). Il piano assume (a) salvo indicazione contraria — il contenuto resta nella history.

Verifica: typecheck verde su entrambi i package; smoke test di tutte le route; i due criteri di accettazione del punto 2 verificati (chiave inventata → errore; chiave-array → `string[]`). Con questo, il caso "en.json content string vs array" fallisce a compile time.

## PR 3 — Leggibilità / SRP / DRY (zero cambi di comportamento)

1. **`App.tsx` = solo routing (SRP)**: estrarre `TerrariumLayout` in `src/layouts/TerrariumLayout.tsx`.
2. **Rinomina `Homepage.tsx` → `TerrariumHome.tsx`**: il nome attuale mente (è la home dell'area terrari montata su `/terrariums`, non la homepage del sito — quella è `Hub`).
3. **Riordinare `Hub.tsx` senza spacchettarlo** (243 righe, il file più grande — ma è una leaf page con dati colocati e un hook page-local: creare `content/`, `hooks/` e 4 componenti nuovi per un sito personale sarebbe proprio la violazione di KISS che questo piano vieta):
   - restare su UN file; dentro il file, estrarre il ternario gigante mobile/desktop in due sotto-componenti locali (`HubMobileList`, `HubDesktopList`) definiti nello stesso modulo;
   - costanti di stile ripetute con nomi in cima al file; `WORLDS`, `useIsMobile` e `RESTRICTED_BADGE` restano dove sono;
   - estrarre in file separati SOLO se/quando un secondo consumatore reale apparirà (es. `useIsMobile` servisse a un'altra pagina).
4. **DRY: `preloadImage`** duplicata identica in `Homepage.tsx` e `Terrariums.tsx` → `src/lib/preloadImage.ts`.
5. **`Instructions.tsx`: numerazione onesta.** Oggi i numeri sono hardcoded e le chiavi mentono (contenuto di `step3` renderizzato come "1.", `step2` come "2.", `step1` come "3."). Fix: array ordinato `steps` e numerazione derivata dall'indice; rinominare le chiavi i18n secondo l'ordine reale (`maintenance`, `condensation`, `placement`). Mai più numeri magici disallineati dai contenuti.
6. **`Header` (DS) — correttezza e disaccoppiamento**:
   - doppia navigazione: la cella fa `onClick={() => window.location.href = link}` E contiene `<a href>`. Il fix NON è tenere solo l'`<a>` interno così com'è (hit-area a tutta cella e hover-fill vivono su `.g-header__cell`: si perderebbero entrambi) ma **rendere l'`<a>` stesso la cella**: `<a className="g-header__cell g-header__link" href>` unico elemento, eliminando il `div` wrapper e il suo `onClick`. CSS in `styles.css`: `.g-header__cell` deve continuare a valere (ora sull'anchor: aggiungere `text-decoration: none` se serve, e adattare `.g-header__cell:hover .g-header__link` → `.g-header__cell:hover`). Risultato visivo/interattivo identico (tutta la cella cliccabile, hover-fill invariato), DOM più semplice e una sola navigazione;
   - `list.slice(0, 5)` + `columns: 5` hardcoded → colonne = `list.length`, niente numero magico accoppiato all'app (DIP: il DS non deve sapere quante voci ha l'app);
   - OPZIONALE (decisione): navigazione SPA. Oggi ogni voce fa full reload. Alternativa senza accoppiare il DS a react-router: prop `renderLink?: (href, label) => ReactNode`. KISS dice che il full reload è accettabile per questo sito → di default NON farlo, annotare solo la possibilità.
7. **`vite.config.ts`**: verificare se il middleware `connect-history-api-fallback` è ridondante (Vite in dev ha già il fallback SPA con `appType: 'spa'` di default). Se i deep link funzionano senza, rimuovere middleware e dipendenza.

Verifica: confronto screenshot prima/dopo su `/`, `/terrariums`, `/terrariums/gallery`, `/terrariums/how-to`, `/terrariums/contacts` (desktop + mobile); build e typecheck verdi.

## PR 4 — Switch a TypeScript 7

1. devDep **`@typescript/native-preview` alla ROOT del workspace** (una sola versione per tutto il monorepo; pnpm la rende disponibile come bin `tsgo` a entrambi i package — è da qui che arriva il binario usato dagli script del punto 2 e 3).
2. App: `"build": "tsgo -b && vite build"` e `"typecheck": "tsgo -b"` (in alternativa più prudente: `"typecheck:native": "tsgo -b"` accanto a quello tsc e switch del build dopo un periodo di doppio binario).
3. Design-system: lo script `typecheck` introdotto in PR 1 passa da `tsc --noEmit` a `tsgo -p tsconfig.json --noEmit`. Il pacchetto **resta** anche su `typescript` 5.x come devDep, usato SOLO da `tsup --dts` (l'API JS del compiler che il nativo non espone) — commento nel package.json che spiega il perché.
4. Quando TS7 stable uscirà come `typescript@7`: sostituire il preview alla root con la major e rimuovere il doppio binario.

Verifica: deploy-preview Netlify verde (la build Netlify esegue lo script `build` → deve funzionare col binario nativo su Linux); `tsgo -b` exit 0 in locale.

## PR 5 (opzionale) — Strictness moderna

1. `verbatimModuleSyntax: true` + `isolatedModules: true` nei due tsconfig (allinea il typecheck alla realtà transpile-per-file di esbuild/Vite/tsup).
2. Autofix dei ~46 `TS1484` misurati con ESLint `@typescript-eslint/consistent-type-imports` + `--fix`; aggiungere la regola alla config ESLint per non regredire.
3. DRY config: `tsconfig.base.json` alla root con le `compilerOptions` comuni (oggi duplicate quasi identiche nei due package), i package fanno `extends`.

Verifica: tsgo verde con i nuovi flag su entrambi i package.

---

## Non-goals (KISS applicato al piano stesso)

- Nessuna nuova libreria UI/CSS/state-management.
- Nessuna introduzione di test framework in queste PR (eventuale follow-up separato: un paio di smoke test Playwright sulle route varrebbero più di unit test qui).
- Nessuna riscrittura del design system o astrazione "a prova di futuro" non richiesta dai problemi elencati.
- Nessun cambio visivo o di comportamento fuori da quelli esplicitati (fix typo CSS e doppia navigazione Header).

## Ordine e dipendenze

PR 1 → PR 2 → PR 3 → PR 4 → (PR 5). PR 1 e 2 sono piccole e indipendenti dal refactor; PR 4 va dopo PR 1 (senza `css.d.ts` tsgo fallisce sul DS). PR 3 può procedere in parallelo a PR 4 ma va mergiata prima dello switch per non typecheckare due volte il churn.
