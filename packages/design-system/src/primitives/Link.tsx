import { AnchorHTMLAttributes, ReactNode } from "react";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  href: string;
}

export function Link({ children, href, className, ...rest }: LinkProps) {
  return (
    <a href={href} className={["g-link", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </a>
  );
}

export default Link;
