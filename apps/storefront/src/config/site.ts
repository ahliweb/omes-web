/**
 * Site configuration for this deployment.
 *
 * Everything a deployment changes lives here or in `.env` — no other file
 * should need editing to point this app at a different name or origin.
 */
import { readEnvOr } from "../lib/env";

/**
 * `SITE_URL` is read at BUILD time and must be the canonical absolute
 * origin — it is what canonical links, Open Graph URLs, and the Product
 * JSON-LD are all built from. A wrong value does not break the build; it
 * publishes a site that points every crawler and every share somewhere
 * else, which is why it has no silent default in production.
 *
 * Also read directly in `astro.config.mjs` (Astro needs it before this
 * module can run) — the two are kept in step by reading the same
 * environment variable, not by importing one from the other.
 */
const siteUrl = readEnvOr("SITE_URL", "http://localhost:4321").replace(
  /\/+$/,
  ""
);

export const siteConfig = {
  name: readEnvOr("SITE_NAME", "OMES"),
  description: readEnvOr("SITE_DESCRIPTION", "Profil resmi OMES."),
  siteUrl,
  domain: new URL(siteUrl).host
};

/** Resolves a site-relative path (e.g. `/product/produk-x`) to an absolute URL under `siteConfig.siteUrl`. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.siteUrl).toString();
}

/**
 * The identity/theme fallback for this deployment (issue #24) — the live
 * site's own public values, used whenever `apps/cms`'s `site-profile`/
 * `theming` modules have nothing for a field (the tenant has not configured
 * it, or the endpoint 403s/404s on a build credential minted before that
 * module existed). Never a placeholder invented for this app: every value
 * below is BjekMart's real, already-public identity.
 *
 * `SITE_NAME`/`SITE_DESCRIPTION` env vars, when set, override even a value
 * the CMS returns — see `src/lib/awcms/profil.ts`'s `getSiteIdentity()`,
 * which is the ONE place this constant and the env vars above are combined
 * with a live CMS fetch. Nothing else should read `DEFAULT_IDENTITY`
 * directly.
 */
export const DEFAULT_IDENTITY: {
  readonly name: string;
  readonly description: string;
  readonly contactEmail: string;
  readonly contactPhone: string | null;
  readonly address: string | null;
} = {
  name: "OMES",
  description:
    "Compatibility layer dan toolkit deployment terinspirasi Omarchy untuk Ubuntu Server dan Linux Mint, dengan Hermes Agent sebagai lapisan otomasi.",
  contactEmail: "admin@ahlikoding.com",
  // OMES publishes no phone number or street address. `template:init` was run
  // without --kontak-telepon/--alamat, so there must be no fallback that
  // invents one: `null` makes every consumer omit the line (see Footer.astro,
  // FooterBerita.astro, Beranda.astro, kontak.astro).
  contactPhone: null,
  address: null
};

/**
 * The default theme palette (issue #24) — BjekMart's own emerald brand
 * colors, used whenever `apps/cms`'s `theming` module has nothing published
 * for this tenant. See `src/lib/awcms/theme.ts` for how (and how rarely)
 * this is overridden by a live CMS value, and its docblock for why
 * `secondary` in particular has no CMS equivalent to override it with.
 */
export const DEFAULT_THEME_COLORS = {
  primary: "#5FC8D6",
  secondary: "#151A20",
  accent: "#E8B44A"
} as const;
