# Gorlium design system — conventions

Digital-brutalism React component library. Dark canvas, hard edges (0px radius), 2px borders, hard-offset shadows (no blur), acid-lime + terracotta accents, monospace/grotesk type. Build with the components below — never hand-roll lookalikes.

## Wrapping (required)

Every screen must be wrapped in **`<GorliumProvider>`**. It renders `<div className="g-root">`, which applies the dark background (`--g-bg`), default ink color (`--g-ink`), the monospace font, and `box-sizing: border-box` to everything inside. Without it components render on a white page in a default serif font — broken.

```jsx
import { GorliumProvider, Stack, Title, Body, Button } from "@gorlium/design-system";

<GorliumProvider>
  <Stack space={24} align="center">
    <Title size="large">GORLIUM</Title>
    <Body size="medium">A tiny self-contained ecosystem.</Body>
    <Button label="SEND" kind="solid" onPress={() => {}} />
  </Stack>
</GorliumProvider>
```

## Styling idiom

The DS styles itself through **namespaced global `.g-*` classes** (NOT CSS modules, NOT utility classes). You do not write `.g-*` classes — components emit them. Style your own layout glue with inline styles or by composing the layout primitives. Do not invent a class vocabulary; there is none to invent.

Design tokens are CSS custom properties on `:root` (read them with `var(--…)` for any custom styling):

- **Colors**: `--g-bg` `#0b0b0b`, `--g-surface` `#141414`, `--g-surface-2` `#1c1c1c`, `--g-ink` `#ececec`, `--g-ink-dim` `#8a8a8a`, `--g-accent` `#c9f24d` (acid lime), `--g-accent-2` `#ff5a1f` (terracotta), `--g-border` `#2e2e2e`, `--g-border-strong` `#ececec`.
- **Shape**: `--g-radius` `0px`, `--g-bw` `2px` (border width), `--g-shadow` `4px 4px 0 0 var(--g-ink)`, `--g-shadow-accent` `4px 4px 0 0 var(--g-accent)`.
- **Type**: `--g-font-display` ("Space Grotesk"), `--g-font-mono` ("Space Mono"). Loaded at runtime from Google Fonts.
- **Space scale** (use for `space`/`gap` props and custom spacing): `--g-space-0/4/8/12/16/24/32/40/80`.

Note: typography (`Title`, `Body`) sizes in `vh` units — they scale with viewport height.

## Components

- **Layout primitives**: `Box` (padding/width/height props), `Stack` (vertical, `space`, `align`, `dividers`), `Inline` (horizontal, `space`, `alignY`, `collapseBelow`), `Columns` + `Column` (`width`: `"content"` | `"1/2"` | px), `Tiles` (responsive grid, `columns`).
- **Type**: `Title` (`size`: large/medium/small, `align`), `Body` (`size`: small/medium/large, `align`).
- **Actions**: `Button` (`label`, `kind`: solid/transparent, `hierarchy`, `size`: medium/large, `onPress`, optional `icon`), `Link` (`href`, `children`).
- **Form**: `Form` (`title`, `description`, `error`, `submitButton: {label, onPress}`), `FormSection`, `TextField` (`label`, `value`, `onChange`), `TextArea` (+ `rows`).
- **Composite**: `Header` (`list: [label, href][]` nav), `Banner` (scrolling marquee, wraps children), `PostSection` (`title` + `text: string[]` + optional `imgPath`/`imgSize`/`imgAlignRight`), `GorliumImage` (`path`, `opacity`, overlay `children`), `WeirdFlex` (centered column flex, `gap`).

Read each component's `<Name>.d.ts` for its exact prop contract and `<Name>.prompt.md` for usage before composing. The full styling source is in `_ds_bundle.css` (reachable from `styles.css`).
