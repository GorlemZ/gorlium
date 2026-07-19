# Riscrittura di Seamly2D in TypeScript (web app): analisi degli ostacoli

> Analisi basata sull'ispezione diretta del sorgente di [FashionFreedom/Seamly2D](https://github.com/FashionFreedom/Seamly2D)
> (clone del 2026-07-10, branch di default). I path citati si riferiscono a quel repo.
> Dove un'affermazione è inferita e non verificata sul codice, è marcata **[inferito]**.

## TL;DR

Non ci sono ostacoli *teorici* insormontabili: è geometria 2D + un parser di formule + una UI,
tutto esprimibile in TypeScript/browser. Gli ostacoli reali sono:

1. **La mole**: ~257k righe di C++ (esclusi i binari Xerces vendorizzati), di cui la parte
   dominante è UI interattiva — 57 tool di disegno, 46 dialog, 52 comandi di undo, 225 file
   che toccano `QGraphicsScene`/`QGraphicsItem`. Non è "un motore da portare", è un CAD completo.
2. **La compatibilità con il formato file** è il vincolo più duro: per aprire i `.val` esistenti
   serve replicare *esattamente* la semantica di valutazione (formule, variabili automatiche,
   ordine di ricalcolo, algoritmi delle curve) — non basta "somigliare".
3. **Tre sottosistemi senza equivalente browser pronto**: validazione XSD, export EPS/PS via
   binario esterno `pdftops`, e il nesting multithread dei pezzi.
4. **L'architettura di Seamly2D non va copiata**: usa il DOM XML come source of truth anche per
   l'undo — una riscrittura è una ri-progettazione, non una traduzione.

Stima d'ordine di grandezza: una riscrittura *completa e file-compatible* è un progetto
pluriennale per un team; un *sottoinsieme utile* (motore parametrico + editor con i 10–15 tool
più usati + export SVG/PDF) è fattibile in mesi. **[inferito — stima, non misurata]**

---

## 1. Cosa c'è dentro Seamly2D (verificato sul codice)

| Sottosistema | Dove | Dimensione / note |
|---|---|---|
| Motore parametrico (variabili, ricalcolo) | `src/libs/vpatterndb` (`VContainer`), `src/libs/ifc/xml/vabstractpattern.h` (`FullUpdateFromFile`, `LiteParseTree`) | Il pattern è un grafo di oggetti geometrici guidato da formule; al cambio di un valore l'albero viene ri-parsato |
| Parser di formule | `src/libs/qmuparser` (fork di muParser, statico) | ~30+ funzioni (`sin/cosD/atan2/log/…`), separatori decimali localizzati |
| Geometria | `src/libs/vgeometry` | Punti, linee, archi, archi ellittici, spline cubiche, spline path (Bézier) |
| Tool interattivi | `src/libs/vtools/tools` (57 .cpp), `src/libs/vtools/dialogs` (46 .cpp) | Ogni tool = classe grafica + dialog + comando undo |
| Undo/redo | `src/libs/vtools/undocommands` (52 file) | I comandi manipolano direttamente il DOM XML |
| Nesting (layout automatico pezzi) | `src/libs/vlayout` (~6.400 LOC) | Bin-packing custom con collision detection e parallelismo `QThreadPool` |
| Margini di cucitura | `VAbstractPiece::Equidistant` in `src/libs/vlayout/vabstractpiece.h` | Offset poligonale custom con correzione dei punti degeneri |
| Export DXF | `src/libs/vdxf` (libdxfrw vendorizzato) | Include **AAMA/ASTM** (formato industriale per plotter/taglio) |
| Export PS/EPS | `src/app/seamly2d/mainwindowsnogui.cpp` | Genera PDF e lo converte lanciando **`pdftops` (poppler) via `QProcess`** |
| Formati file | `src/libs/ifc/schema` | XML validato con **XSD via Xerces-C**; **49 versioni di schema** del formato pattern (v0.1.x → v0.7.4) + formati misure individuali/multisize + label template |
| App misure (SeamlyMe) | `src/app/seamlyme` | App separata: misure individuali e multisize (grading per taglie) |
| i18n | `share/translations` | 69 file .ts (Qt Linguist), sync Weblate |
| Auto-update | `src/libs/fervor` | Irrilevante sul web |
| Stampa | `QPrinter` + poster/tiling (`vposter.cpp`) | Stampa a scala fisica esatta, PDF affiancato multi-pagina |

Stack: C++14, Qt 6.8 (Widgets + QGraphicsScene, `xml svg printsupport network multimedia`), qmake.

---

## 2. Gli ostacoli, dal più duro al più morbido

### 2.1 Compatibilità del formato `.val` — l'ostacolo vero

Il formato pattern non è un formato di *dati* ma un formato di *programma*: contiene la sequenza
di operazioni di costruzione con formule che referenziano variabili generate automaticamente
dagli step precedenti (lunghezze di linee, angoli, lunghezze di curva, segmenti). Perché un file
esistente si apra e produca lo stesso cartamodello, il motore TypeScript deve replicare:

- la **semantica esatta di qmuParser** (precedenze, funzioni, gestione dei locale nei numeri);
- gli **algoritmi esatti delle curve** di `vgeometry` (parametrizzazione delle spline, calcolo
  lunghezze, punti di intersezione curva/asse — ci sono 6 famiglie di tool di intersezione);
- l'**ordine di ricalcolo** del grafo di dipendenze;
- la **catena di migrazione delle 49 versioni di schema**, se si vogliono aprire file storici.

Piccole divergenze numeriche cambiano il capo cucito. Nota positiva: sia `qreal` che `number`
JS sono double IEEE-754, quindi la precisione di base non è un problema; lo è la fedeltà
*algoritmica*. **[verificato l'impianto; l'entità dello sforzo è inferita]**

Se invece si accetta un **formato proprio con importer "best effort"**, questo ostacolo si
ridimensiona molto — ed è la scelta che suggerirei.

### 2.2 Volume della UI: è qui che vive il costo

57 tool + 46 dialog + 52 undo command + property explorer (`vpropertyexplorer`) + tutta
l'interazione su canvas (snapping, selezione, drag di control point delle spline, zoom/pan,
label trascinabili sui pezzi). `QGraphicsScene` non ha un equivalente completo nel browser:
Canvas2D/SVG/WebGL danno il rendering, ma scene graph con hit-testing, item transform,
z-ordering e eventi va costruito o preso da librerie (Pixi.js, Konva, paper.js — nessuna copre
tutto ciò che `QGraphicsScene` + `QGraphicsItem` offrono gratis). **[verificato il volume;
il gap delle librerie è inferito da conoscenza generale]**

### 2.3 Sottosistemi senza equivalente browser diretto

| Feature C++/Qt | Problema nel browser | Opzioni |
|---|---|---|
| Validazione XSD (Xerces) | Nessuna API nativa di validazione XSD nei browser | Riscrivere la validazione a mano (gli schemi sono controllati dal progetto, fattibile), oppure libxml2 compilato in WASM |
| Export EPS/PS via `pdftops` (QProcess) | Impossibile lanciare processi; poppler non gira nel browser | Rinunciare a EPS/PS, oppure conversione server-side, oppure Ghostscript WASM (esiste ma pesante) |
| Nesting con `QThreadPool` | Niente thread condivisi; è CPU-bound | Web Worker (parallelismo ok ma serializzazione dei dati), o riscrivere il core del nesting in Rust/WASM. In alternativa adottare un nesting esistente (algoritmo no-fit-polygon alla SVGnest/Deepnest) invece di portare quello custom |
| `QPrinter` / stampa a scala fisica | La stampa da browser non garantisce la scala | Generare PDF lato client (pdf-lib) con dimensioni fisiche esatte e far stampare il PDF — pattern già usato da FreeSewing **[inferito]** |
| Offset poligonale (`Equidistant`) | Algoritmo custom pieno di casi limite | Non portarlo: usare Clipper2 (anche in WASM), che è lo standard de-facto per polygon offsetting |
| DXF AAMA/ASTM | Nessuna lib JS matura per AAMA/ASTM **[non verificato: esistono writer DXF generici JS, la parte AAMA andrebbe scritta]** | La struttura AAMA è documentata; scrivere il writer sopra un serializzatore DXF JS è lavoro contenuto ma di nicchia |
| File system locale | Le web app non leggono/scrivono file liberamente | File System Access API (solo Chromium) o download/upload; cambia l'UX rispetto a un'app desktop |
| Font/metriche testo (label sui pezzi, testo in DXF) | Metriche font diverse da Qt | Ricalcolare layout label con misure canvas; divergenze estetiche accettabili |

### 2.4 Architettura da NON replicare

Due scelte di Seamly2D che una riscrittura non dovrebbe copiare (e quindi allontanano ancora di
più dal "porting"):

- **Il DOM XML è lo stato dell'applicazione**: i 52 undo command modificano `QDomElement` e
  l'app ri-parsa l'albero (`FullUpdateFromFile`/`LiteParseTree`). In TS la scelta naturale è uno
  state store immutabile con undo strutturale; il file XML diventa solo serializzazione.
- **Ricalcolo per ri-parsing** invece di un vero grafo reattivo di dipendenze: costoso e
  fragile; in una riscrittura si farebbe un DAG incrementale.

Conseguenza: quasi zero codice è "traducibile" meccanicamente; si riscrive la logica leggendo
quella vecchia come specifica.

### 2.5 Cose che invece NON sono un problema

- **La matematica**: spline cubiche, archi, intersezioni — tutto esprimibile in TS puro; float64
  identico.
- **Il parser di formule**: la grammatica di qmuParser è piccola; riscriverla (o adattare
  math.js/expr-eval con le funzioni gradi/radianti custom) è lavoro di giorni, non mesi.
- **SVG/PNG/PDF export**: il browser è *migliore* di Qt su SVG; PDF con pdf-lib.
- **i18n**: i .ts di Qt Linguist sono XML banale da convertire in cataloghi JS.
- **`network multimedia` / fervor**: usati per update check e suoni **[inferito per multimedia]**;
  irrilevanti sul web.
- **SeamlyMe**: le misure individuali/multisize sono dati tabellari + formule; sul web è la
  parte più facile.

---

## 3. Implicazioni pratiche (in ottica progetto tuo)

1. **Non conviene un "port" 1:1.** Il valore di Seamly2D per una riscrittura è come *specifica
   di dominio* (quali tool servono, come funziona il grading, formato AAMA, semantica delle
   formule) — non come codice sorgente. Anche la licenza spinge in questa direzione: Seamly2D è
   **GPLv3** (LICENSE nel repo), quindi qualunque derivazione del codice vincola il progetto web
   a GPL; una reimplementazione clean-room no.
2. **La strada corta resta quella già individuata** nella ricerca precedente: un core parametrico
   esistente e permissivo come **@freesewing/core (MIT)** — che è già "Seamly2D senza UI, in JS"
   come modello concettuale (misure → costruzione parametrica → SVG) — più un editor visuale
   proprio. Gli ostacoli §2.2 (UI) restano tutti, ma spariscono §2.1 (formato) e mezza §2.3.
3. **Se l'obiettivo è la compatibilità con l'ecosistema Seamly2D** (aprire i .val della
   community), il costo è dominato dalla fedeltà del motore (§2.1) e va messo in conto un
   lungo lavoro di golden-testing: file .val reali → confronto geometrico output C++ vs TS.
4. **Ordine di attacco sensato per un MVP web** (se si parte): motore formule + geometria +
   ricalcolo DAG (testabile headless) → canvas editor con i tool "punto/linea/intersezione/
   spline" → pezzi + margini via Clipper2 → export SVG/PDF → nesting (ultimo: è il più costoso
   e il meno indispensabile all'inizio).

---

## 4. Inventario feature come user stories

Elenco delle funzionalità di Seamly2D estratto dal sorgente (classi tool in `src/libs/vtools/tools`,
dialog in `src/libs/vtools/dialogs` e `src/app/*/dialogs`, enum `LayoutExportFormat` in
`src/libs/vmisc/def.h`). Persona: **la modellista** (pattern maker). Le storie sono raggruppate
per epic; la colonna "Fonte" indica dove la feature vive nel codice C++.

### Epic A — Misure (SeamlyMe)

| ID | User story | Fonte |
|---|---|---|
| A1 | Come modellista, voglio creare un file di **misure individuali** (.vit) di una persona, per usarle nelle formule del cartamodello | `src/app/seamlyme`, schema `individual_size_measurements` |
| A2 | Come modellista, voglio creare **tabelle multisize** (.vst) con valore base e incrementi per taglia/altezza, per graduare lo stesso modello su più taglie | `tmainwindow.h` (`OpenMultisize`), schema `multi_size_measurements` |
| A3 | Come modellista, voglio scegliere le misure da un **database di misure note** (con codici standard e diagrammi del corpo), per non inventare nomi e sapere dove si prende ogni misura | `dialogmdatabase` |
| A4 | Come modellista, voglio definire misure **calcolate con formule** che dipendono da altre misure, per derivare valori composti | parser qmuParser condiviso |
| A5 | Come modellista, voglio lavorare in **cm, mm o pollici**, per usare il mio sistema di unità | preferenze + `def.h` (unit) |

### Epic B — Disegno parametrico (modalità Draft)

| ID | User story | Fonte |
|---|---|---|
| B1 | Come modellista, voglio creare **blocchi di disegno** multipli nello stesso file, ognuno con un punto base, per organizzare corpetto/manica/gonna separatamente | `vtoolbasepoint` |
| B2 | Come modellista, voglio piazzare **punti derivati da altri punti**: a distanza+angolo (endline), lungo una linea (alongline), su normale, su bisettrice, su perpendicolare da un punto (height), su spalla (shoulder point), a contatto con un cerchio (point of contact), come terzo vertice di un triangolo, alle coordinate X/Y di altri due punti | `vtoolendline`, `vtoolalongline`, `vtoolnormal`, `vtoolbisector`, `vtoolheight`, `vtoolshoulderpoint`, `vtoolpointofcontact`, `vtooltriangle`, `point_intersectxy_tool` |
| B3 | Come modellista, voglio **ogni valore numerico come formula** che referenzia misure, variabili custom e grandezze generate dagli step precedenti (lunghezze/angoli di linee, lunghezze di curve e segmenti), così il modello si adatta da solo a misure diverse | qmuParser + `VContainer` + `dialogvariables` (`fillLineLengths/LineAngles/CurveLengths`) |
| B4 | Come modellista, voglio tracciare **linee** tra punti con stile e colore configurabili | `vtoolline` |
| B5 | Come modellista, voglio tracciare **curve**: archi (per angoli o per lunghezza), archi ellittici, spline semplici, spline path a più nodi, Bézier cubiche e percorsi di Bézier, con maniglie di controllo trascinabili | `vtoolarc`, `vtoolarcwithlength`, `vtoolellipticalarc`, `vtoolspline`, `vtoolsplinepath`, `vtoolcubicbezier`, `vtoolcubicbezierpath` |
| B6 | Come modellista, voglio trovare **punti di intersezione**: linea/linea, linea/asse, curva/asse, cerchio/cerchio, cerchio/tangente, arco/arco, curva/curva, arco/tangente | `vtoollineintersect`, `vtoollineintersectaxis`, `vtoolcurveintersectaxis`, `intersect_circles_tool`, `intersect_circletangent_tool`, `vtoolpointofintersectionarcs`, `vtoolpointofintersectioncurves`, `vtoolpointfromarcandtangent` |
| B7 | Come modellista, voglio **tagliare** archi, spline e spline path in un punto a distanza data, ottenendo due segmenti riutilizzabili nelle formule | `vtoolcutarc`, `vtoolcutspline`, `vtoolcutsplinepath` |
| B8 | Come modellista, voglio **operazioni su gruppi di oggetti**: rotazione, traslazione (move), specchiatura rispetto a una linea o a un asse | `operation/vtoolrotation`, `vtoolmove`, `mirror/vtoolmirrorbyline`, `vtoolmirrorbyaxis` |
| B9 | Come modellista, voglio il tool **true darts** per riposizionare correttamente le gambe di una pince | `vtooltruedarts` |
| B10 | Come modellista, voglio organizzare gli oggetti in **gruppi con visibilità** on/off, per gestire disegni complessi | `AddGroup`/`DelGroup`/`*GroupItem` undo commands, `groups_widget` |
| B11 | Come modellista, voglio importare un'**immagine di sfondo** (es. scan di un cartamodello) da ricalcare | `handleImageTool`, `ImageItem` in `mainwindow.h` |
| B12 | Come modellista, voglio vedere la **cronologia ordinata degli step di costruzione** e navigarla, per capire e correggere il modello | `history_dialog` |
| B13 | Come modellista, voglio una **tabella delle variabili** (misure, incrementi custom, lunghezze/angoli generati) e una **calcolatrice** di formule, per ispezionare i valori correnti | `dialogvariables`, `calculator_dialog` |
| B14 | Come modellista, voglio **undo/redo illimitato** su ogni operazione | 52 classi in `vtools/undocommands` |

### Epic C — Pezzi del cartamodello (modalità Piece)

| ID | User story | Fonte |
|---|---|---|
| C1 | Come modellista, voglio comporre un **pezzo** selezionando in sequenza punti e curve del disegno, per ottenere il contorno del pezzo da taglio | `pattern_piece_tool`, `vpiece`/`vpiecenode` |
| C2 | Come modellista, voglio il **margine di cucitura** generato automaticamente, con larghezza globale, override per singolo nodo e regole d'angolo, oppure "built-in" se già disegnato | `VAbstractPiece::Equidistant`, `SetSeamAllowance(BuiltIn)` |
| C3 | Come modellista, voglio le **tacche (notches)** sui bordi del pezzo, per allineare i pezzi in cucitura | `Notch` in `vpiecenode.h` |
| C4 | Come modellista, voglio **percorsi interni** al pezzo (pieghe, linee di cucitura interne, decorazioni) | `internal_path_tool` |
| C5 | Come modellista, voglio **punti di ancoraggio** (anchor points) sul pezzo per bottoni/marche | `anchorpoint_tool` |
| C6 | Come modellista, voglio il **filo (grainline)** con direzione e frecce configurabili | `floatItemData/vgrainlinedata` |
| C7 | Come modellista, voglio **etichette su pezzo e cartamodello** con placeholder dinamici (nome, taglia, data, quantità di taglio…), posizionabili e ruotabili sul pezzo | `vtextmanager`, `floatItemData` |
| C8 | Come modellista, voglio **unire due pezzi** in uno (union), per costruire trasformazioni di modello | `union_tool` |

### Epic D — Piazzamento (modalità Layout)

| ID | User story | Fonte |
|---|---|---|
| D1 | Come modellista, voglio il **piazzamento automatico (nesting)** dei pezzi sul tessuto, per minimizzare lo sfrido | `vlayoutgenerator`, `vposition`, `vbank` |
| D2 | Come modellista, voglio configurare il piano di taglio: **formati carta e rotoli tessuto** (30/36/42/44in, custom), margini, gap tra pezzi, rotazioni consentite, pagine unite | `layoutsettings_dialog`, enum `PaperSizeTemplate` |
| D3 | Come modellista, voglio vedere l'**avanzamento del nesting** (è calcolo pesante, parallelizzato) e poterlo annullare | `dialoglayoutprogress`, `QThreadPool` |

### Epic E — Export e stampa

| ID | User story | Fonte |
|---|---|---|
| E1 | Come modellista, voglio esportare il layout in **SVG, PDF, PNG, JPG, BMP, PPM, TIF, OBJ** | enum `LayoutExportFormat` |
| E2 | Come modellista, voglio il **PDF affiancato (tiled)** su fogli A4/Letter con crocini, per stampare a casa e incollare i fogli a scala reale | `PDFTiled`, `vposter` |
| E3 | Come modellista, voglio esportare **PS/EPS** per flussi di stampa professionali | via `pdftops` esterno |
| E4 | Come professionista, voglio esportare **DXF** in 9 versioni AutoCAD (R10→2013), in variante **flat, AAMA e ASTM**, per mandare i pezzi a plotter e macchine da taglio industriali | `LayoutExportFormat` DXF_*, `vdxfengine` |
| E5 | Come modellista, voglio **stampare** direttamente (anche tiled) a scala fisica esatta, con anteprima | `QPrinter`, `mainwindowsnogui` |

### Epic F — File, formato e piattaforma

| ID | User story | Fonte |
|---|---|---|
| F1 | Come modellista, voglio salvare il cartamodello in un **formato aperto XML (.val)** validato da schema, separato dai file misure, per riusare lo stesso modello con misure diverse | `ifc/schema/pattern` (49 versioni XSD) |
| F2 | Come modellista, voglio che i **file di versioni vecchie si aprano ancora** (migrazione automatica dello schema) | catena di converter in `ifc` |
| F3 | Come utente, voglio l'app nella **mia lingua** (decine di lingue) con separatori decimali locali nelle formule | 69 file .ts, qmuParser locale-aware |
| F4 | Come utente, voglio **preferenze** (unità, tema, comportamenti), **scorciatoie configurabili** e una schermata di benvenuto | `dialogpreferences`, `shortcuts_dialog`, `welcome_dialog` |
| F5 | Come utente desktop, voglio l'**auto-update** dell'app | `fervor` (irrilevante sul web) |

Copertura: la tabella copre tutti i 57 tool e i dialog principali; non scendono a user story
le funzioni di contorno (about, decimal chart, pattern properties, zoom/pan/pan della vista).

---

## 5. Scope selezionato per l'app custom (decisioni del 2026-07-13)

Selezione interattiva sulle feature dell'inventario §4, nell'ottica di un'app **consumer**
molto più semplice di Seamly2D. Visione dichiarata:

> "l'idea è quella di lasciare l'utente inserire le proprie misure in un form e computare il
> cartamodello eventuale su quei parametri, in modo molto più semplice che seamly"

> "come prima iterazione, i cartamodelli non saranno costruibili dall'app, ma solo caricabili
> da me e resi disponibili come modelli parametrici all'utente"

Modello di prodotto: **catalogo di cartamodelli parametrici authored in codice dal maintainer;
l'utente finale inserisce solo le misure e scarica il printable**. È il modello FreeSewing,
non il modello Seamly (CAD per modellisti) — l'intero Epic B come UI utente decade.

### IN — v1

| Area | Scelta | Note |
|---|---|---|
| Misure | Misure individuali via form | Un solo set aggregato di misure per utente, sempre modificabile; niente multisize, niente database misure, niente misure-formula |
| Motore | Tutto-è-formula (parametrico) | Il motore valuta i modelli parametrici sulle misure utente; è il cuore tecnico anche senza UI di costruzione |
| Pezzi | Margini, tacche, grainline/interni, etichette: **tutti opzionali** | "tutto opzionale: l'utente sceglie cosa visualizzare nel printable" — layer toggleabili |
| Visibilità | Gruppi/layer con visibilità | Riletto in chiave consumer: customizzazione di cosa finisce nel printable |
| Output | **PDF tiled** per stampa casalinga | Multi-pagina A4/Letter con crocini; unico output v1 |
| Layout | Impaginazione automatica semplice | Pezzi distribuiti sulle pagine senza sovrapposizioni; niente nesting ottimizzato |
| Pipeline | Authoring pattern in codice (maintainer) | Stile FreeSewing: niente editor visuale da costruire in v1 |
| Persistenza | Salvataggio misure utente | Le misure persistono e si riapplicano a ogni modello del catalogo |

### OUT (v1)

- CAD di costruzione per l'utente (tutti i 57 tool, dialog, undo di costruzione, history, calcolatrice, variabili)
- Multisize/grading, database misure note, misure calcolate
- Nesting ottimizzato su tessuto e piano di taglio configurabile
- DXF (flat/AAMA/ASTM), PS/EPS, stampa diretta, SVG/PDF a foglio singolo
- Import/compatibilità .val, XSD, migrazione schemi
- i18n (hub già all-English), anteprima live durante l'editing misure (non selezionata), auto-update, immagine di sfondo, union, true darts

### Conseguenze sull'analisi degli ostacoli

Con questo scope, degli ostacoli di §2 sopravvivono solo: il motore parametrico (ma senza
vincolo di fedeltà .val → §2.1 decade), l'offset dei margini (Clipper2), la generazione PDF
tiled a scala fisica (pdf-lib) e un'impaginazione banale. Gli ostacoli grossi (§2.2 UI CAD,
XSD, EPS/pdftops, nesting multithread) sono tutti fuori scope. La raccomandazione
`@freesewing/core` + renderer proprio copre quasi tutto lo scope v1.

---

## 6. FreeSewing e un futuro CAD di costruzione: analisi di compatibilità

> Domanda (2026-07-13): se la v1 nasce sul modello FreeSewing (§5), un'evoluzione futura verso
> una versione con **CAD di costruzione** (l'utente crea/modifica cartamodelli visualmente,
> alla Seamly) resta possibile o il modello va stretto?
> Analisi verificata empiricamente su **@freesewing/core 4.10.0** (MIT) installato e ispezionato.

### 6.1 Il nodo architetturale: pattern-as-code vs pattern-as-data

- In FreeSewing un pattern è **codice**: ogni part ha una funzione `draft()` JS che riceve
  `{Point, Path, points, paths, measurements, options, macro, sa, …}` e costruisce la geometria
  imperativamente (verificato in `part.mjs`, `Part.prototype.shorthand`).
- Un CAD richiede il pattern come **dato**: una lista serializzabile di step di costruzione
  (è esattamente ciò che è un file .val di Seamly), che si possa editare, annullare, rivalutare.

Quindi un CAD non si costruisce "dentro" il modello di authoring FreeSewing — ma **sopra**:
si definisce un **op-set dichiarativo proprio** (JSON: `{tipo: "pointAtDistanceAngle", from:
"A", dist: "waist/4+2", angle: 90, id: "B"}`…) e un **interprete che è un unico design
FreeSewing generico**: la sua `draft()` legge la lista di op e la esegue chiamando i primitivi
di core. Il CAD edita il JSON; ogni modifica → re-draft → re-render. Undo/redo = operazioni
sulla lista, non sul motore.

### 6.2 I primitivi ci sono già (verificato sull'API)

Mappa tool Seamly → primitivi `@freesewing/core` (da `index.mjs`, `point.mjs`, `path.mjs`):

| Famiglia tool Seamly | Primitivo FreeSewing |
|---|---|
| Punti derivati (endline, alongline, shift…) | `Point.shift/shiftTowards/shiftFractionTowards/shiftOutwards/rotate/flipX/flipY/translate` |
| Intersezioni linea/linea, linea/asse | `linesIntersect, beamsIntersect, beamIntersectsX/Y` |
| Intersezioni con cerchi e tangenti | `circlesIntersect, lineIntersectsCircle, beamIntersectsCircle` |
| Intersezioni con curve | `curvesIntersect, curveIntersectsX/Y, lineIntersectsCurve, Path.intersects/intersectsX/intersectsY/intersectsBeam` |
| Taglio di curve (cut arc/spline) | `splitCurve, Path.split/divide/trim, pointOnCurve` |
| Punto lungo percorso | `Path.shiftAlong/shiftFractionAlong, measureAlong` |
| Archi | `Path.circleSegment` (approssimazione Bézier), `utils` circle |
| Margini di cucitura | `Path.offset(distance)` — built-in |
| Curve spline/Bézier | `Path.curve/curve_/_curve/smurve`, classe `Bezier` (bezier-js) |
| Specchiature/rotazioni di gruppi | `Path.rotate/translate/reverse`, `flipX/flipY`, `generateStackTransform` |
| Grainline, tacche, etichette | plugin ufficiali (`plugin-annotations`: title, grainline, notches…) |

La copertura dei 57 tool Seamly a livello *geometrico* è pressoché totale. Manca l'**arco
ellittico** come primitiva nativa (approssimabile con Bézier) — unico gap geometrico rilevato.

### 6.3 Cosa FreeSewing NON dà (e sarebbe comunque tuo, con qualunque motore)

1. **Parser di formule user-facing**: in FS le espressioni sono JS. Il CAD ha bisogno di un
   linguaggio formule per l'utente (`waist/4+2`); va scritto/adottato un parser la cui
   valutazione produce i numeri passati ai primitivi. Pezzo nuovo, ma indipendente dal motore.
2. **Grafo di dipendenze a livello di punto**: FS traccia dipendenze solo tra *part*
   (`from`/`after`, `resolvedDependencies`, `draftOrder` — verificato in `pattern-config.mjs`).
   Il CAD deve sapere "chi referenzia il punto B" (per warning su delete, rename, drag).
   Siccome l'op-set è un dato tuo, il grafo si ricava banalmente dalle referenze nel JSON.
3. **Ricalcolo incrementale**: FS ri-drafta tutto a ogni modifica. **Benchmark empirico
   (Node 22, M-series): Aaron (canotta, 5 part) = ~1,1 ms/draft, ~1,9 ms draft+render SVG.**
   Anche un pattern 10× più complesso sta comodamente nel budget di un frame (16 ms) →
   il full re-draft regge perfino il drag interattivo. Il ricalcolo incrementale non serve.
4. **Editor interattivo** (hit-testing, maniglie, snapping): FS produce SVG statico, ma
   `asRenderProps()` su Point/Path espone la geometria strutturata per un renderer/editor
   proprio. Questo era "la parte nuova" fin dalla ricerca iniziale, con o senza CAD.

### 6.4 Lock-in: quanto costa cambiare idea dopo

L'asset strategico è l'**op-set JSON**, che è tuo e engine-agnostic: l'interprete che lo esegue
su FreeSewing è sottile (una funzione per tipo di op). Se un domani core diventasse limitante,
si ri-targetta l'interprete su un motore geometrico proprio senza toccare né i file pattern né
il CAD. FreeSewing è un **backend di esecuzione sostituibile**, non una prigione. (MIT, attivo
su Codeberg — rischio di abbandono mitigabile con fork/vendoring, è puro JS senza dipendenze
native.)

### 6.5 Verdetto e raccomandazione

**Sì, il modello FreeSewing è compatibile con l'evoluzione CAD** — a una condizione
architetturale: **introdurre presto il livello pattern-as-data**. Il rischio non è FreeSewing,
è accumulare un catalogo di pattern scritti come `draft()` JS libere: quelle non sono
"liftabili" automaticamente a op-list, e andrebbero riscritte a mano quando arriva il CAD.

Raccomandazione pratica:
- **v1**: costruire subito il **thin op-interpreter** (costo contenuto: è un `switch` sui tipi
  di op che chiama i primitivi §6.2) e scrivere i pattern del catalogo **come dati** (op-list
  JSON/TS tipizzato), non come funzioni draft libere. FreeSewing resta sotto come motore.
- **v2 (CAD)**: l'editor visuale genera/edita le stesse op-list. Undo, history ("cronologia di
  costruzione" alla Seamly, feature B12), gruppi di visibilità e formule arrivano naturali
  perché il formato è già una sequenza di step referenziati.
- Il parser di formule conviene introdurlo già in v1 solo se i pattern ne beneficiano; altrimenti
  in v2 (le op-list v1 possono usare espressioni pre-calcolate).

**Verificato**: API core 4.10.0 (primitivi, offset, dipendenze part-level, shorthand,
asRenderProps), benchmark di draft, licenza MIT. **Inferito**: costo "contenuto"
dell'interprete, assenza di lib per archi ellittici nativi nell'ecosistema plugin.

---

## 7. Riepilogo verificato / inferito

- **Verificato sul codice**: dimensioni (257k LOC, 57 tool, 46 dialog, 52 undo, 49 schemi XSD,
  69 traduzioni), uso di Xerces/XSD, `pdftops` via QProcess, `QThreadPool` nel nesting,
  offset custom `Equidistant`, export AAMA/ASTM, undo basato su DOM XML, ricalcolo via
  ri-parsing, GPLv3, Qt 6.8/C++14/qmake.
- **Inferito**: stime di effort, maturità delle alternative JS (Clipper2 JS/WASM, pdf-lib,
  assenza di lib AAMA JS), comportamento di FreeSewing sulla stampa a scala.
