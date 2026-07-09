import { Header, Banner, Title, Stack } from "@gorlium/design-system";
import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

export default TerrariumLayout;
