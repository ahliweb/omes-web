/**
 * Keeps the primary nav visibly open above the mobile breakpoint.
 *
 * `Header.astro`'s nav lives inside `<details class="mobile-nav-toggle">`
 * so a visitor with no JavaScript can still open/close it on narrow
 * viewports (native `<summary>` disclosure — see that file's own
 * docblock). `global.css`'s desktop rule (`.mobile-nav-toggle nav {
 * display: flex }`) was written to make the SAME element look like a
 * plain, always-visible horizontal nav above 720px with no `open`
 * attribute needed at all.
 *
 * That assumption no longer holds: current evergreen browsers hide a
 * closed `<details>` element's non-`<summary>` content unconditionally —
 * an author `display` override on the child has no effect, confirmed
 * against a real, unpatched build of this app (`omes-web`#3's own PR
 * description has the full before/after). Without this fix the ENTIRE
 * primary nav — on every build profile, not just `landing` — is invisible
 * and unreachable above the mobile breakpoint, with nothing in this
 * repository's existing test suite (string-based build-smoke assertions,
 * not a real rendered-browser check) catching it.
 *
 * The fix keeps the no-JS mobile behaviour completely intact — a visitor
 * with JavaScript off still gets a working `<summary>` toggle below 720px,
 * exactly as before — and ONLY changes the desktop case, which was already
 * meant to need no interaction at all. `matchMedia` mirrors the same
 * 720px breakpoint `global.css` uses (kept as one named constant so the
 * two cannot silently drift apart).
 */
const DESKTOP_BREAKPOINT_PX = 721;

function syncOpenState(details: HTMLDetailsElement, query: MediaQueryList): void {
  if (query.matches) {
    details.open = true;
  } else if (details.open) {
    // Narrow viewport: hand control back to the visitor's own toggle —
    // start closed, exactly as a visitor with JS off would experience it.
    details.open = false;
  }
}

function initNavDesktopBuka(): void {
  const details = document.querySelector<HTMLDetailsElement>(".mobile-nav-toggle");
  if (!details) return;

  const query = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
  syncOpenState(details, query);
  query.addEventListener("change", () => syncOpenState(details, query));
}

initNavDesktopBuka();
