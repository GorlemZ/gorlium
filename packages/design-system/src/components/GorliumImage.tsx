import type { FC, ReactNode } from "react";
import { Box } from "../primitives/Box";

interface GorliumImageProps {
  path: string;
  opacity?: number;
  children?: ReactNode;
  height?: string;
}

const GorliumImage: FC<GorliumImageProps> = ({
  path,
  opacity = 1,
  children,
  height,
}) => {
  return (
    <Box
      style={{
        position: "relative",
        height: height ? height : "100%",
        maxHeight: "80vh",
        objectFit: "contain",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <img
        src={path}
        style={{
          width: "100%",
          opacity: opacity,
          objectFit: "contain",
        }}
      />
      {children && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

export default GorliumImage;
