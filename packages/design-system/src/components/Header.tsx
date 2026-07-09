import { Box } from "../primitives/Box";
import { Tiles } from "../primitives/Tiles";

// Header navigation cell (formerly the custom components/Button.tsx). Hover-fill
// is now driven by CSS (.g-header__cell:hover) on --g-accent.
function HeaderButton({ link, text }: { link: string; text: string }) {
  return (
    <div className="g-header__cell" onClick={() => (window.location.href = link)}>
      <a className="g-header__link" href={link}>
        {text}
      </a>
    </div>
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
          desktop: 5,
          wide: 5,
        }}
      >
        {list.slice(0, 5).map(([item, link], index) => (
          <HeaderButton link={link} text={item} key={index} />
        ))}
      </Tiles>
    </Box>
  );
}

export default Header;
