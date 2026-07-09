import type { ReactNode } from "react";

export interface FormSectionProps {
  children?: ReactNode;
}

export function FormSection({ children }: FormSectionProps) {
  return <div className="g-form-section">{children}</div>;
}

export default FormSection;
