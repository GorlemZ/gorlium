import type { ReactNode } from "react";

export interface GorliumProviderProps {
  children?: ReactNode;
}

// Replaces Bento's BentoProvider. Applies the dark brutalist theme scope.
// (Design tokens and component styles are imported once from the package index.)
export function GorliumProvider({ children }: GorliumProviderProps) {
  return <div className="g-root">{children}</div>;
}

export default GorliumProvider;
