import { Link, Body } from "@gorlium/design-system";

export const Default = () => <Link href="https://github.com/GorlemZ/gorlium">This website GitHub repo</Link>;

export const Inline = () => (
  <Body size="medium">
    Check out the <Link href="#">source code</Link> and open an issue if you find a bug.
  </Body>
);
