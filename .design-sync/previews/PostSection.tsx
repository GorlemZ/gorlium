import { PostSection } from "@gorlium/design-system";

const IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360'%3E%3Crect width='100%25' height='100%25' fill='%231c1c1c'/%3E%3Crect x='10' y='10' width='460' height='340' fill='none' stroke='%23c9f24d' stroke-width='4'/%3E%3Ctext x='50%25' y='50%25' fill='%23c9f24d' font-family='monospace' font-size='30' text-anchor='middle' dominant-baseline='middle'%3ETERRARIUM%3C/text%3E%3C/svg%3E";

export const TextOnly = () => (
  <PostSection
    title="20 Jan 2025 — Not yet started, already changed"
    text={[
      "SO. Here I am, trying my best to develop this website.",
      "What started as a simple frontend exercise has somehow morphed into the hub for all my hobbies. 🤷",
    ]}
  />
);

export const WithImage = () => (
  <PostSection
    title="The right mixture"
    imgPath={IMG}
    imgSize="1/2"
    text={[
      "The first time I made a terrarium, I failed spectacularly 🥀.",
      "Terrariums, I learned, are about balance — and soil is at the heart of that.",
    ]}
  />
);

export const ImageRight = () => (
  <PostSection
    title="The tiny world"
    imgPath={IMG}
    imgSize="1/2"
    imgAlignRight
    text={["Those tiny jars of greenery are like a whole world in miniature."]}
  />
);
