import { Banner, Title } from "@gorlium/design-system";

// Banner scrolls its children horizontally (marquee). Static capture shows the
// repeated content tiled across the width.
export const Welcome = () => (
  <Banner>
    <Title size="medium">| WELCOME TO THE GORLIUM |</Title>
  </Banner>
);
