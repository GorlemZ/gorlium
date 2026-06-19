# design-sync notes — @gorlium/design-system

Repo-specific gotchas for future syncs.

## Build / converter
- Shape: **package** (React lib built with tsup/esbuild; no Storybook).
- Built ESM entry: `packages/design-system/dist/index.mjs`; bundled CSS: `dist/index.css` (tokens + `.g-*` styles in one file).
- Build command: `pnpm -F "@gorlium/design-system" build` (tsup `--minify --clean`). Use `COREPACK_ENABLE_STRICT=0` to avoid corepack pnpm self-provisioning.
- Converter `--entry` resolves relative to **cwd (repo root)** — pass `./packages/design-system/dist/index.mjs`, not `./dist/...`.
- `--node-modules ./packages/design-system/node_modules` (react/react-dom resolve there).
- 20 component value exports (incl. `Column` and the `GorliumProvider` wrapper). `LanguageSwitch` is NOT exported from index (internal to Header) → not in bundle.

## Provider / styling idiom
- All components must render inside **`GorliumProvider`** (renders `<div className="g-root">`), which applies the dark brutalist scope: `--g-bg` background, `--g-ink` text, mono font, box-sizing. `cfg.provider.component = "GorliumProvider"`.
- Styling idiom: namespaced global `.g-*` classes (NOT CSS modules, NOT utility classes). Components style themselves; consumers compose via props.
- Tokens are CSS custom properties `--g-*` (colors, `--g-space-*` scale, `--g-bw` border width, `--g-radius` 0px, `--g-shadow` hard-offset). Defined in `dist/index.css`.

## Fonts
- Space Grotesk (display) + Space Mono (body) load via a **remote Google Fonts `@import`** in tokens.css → `[FONT_REMOTE]`, loads at runtime. No fonts shipped. No action.

## Render check
- **Render check SKIPPED this run** (user declined Playwright/Chromium ~200MB install). Bundle built + validated with `--no-render-check`; structural checks (dscard, css imports, fonts, anchor) all passed. Previews were NOT machine-verified — relied on served `.review.html` for visual review in the user's own browser.

## Render-quality risks (re-sync watch-list)
- **`vh`-based font sizes**: typography (`.g-title`, `.g-body`) and many sizes use `vh` units (e.g. `font-size: 4vh`). Preview cards with small/large viewports will render text proportionally tiny/huge. Author previews with a sane card viewport in mind.
- **`GorliumImage` `path` prop**: loads images from the app's asset paths — images will NOT resolve in previews. Author with placeholder-friendly framing or skip image-dependent stories.
- **`Header` / `PostSection`**: compound components expecting structured data (list of [label,href], text arrays) — compose from real app page examples.

## Scope decision (this run)
- Started minimal (floor cards), then authored **rich previews for all 20 components** in `.design-sync/previews/*.tsx` (committed). Stories ported from the app pages (Homepage/Lore/Terrariums/Dev/Instructions/Contacts) + locales.
- Conventions header authored (`.design-sync/conventions.md`, wired via `readmeHeader`) — teaches the Claude Design agent the provider wrap + `.g-*` idiom + tokens.
- Previews compile clean (20 user-owned, 0 failed) but were **NOT machine-verified** (render check skipped — no Playwright). Reviewed via local `.review.html`. Image-based previews (PostSection/GorliumImage) use an inline SVG data-URI placeholder since app asset paths don't resolve in cards.

## Re-sync risks
- If Playwright is installed on a future run, drop `--no-render-check` to machine-verify previews. The driver (`resync.mjs`) chains capture which needs Playwright — without it, run `package-build.mjs` + `package-validate.mjs --no-render-check` manually instead of the one-command driver.
- This is a **one-way** sync (repo → Claude Design component library). UI designs produced IN Claude Design must be brought back to the repo manually.
