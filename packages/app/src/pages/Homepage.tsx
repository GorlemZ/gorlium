import { useEffect } from "react";
import { Box, GorliumImage } from "@gorlium/design-system";
import terrario2 from "../assets/Terrario2.png";
import logo from "../assets/croppedLogoDark.png";

function preloadImage(url: string) {
  const img = new Image();
  img.src = url;
}

function Homepage() {
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

export default Homepage;
