# Gorlium

Gorlium is a personal web application about terrariums. It ships with its own
in-house **design system** built in a *digital brutalism* style — dark
background, hard edges, stark borders and hard-offset shadows, monospace
typography.

The component library is authored locally and kept in sync with a
[Claude Design](https://claude.ai/design) project (via the `/design-sync`
workflow) used as the design canvas and preview surface.

## Technologies: **React, TypeScript, Vite, TurboRepo**

## Project Structure

```
.
├── packages/
│   ├── app/                # React app (pages, routing, i18n)
│   │   ├── src/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── design-system/      # @gorlium/design-system — proprietary, no external DS
│   │   ├── src/
│   │   │   ├── tokens/      # design tokens (CSS custom properties)
│   │   │   ├── styles.css   # global .g-* component styles
│   │   │   ├── primitives/  # Box, Stack, Inline, Tiles, Text, Button, Link
│   │   │   ├── form/        # Form, FormSection, TextField, TextArea
│   │   │   ├── provider/    # GorliumProvider (theme scope)
│   │   │   └── components/  # Header, Banner, PostSection, GorliumImage, Card, Badge, Callout, Tabs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (>= 20)
- PNPM (>= 8)

### Installation

```sh
git clone https://github.com/GorlemZ/gorlium.git
cd gorlium
pnpm install
```

### Running the Application

```sh
pnpm start
```

This starts the design-system watcher and the app dev server via Turbo.
Use `pnpm build` to produce a production build.

## Design system

`@gorlium/design-system` is fully self-contained: design tokens live in
`src/tokens/tokens.css`, component styling in `src/styles.css` (namespaced
`.g-*` classes), and the public API (primitives, form fields, layout and custom
components) is re-exported from `src/index.ts`. Wrap the app in
`<GorliumProvider>` to apply the theme scope.

## Deployment

Deployment is handled automatically by Netlify via the Netlify GitHub App
integration: pushing to `main` triggers a build and deploy. Build settings and
environment variables are configured in the Netlify dashboard or `netlify.toml`.
