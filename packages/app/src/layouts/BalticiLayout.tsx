import { Header, Stack } from "@gorlium/design-system";
import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isConfigured } from "../baltici/db";
import { ErrorBoundary } from "../baltici/components/ErrorBoundary";
import { EditGateProvider } from "../baltici/editGateUI";

// Baltici area chrome — mirrors TerrariumLayout. When InstantDB isn't configured
// (no app ID at build time) we render a short setup notice instead of the pages,
// so their db.useQuery hooks never run against a placeholder app.
function BalticiLayout() {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", overflow: "hidden" }}>
      <Stack space={16} align="center">
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
            [t("baltici.tabs.home"), "/secret-baltici"],
            [t("baltici.tabs.expenses"), "/secret-baltici/expenses"],
            [t("baltici.tabs.whoOwes"), "/secret-baltici/who-owes"],
            [t("baltici.tabs.people"), "/secret-baltici/people"],
          ]}
        />
        <div style={{ width: "100%", padding: "0 12px 40px", boxSizing: "border-box" }}>
          {isConfigured ? (
            <ErrorBoundary fallback={<GenericError />}>
              <EditGateProvider>
                <Outlet />
              </EditGateProvider>
            </ErrorBoundary>
          ) : (
            <NotConfigured />
          )}
        </div>
      </Stack>
    </div>
  );
}

function NotConfigured() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        border: "1.5px solid currentColor",
        padding: "24px",
        margin: "24px 0",
        font: "400 14px/1.6 'Space Mono', monospace",
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>
        {t("baltici.notConfigured.title")}
      </strong>
      {t("baltici.notConfigured.body")}
      <code style={{ display: "block", marginTop: 12, opacity: 0.8 }}>
        VITE_INSTANT_APP_ID
      </code>
    </div>
  );
}

function GenericError() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        border: "1.5px solid currentColor",
        padding: "24px",
        margin: "24px 0",
        font: "400 14px/1.6 'Space Mono', monospace",
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>
        {t("baltici.error.title")}
      </strong>
      {t("baltici.error.body")}
    </div>
  );
}

export default BalticiLayout;
