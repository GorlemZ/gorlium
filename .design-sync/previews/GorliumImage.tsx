import { GorliumImage, Title } from "@gorlium/design-system";

const IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360'%3E%3Crect width='100%25' height='100%25' fill='%231c1c1c'/%3E%3Crect x='10' y='10' width='460' height='340' fill='none' stroke='%23c9f24d' stroke-width='4'/%3E%3Ctext x='50%25' y='50%25' fill='%23c9f24d' font-family='monospace' font-size='30' text-anchor='middle' dominant-baseline='middle'%3ETERRARIUM%3C/text%3E%3C/svg%3E";

export const Basic = () => (
  <div style={{ height: 280 }}>
    <GorliumImage path={IMG} height="280px" />
  </div>
);

export const Dimmed = () => (
  <div style={{ height: 280 }}>
    <GorliumImage path={IMG} opacity={0.4} height="280px" />
  </div>
);

export const WithOverlay = () => (
  <div style={{ height: 280 }}>
    <GorliumImage path={IMG} opacity={0.6} height="280px">
      <Title size="large">GORLIUM</Title>
    </GorliumImage>
  </div>
);
