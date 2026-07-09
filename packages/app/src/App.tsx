import { Header, Banner, Title, Stack } from "@gorlium/design-system";
import { Route, BrowserRouter, Routes, Outlet, Link } from "react-router-dom";
import Hub from "./pages/Hub";
import Homepage from "./pages/Homepage";
import Terrariums from "./pages/Terrariums";
import Dev from "./pages/Dev";
import Contacts from "./pages/Contacts";
import { useTranslation } from "react-i18next";
import { Instructions } from "./pages/Instructions";

// The terrarium area keeps the original digital-brutalism chrome (Header +
// Banner). Other hub worlds will get their own layouts as they're built.
function TerrariumLayout() {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", overflow: "hidden" }}>
      <Stack
        space={16}
        align={{
          mobile: "center",
          tablet: "center",
          desktop: "center",
          wide: "center",
        }}
      >
        <Link
          to="/"
          style={{
            alignSelf: "flex-start",
            margin: "8px 0 0 8px",
            font: "700 11px/1 'Space Mono', monospace",
            letterSpacing: ".16em",
            color: "inherit",
            textDecoration: "none",
            opacity: 0.7,
          }}
        >
          ← GORLIUM HUB
        </Link>
        <Header
          list={[
            [t("header.home"), "/terrariums"],
            [t("header.terrariums"), "/terrariums/gallery"],
            [t("header.instructions"), "/terrariums/how-to"],
            [t("header.contacts"), "/terrariums/contacts"],
            [t("header.dev"), "/terrariums/dev"],
          ]}
        />
        <div
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <Outlet />
        </div>
        <Banner>
          <Title size={"medium"}>{t("bannerWelcome")}</Title>
        </Banner>
      </Stack>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/terrariums" element={<TerrariumLayout />}>
          <Route index element={<Homepage />} />
          <Route path="gallery" element={<Terrariums />} />
          <Route path="how-to" element={<Instructions />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="dev" element={<Dev />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
