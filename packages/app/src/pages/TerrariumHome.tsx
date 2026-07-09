import { useEffect } from "react";
import { Box, GorliumImage } from "@gorlium/design-system";
import terrario2 from "../assets/Terrario2.png";
import logo from "../assets/croppedLogoDark.png";
import { preloadImage } from "../lib/preloadImage";

// Landing hero of the terrarium area (mounted at /terrariums).
function TerrariumHome() {
  useEffect(() => {
    preloadImage(terrario2);
    preloadImage(logo);
  }, []);

  return (
    <Box
      style={{
        overflow: "hidden",
      }}
    >
      <GorliumImage path={terrario2} opacity={0.85}>
        <GorliumImage path={logo} />
      </GorliumImage>
    </Box>
  );
}

export default TerrariumHome;
