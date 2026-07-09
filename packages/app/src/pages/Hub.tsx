import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Gorlium — homepage hub.
 *
 * Top-level landing that links out to the thematic "worlds". Intentionally
 * self-contained: its own typography (Archivo + Space Mono) and palette, no
 * dependency on the terrarium-area design system. Ported from the Claude
 * Design handoff (personal-interest-hub-design / gorlium.dc.html).
 *
 * Desktop keeps the original hover layout (decentred list + bleeding giant
 * title + floating preview). On narrow screens hover doesn't exist and the
 * absolute positioning overlaps, so we render a simple stacked, always-on list
 * instead (HubDesktopList / HubMobileList below). Only enabled worlds navigate.
 */

const INK = "#15140f";
const PAPER = "#ece7dd";
const BG = "#e4ded1";

const mono = "'Space Mono', monospace";
const sans = "'Archivo', system-ui, sans-serif";

const MOBILE_BREAKPOINT = 760;

interface World {
  slug: string;
  name: string;
  accent: string;
  desc: string;
  img: string;
  href: string | null;
  restricted: boolean;
}

const WORLDS: World[] = [
  { slug: "terrari", name: "Terrariums", accent: "#8faa57", desc: "Tiny worlds, sealed under glass.", img: "/gorlium/terrari.svg", href: "/terrariums", restricted: false },
  { slug: "sartoria", name: "Tailoring", accent: "#8aa0c8", desc: "Made-to-measure, from the pattern.", img: "/gorlium/sartoria.svg", href: null, restricted: false },
  { slug: "gioielleria", name: "Jewelry", accent: "#cda64e", desc: "Metal and stone, in the detail.", img: "/gorlium/gioielleria.svg", href: null, restricted: false },
  { slug: "maglia", name: "Knitting & Crochet", accent: "#cc7a4f", desc: "Handmade, warm and slow.", img: "/gorlium/maglia.svg", href: null, restricted: false },
  { slug: "software", name: "Software & Development", accent: "#5fb3c6", desc: "Code, systems and experiments.", img: "/gorlium/software.svg", href: null, restricted: false },
  { slug: "mente", name: "Mental Health", accent: "#9b8cc4", desc: "A space to slow down.", img: "/gorlium/mente.svg", href: null, restricted: true },
];

const RESTRICTED_BADGE = (
  <span style={{ font: `700 8px/1 ${mono}`, letterSpacing: ".12em", border: "1px solid currentColor", padding: "4px 5px", opacity: 0.7, whiteSpace: "nowrap" }}>RESTRICTED</span>
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

// Mobile: a stacked, always-on list (no hover). Each world is a tappable row
// with a thumbnail, name and description.
function HubMobileList() {
  return (
    <div style={{ position: "relative", zIndex: 18, flex: 1, padding: "28px clamp(18px,6vw,28px) 8px" }}>
      <div style={{ font: `800 14px/1 ${sans}`, letterSpacing: ".02em", color: INK, marginBottom: 22, textTransform: "uppercase", opacity: 0.7 }}>My worlds</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {WORLDS.map((it) => {
          const enabled = it.href != null;
          const rowStyle: React.CSSProperties = {
            display: "flex", alignItems: "center", gap: 14, padding: "14px 0", color: INK,
            textDecoration: "none", borderTop: `1px solid ${INK}22`,
            opacity: enabled ? 1 : 0.6, cursor: enabled ? "pointer" : "default",
          };
          const inner = (
            <>
              <img src={it.img} alt="" style={{ width: 64, height: 48, flex: "none", objectFit: "cover", display: "block", border: `1px solid ${INK}`, borderLeft: `4px solid ${it.accent}` }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ font: `700 21px/1.05 ${sans}`, letterSpacing: "-.01em" }}>{it.name}</span>
                  {it.restricted && RESTRICTED_BADGE}
                </div>
                <div style={{ font: `400 12px/1.4 ${mono}`, color: INK, opacity: 0.7, marginTop: 4 }}>{it.desc}</div>
              </div>
            </>
          );
          return enabled ? (
            <a key={it.slug} href={it.href as string} style={rowStyle}>{inner}</a>
          ) : (
            <div key={it.slug} aria-disabled="true" style={rowStyle}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}

interface HubDesktopListProps {
  active: number | null;
  setActive: (i: number | null) => void;
  cur: World | null;
  rowCenter: number;
  contentRef: React.RefObject<HTMLDivElement>;
  itemRefs: React.MutableRefObject<(HTMLElement | null)[]>;
}

// Desktop: the decentred list with the floating preview and the giant bleeding
// name that both track the hovered row (positioned by the parent's layout effect).
function HubDesktopList({ active, setActive, cur, rowCenter, contentRef, itemRefs }: HubDesktopListProps) {
  const giantTone = cur ? cur.accent : INK;
  return (
    <div ref={contentRef} style={{ position: "relative", flex: "1 0 auto", minHeight: "58vh", margin: "38px clamp(28px,5vw,64px) 0" }}>
      {/* preview: image + description, tracks the active row */}
      <div
        style={{
          position: "absolute", left: 0, width: 300, zIndex: 16,
          top: rowCenter, transform: "translateY(-50%)",
          opacity: cur ? 1 : 0, pointerEvents: "none",
          display: "flex", gap: 18, alignItems: "flex-start",
        }}
      >
        {cur && (
          <>
            <img src={cur.img} alt="" style={{ width: 150, height: 112, flex: "none", objectFit: "cover", display: "block", border: `1px solid ${INK}` }} />
            <div style={{ font: `400 14px/1.45 ${mono}`, color: INK, maxWidth: 140 }}>
              {cur.desc}
              {cur.restricted && <span style={{ opacity: 0.55 }}> — restricted area.</span>}
            </div>
          </>
        )}
      </div>

      {/* giant bleeding name behind the list, tracks the active row */}
      <div
        style={{
          position: "absolute", left: "calc(54% + 120px)", font: `800 clamp(52px,8vw,132px)/.84 ${sans}`,
          letterSpacing: "-.035em", whiteSpace: "nowrap", color: giantTone, zIndex: 4, pointerEvents: "none",
          top: rowCenter, transform: "translateY(-50%)", opacity: cur ? 0.42 : 0,
        }}
      >
        {cur ? cur.name : ""}
      </div>

      {/* decentered list — kept in normal flow so it drives the content
          height; when the viewport is short/zoomed the page scrolls
          instead of the list being clipped under the footer. */}
      <div style={{ position: "relative", marginLeft: "54%", paddingTop: 6, width: "min(330px, 42vw)", zIndex: 18 }}>
        <div style={{ font: `800 16px/1 ${sans}`, letterSpacing: "-.005em", color: INK, marginBottom: 40 }}>My worlds</div>

        {WORLDS.map((it, i) => {
          const on = active === i;
          const enabled = it.href != null;
          const sharedStyle: React.CSSProperties = {
            display: "flex", alignItems: "center", gap: 12, padding: "15px 0", color: INK,
            cursor: enabled ? "pointer" : "default", textDecoration: "none",
            transform: on ? "translateX(16px)" : "translateX(0)",
            transition: "transform .18s ease",
            opacity: enabled ? 1 : 0.62,
          };
          const inner = (
            <>
              <span style={{ opacity: on ? 1 : 0, font: `400 20px/1 ${sans}`, marginLeft: -26, width: 14 }}>•</span>
              <span style={{ font: `${on ? 800 : 500} clamp(24px,2.4vw,31px)/1 ${sans}`, letterSpacing: "-.01em" }}>{it.name}</span>
              {it.restricted && RESTRICTED_BADGE}
            </>
          );
          const setRef = (el: HTMLElement | null) => {
            itemRefs.current[i] = el;
          };
          return enabled ? (
            <a
              key={it.slug}
              href={it.href as string}
              ref={setRef}
              onMouseEnter={() => setActive(i)}
              style={sharedStyle}
            >
              {inner}
            </a>
          ) : (
            <div
              key={it.slug}
              ref={setRef}
              onMouseEnter={() => setActive(i)}
              aria-disabled="true"
              style={sharedStyle}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Hub() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [rowCenter, setRowCenter] = useState(0);

  // Position the giant title + preview at the centre of the active row (desktop only).
  useLayoutEffect(() => {
    if (isMobile || active == null) return;
    const reposition = () => {
      const content = contentRef.current;
      const it = itemRefs.current[active];
      if (!content || !it) return;
      const cr = content.getBoundingClientRect();
      const ir = it.getBoundingClientRect();
      setRowCenter(ir.top - cr.top + ir.height / 2);
    };
    reposition();
    const t = setTimeout(reposition, 350);
    window.addEventListener("resize", reposition);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reposition);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", reposition);
    };
  }, [active, isMobile]);

  const cur = active != null ? WORLDS[active] : null;

  return (
    <div style={{ position: "relative", width: "100%", background: BG, padding: isMobile ? 8 : 14, minHeight: "100vh", boxSizing: "border-box", fontFamily: sans }}>
      <div
        onMouseLeave={() => !isMobile && setActive(null)}
        style={{ position: "relative", border: `1.5px solid ${INK}`, background: PAPER, minHeight: isMobile ? "calc(100vh - 16px)" : "calc(100vh - 28px)", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* decorative rotated labels — desktop only (they overlap on narrow screens) */}
        {!isMobile && (
          <>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%) rotate(-90deg)", font: `700 11px/1 ${mono}`, letterSpacing: ".22em", color: INK, opacity: 0.55, whiteSpace: "nowrap", zIndex: 25 }}>© MMXXVI</div>
            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", font: `700 11px/1 ${mono}`, letterSpacing: ".22em", color: INK, opacity: 0.55, whiteSpace: "nowrap", zIndex: 25 }}>HANDMADE — ITALY</div>
          </>
        )}

        {/* masthead */}
        <header style={{ position: "relative", zIndex: 20, padding: isMobile ? "22px clamp(18px,6vw,28px) 0" : "34px clamp(28px,5vw,64px) 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", font: `700 ${isMobile ? 10 : 12}px/1.5 ${mono}`, letterSpacing: ".16em", color: INK }}>
            <span>GORLIUM</span>
            <span style={{ opacity: 0.55 }}>HUB OF WORLDS</span>
          </div>
          <div style={{ font: `900 clamp(54px,11vw,150px)/.86 ${sans}`, letterSpacing: "-.035em", color: INK, marginTop: 18 }}>gorlium</div>
        </header>

        {isMobile ? (
          <HubMobileList />
        ) : (
          <HubDesktopList
            active={active}
            setActive={setActive}
            cur={cur}
            rowCenter={rowCenter}
            contentRef={contentRef}
            itemRefs={itemRefs}
          />
        )}

        {/* footer */}
        <div style={{ position: "relative", zIndex: 20, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1.5px solid ${INK}`, margin: isMobile ? "0 clamp(18px,6vw,28px)" : "0 clamp(28px,5vw,64px)", padding: isMobile ? "14px 0 18px" : "16px 0 28px", font: `700 11px/1 ${mono}`, letterSpacing: ".16em", color: INK }}>
          <span>© GORLIUM</span>
          <span style={{ opacity: 0.55 }}>SIX WORLDS</span>
        </div>
      </div>
    </div>
  );
}

export default Hub;
