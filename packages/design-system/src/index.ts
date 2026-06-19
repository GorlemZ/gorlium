// Gorlium design system — digital brutalism. Self-contained, no Bento.
import "./tokens/tokens.css";
import "./styles.css";

// Primitives
export * from "./primitives/Box";
export * from "./primitives/Stack";
export * from "./primitives/Inline";
export * from "./primitives/Tiles";
export * from "./primitives/Text";
export * from "./primitives/Button";
export * from "./primitives/Link";

// Form
export * from "./form/Form";
export * from "./form/FormSection";
export * from "./form/TextField";
export * from "./form/TextArea";

// Types
export * from "./types";

// Provider
export { default as GorliumProvider } from "./provider/GorliumProvider";

// Components
import Header from "./components/Header";
export { Header };

import GorliumImage from "./components/GorliumImage";
export { GorliumImage };

import Banner from "./components/Banner";
export { Banner };

import PostSection from "./components/PostSection";
export { PostSection };

export * from "./components/Card";
export * from "./components/Badge";
export * from "./components/Callout";
export * from "./components/Tabs";
