# PLAN — Tailoring world: app cartamodelli parametrici (v1 consumer)

> Piano implementativo derivato da `ANALISI-riscrittura-seamly2d-typescript.md` (§5 scope, §6
> architettura pattern-as-data). Stato: DRAFT in review.

## 1. Contesto e obiettivo

gorlium-bento è un monorepo pnpm con una SPA Vite+React (`@gorlium/app`, hub multi-mondo a `/`,
mondi annidati tipo `/terrariums`) e un design system condiviso (`@gorlium/design-system`),
deploy su Netlify. Il mondo **Tailoring** (oggi disabilitato nel hub) diventa un'app consumer:

- L'utente inserisce le **proprie misure** in un form (un solo set per utente, modificabile,
  persistito in localStorage).
- Sceglie un **cartamodello parametrico** da un catalogo authored dal maintainer **in codice
  come dati** (op-list JSON tipizzate, NON funzioni draft libere — vincolo architetturale §6.5
  per compatibilità col futuro CAD v2).
- Vede l'**anteprima SVG** del cartamodello calcolato sulle sue misure, con **layer opzionali
  toggleabili** (margini di cucitura, tacche, grainline/linee interne, etichette).
- Scarica il **PDF tiled** (A4/Letter multi-pagina con crocini di allineamento) per stampa
  casalinga a scala fisica esatta.

Non-goals v1: CAD di costruzione, multisize/grading, database misure, nesting ottimizzato,
DXF/EPS, import .val, i18n, account/backend, anteprima live durante l'editing misure.

## 2. Architettura

```
packages/
  pattern-engine/     @gorlium/pattern-engine — op-set + interprete su @freesewing/core. Puro TS, zero DOM.
  patterns/           @gorlium/patterns — catalogo: op-list tipizzate + metadati (misure richieste, opzioni, immagini)
apps/ (o struttura attuale)
  app/                @gorlium/app — nuova route lazy /tailoring: form misure, catalogo, anteprima, export
```

Scelte tecniche (decise):
- Motore: **@freesewing/core** (MIT, puro ESM; verificato: draft ~1ms, browser-ready).
- Op-set proprio JSON/TS + **interprete = un design FreeSewing generico** la cui draft() esegue
  le op chiamando i primitivi core (Point.shift, Path.offset, intersezioni, splitCurve…).
- Rendering: **SVG via React** da `asRenderProps()`; layer = `<g>` condizionali.
- PDF: **pdf-lib** client-side, dimensioni fisiche esatte + crocini.
- Stato: **Zustand + persist** (localStorage) per misure e preferenze layer.
- Validazione: **Zod** — schema misure per pattern, validazione form.
- Test: **Vitest**, golden test sul motore (op-list + misure fisse → snapshot coordinate/SVG).

## 3. Fasi

### Fase 0 — Scaffolding (S)
- [ ] Package `@gorlium/pattern-engine` e `@gorlium/patterns` nel monorepo (tsconfig base
      condiviso, tsgo, verbatimModuleSyntax come il resto del repo).
- [ ] Dipendenza `@freesewing/core` (+ `@freesewing/plugin-annotations` se usato per tacche/
      grainline/title) vendorizzata o pinned.
- [ ] **Pipeline test da creare** (oggi non esiste: root `package.json` ha solo
      `start/build/typecheck` e `turbo.json` non ha un task `test`): aggiungere Vitest ai nuovi
      package, task `test` in `turbo.json` (`dependsOn: ["^build"]` non necessario, no cache
      su watch), script root `"test": "turbo run test"`.

### Fase 1 — Op-set e interprete (M)
- [ ] Definire i tipi dell'op-set v1 (subset minimo sufficiente per i primi 2 pattern del
      catalogo): `point.base`, `point.atDistanceAngle`, `point.alongLine`, `point.intersectLines`,
      `point.onCurve`, `curve.spline`, `curve.arc`, `path.build`, `piece.define` (contorno,
      margine on/off e larghezza, tacche su nodi, grainline, label anchor), `mirror`, `rotate`.
- [ ] Interprete: design FreeSewing generico che esegue una op-list; risoluzione referenze per
      id; errori chiari (op malformata, referenza mancante, misura mancante).
- [ ] Espressioni numeriche v1: **niente parser di formule custom** — le op usano funzioni TS
      tipizzate `(m: Measurements) => number` oppure valori literal. (Parser user-facing
      rimandato al CAD v2; le op-list restano serializzabili perché le espressioni-funzione
      vivono nel catalogo TS, non in JSON runtime.)
- [ ] Golden test: op-list di riferimento + misure fisse → coordinate attese.

### Fase 2 — Primo pattern del catalogo (M)
- [ ] Scegliere e scrivere come op-list il pattern pilota (candidato: gonna dritta o canotta —
      pochi pezzi, poche misure).
- [ ] Metadati: misure richieste (con range validi per Zod), opzioni (es. lunghezza), immagini.
- [ ] Verifica manuale a scala reale (stampa e misura con metro).

### Fase 3 — UI: form misure + catalogo + anteprima (M/L)
- [ ] **Route tree** `/tailoring` in `App.tsx` sul modello di `/terrariums`: `TailoringLayout`
      (lazy) con figli `index` (catalogo), `:patternId` (pagina pattern), `measurements`
      (form misure). Riattivare il mondo in `Hub.tsx`.
- [ ] **Background pre-mount**: lo script in `packages/app/index.html` colora light solo `/` e
      dark tutto il resto — decidere il colore del mondo Tailoring e aggiornare lo script
      (es. mappa path→colore), per evitare il flash col tema dei terrari.
- [ ] **Estensione design-system** (necessaria: `TextField` è solo string senza error state,
      `Form` ha solo un banner d'errore top-level): aggiungere a `@gorlium/design-system` un
      `NumberField` (o `TextField` con `type`/`error`/`helperText`) e supporto errori
      per-campo, riusando lo styling `g-field`/`g-input` esistente.
- [ ] Form misure con Zod (unità cm; conversioni rimandate), persist Zustand, errori per-campo
      con range dai metadati del pattern.
- [ ] Pagina catalogo (griglia dai metadati) e pagina pattern.
- [ ] Anteprima SVG con toggle layer: cucitura/taglio (margini), tacche, grainline+interni,
      etichette. Zoom/pan basilare (viewBox).
- [ ] Stati vuoti/errore: misure mancanti per il pattern → CTA al form.

### Fase 4 — Export PDF tiled (M)
- [ ] Impaginazione semplice: bounding box dei pezzi → distribuzione su pagine senza
      sovrapposizioni (griglia per pezzo, nessun nesting).
- [ ] Generazione pdf-lib: pagine A4/Letter, margini stampante, crocini + coordinate di
      incollaggio (es. colonna/riga), quadrato di calibrazione 10×10cm sulla prima pagina.
- [ ] Test di stampa fisica: quadrato di calibrazione misurato a mano.

### Fase 5 — Rifiniture e release (S)
- [ ] Empty state del mondo Tailoring nel hub. **Head/meta**: oggi esiste solo il `<title>`
      statico in `index.html` e nessuna gestione head per route né analytics — aggiornare il
      title via `document.title` on-route (accettando il limite SPA per gli OG: i crawler
      vedranno i meta statici; prerender/SSR fuori scope v1).
- [ ] Secondo pattern nel catalogo per validare che l'op-set generalizzi.
- [ ] Aggiornare ANALISI/memorie; changelog.

Stime: S ≤ 0,5 g; M = 1–3 g; L = 3–5 g. Totale v1 ≈ 2–3 settimane part-time.

## 4. Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| L'op-set v1 troppo povero per pattern reali | Progettarlo estraendolo dal pattern pilota reale, non in astratto; §6.2 mappa già i primitivi necessari |
| Scala fisica del PDF sbagliata (unità FS = mm; PDF = punti) | Quadrato di calibrazione + golden test sulle conversioni mm→pt |
| Path.offset di FreeSewing insufficiente per margini con angoli difficili | Accettare in v1 (pattern semplici); fallback Clipper2 documentato in analisi §5 |
| Lock-in su funzioni-espressione TS non serializzabili in JSON puro | Confinare le espressioni in un modulo per pattern; il CAD v2 introdurrà il parser e migrerà |
| Il mondo hub SPA cresce di bundle | Route lazy + code splitting; engine e pdf-lib caricati on demand |

## 5. Criteri di accettazione v1

1. Un utente senza istruzioni inserisce le misure, apre il pattern pilota, toggla i layer,
   scarica il PDF, lo stampa: il quadrato di calibrazione misura 10,0 cm ± 1 mm.
2. Le misure persistono al reload e si riapplicano a ogni pattern del catalogo.
3. Golden test verdi sul motore; typecheck tsgo pulito; nessuna regressione nel resto del hub.
4. Le op-list del catalogo non contengono codice di rendering né riferimenti a React.
