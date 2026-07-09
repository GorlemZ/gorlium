import { Box } from "../primitives/Box";
import { Tiles } from "../primitives/Tiles";

// Header navigation cell: the anchor IS the cell, so the whole tile is the
// click target and the hover-fill (CSS .g-header__cell:hover on --g-accent)
// covers it. Full page reload is fine for this site.
function HeaderButton({ link, text }: { link: string; text: string }) {
  return (
    <a className="g-header__cell g-header__link" href={link}>
      {text}
    </a>
  );
}

interface HeaderProps {
  list: [string, string][];
}

function Header({ list }: HeaderProps) {
  return (
    <Box className="g-header" padding={0}>
      <Tiles
        space={0}
        columns={{
          mobile: 1,
          tablet: 1,
          desktop: list.length,
          wide: list.length,
        }}
      >
        {list.map(([item, link], index) => (
          <HeaderButton link={link} text={item} key={index} />
        ))}
      </Tiles>
    </Box>
  );
}

export default Header;
