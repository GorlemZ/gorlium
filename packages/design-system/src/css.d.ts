// Global CSS is imported as a side effect from src/index.ts (tokens + styles).
// tsc 5.x tolerated these imports; the native compiler (TS7/tsgo) resolves
// side-effect imports too and needs a module declaration for *.css.
// The app doesn't need this — vite/client already declares "*.css".
declare module "*.css";
