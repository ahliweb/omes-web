/**
 * Issue #9: the `landing` build (OMES theme, `data-tema="omes"`) used to
 * preload the BASE type system's Plus Jakarta Sans/Lora faces even though
 * the OMES theme never renders either family — `BaseLayout.astro` now picks
 * its preload list from `SITE_PROFILE` (`src/config/profil.ts`), the same
 * source `data-tema` itself is derived from.
 *
 * This proves the fix from the built OUTPUT, not from re-reading
 * `BaseLayout.astro`'s own source: every font URL a `landing` build
 * preloads must be one `global.css` actually declares under a family the
 * OMES theme's `--font-sans`/`--font-mono` tokens name (parsed from the
 * `:root[data-tema="omes"]` block itself, not hand-typed here — a future
 * theme font swap that forgets to update the preload list fails this test
 * without anyone having to remember this file exists), and neither
 * `Plus Jakarta Sans` nor `Lora` (the base theme's families, `toko`/`berita`
 * still use them) may be preloaded on `landing`.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildProfile, canSpawnBun, readDistText } from "./profil-uji-bersama";

const CSS_PATH = join(import.meta.dir, "..", "src", "styles", "global.css");

/** Every `@font-face` block in `global.css`, as `{ family, weight, src }`. */
function readFontFaces(): { family: string; weight: string; src: string }[] {
  const css = readFileSync(CSS_PATH, "utf-8");
  const blocks = css.match(/@font-face\s*{[^}]*}/g) ?? [];
  return blocks.map((block) => {
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1] ?? "";
    const weight = block.match(/font-weight:\s*(\d+)/)?.[1] ?? "";
    const src = block.match(/src:\s*url\(['"]([^'")]+)['"]\)/)?.[1] ?? "";
    return { family, weight, src };
  });
}

/** The family names `:root[data-tema="omes"]` sets `--font-sans`/`--font-mono` to (the theme's own type pair, `docs/ui-ux.md`'s "OMES theme" section). */
function readOmesThemeFamilies(): string[] {
  const css = readFileSync(CSS_PATH, "utf-8");
  const omesBlock = css.match(/:root\[data-tema="omes"\]\s*{[^}]*}/)?.[0] ?? "";
  const families = new Set<string>();
  for (const token of ["--font-sans", "--font-mono", "--font-serif"]) {
    const value = omesBlock.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1] ?? "";
    // A token's value is a comma-separated font stack; only the first,
    // quoted entry is the self-hosted family (the rest are system fallbacks
    // or, for `--font-serif: var(--font-sans)`, a var() this theme aliases
    // rather than a second family).
    const first = value.match(/'([^']+)'/)?.[1];
    if (first) families.add(first);
  }
  return [...families];
}

describe("landing build (OMES theme) preloads only fonts the OMES theme renders (issue #9)", () => {
  if (!canSpawnBun()) {
    test.skip("SKIPPED — this environment cannot spawn `bun` (Bun.spawnSync failed)", () => {});
    return;
  }

  test(
    "every preloaded font URL belongs to a family the OMES theme uses, and neither Plus Jakarta Sans nor Lora is preloaded",
    async () => {
      await buildProfile("landing");
      const html = readDistText("index.html");

      const preloadHrefs = [
        ...html.matchAll(/<link rel="preload" as="font"[^>]*href="([^"]+)"/g)
      ].map((m) => m[1]);
      expect(preloadHrefs.length).toBeGreaterThan(0);

      const fontFaces = readFontFaces();
      const omesFamilies = readOmesThemeFamilies();
      expect(omesFamilies).toEqual(expect.arrayContaining(["Public Sans", "JetBrains Mono"]));

      for (const href of preloadHrefs) {
        const face = fontFaces.find((f) => f.src === href);
        expect(face).toBeDefined();
        expect(omesFamilies).toContain(face!.family);
      }

      // The base theme's own families must never appear in a `landing`
      // preload — the exact regression issue #9 reported.
      const preloadedFamilies = preloadHrefs.map(
        (href) => fontFaces.find((f) => f.src === href)?.family
      );
      expect(preloadedFamilies).not.toContain("Plus Jakarta Sans");
      expect(preloadedFamilies).not.toContain("Lora");
      expect(preloadHrefs.some((href) => href.includes("plus-jakarta"))).toBe(false);
      expect(preloadHrefs.some((href) => href.includes("lora"))).toBe(false);
    },
    90_000
  );

  test(
    "toko and berita builds keep preloading the base theme's own fonts, unaffected by the landing fix",
    async () => {
      const fontFaces = readFontFaces();

      for (const profile of ["toko", "berita"] as const) {
        await buildProfile(profile);
        const html = readDistText("index.html");
        const preloadHrefs = [
          ...html.matchAll(/<link rel="preload" as="font"[^>]*href="([^"]+)"/g)
        ].map((m) => m[1]);
        expect(preloadHrefs.length).toBeGreaterThan(0);

        const preloadedFamilies = preloadHrefs.map(
          (href) => fontFaces.find((f) => f.src === href)?.family
        );
        expect(preloadedFamilies).toContain("Plus Jakarta Sans");
        expect(preloadedFamilies).not.toContain("Public Sans");
        expect(preloadedFamilies).not.toContain("JetBrains Mono");
      }
    },
    120_000
  );
});
