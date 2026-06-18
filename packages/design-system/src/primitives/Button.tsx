import { ReactNode } from "react";
import { IconProps } from "../types";

export interface ButtonProps {
  label: ReactNode;
  kind?: "solid" | "transparent";
  hierarchy?: "primary" | "secondary";
  size?: "medium" | "large";
  onPress?: () => void;
  icon?: (props: IconProps) => ReactNode;
}

const iconSize: Record<string, number> = { medium: 16, large: 24 };

export function Button({
  label,
  kind = "solid",
  size = "medium",
  onPress,
  icon,
}: ButtonProps) {
  const classes = ["g-btn", `g-btn--${kind}`];
  if (size === "large") classes.push("g-btn--large");

  return (
    <button type="button" className={classes.join(" ")} onClick={onPress}>
      {icon ? icon({ size: iconSize[size] ?? 16 }) : null}
      {label}
    </button>
  );
}

export default Button;
