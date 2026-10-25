/**
 * OMES release metadata (issue #16): `src/config/omes-rilis.json` is the
 * single source of the version, release links and install command the
 * `landing` home page shows. Offline and deterministic — whether the data
 * is still true of the real ahliweb/omes release is the separate, networked
 * `bun run verify:omes-release`.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import raw from "../src/config/omes-rilis.json";
import { omesRilis, parseOmesRilis } from "../src/config/omes-rilis";
import {
  BUILD_TIMEOUT_MS,
  DIST_CLIENT,
  buildProfile,
  canSpawnBun
} from "./profil-uji-bersama";

const clone = () => structuredClone(raw) as Record<string, any>;

describe("omes-rilis.json schema", () => {
  test("the committed file parses", () => {
    expect(parseOmesRilis(raw)).toEqual(omesRilis);
  });

  test("tag is a stable vX.Y.Z and the release is not a prerelease", () => {
    expect(omesRilis.tag).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(omesRilis.prerelease).toBe(false);
    expect(omesRilis.channel).toBe("stable");
  });

  test("installer URL is pinned to the tag and the command pins --ref", () => {
    expect(omesRilis.installer.rawUrl).toContain(`/${omesRilis.tag}/`);
    expect(omesRilis.installCommand).toBe(
      `curl -fsSL ${omesRilis.installer.rawUrl} | bash -s -- --ref ${omesRilis.tag}`
    );
  });

  test("links point at the pinned tag", () => {
    expect(omesRilis.releaseUrl).toBe(`https://github.com/${omesRilis.repository}/releases/tag/${omesRilis.tag}`);
    expect(omesRilis.changelogUrl).toContain(`/blob/${omesRilis.tag}/`);
    expect(omesRilis.installGuideUrl).toContain(`/blob/${omesRilis.tag}/`);
  });

  test.each([
    ["prerelease tag", (o: any) => { o.tag = "v0.7.0-rc1"; }],
    ["prerelease flag", (o: any) => { o.prerelease = true; }],
    ["non-stable channel", (o: any) => { o.channel = "rc"; }],
    ["installCommand without --ref", (o: any) => { o.installCommand = `curl -fsSL ${o.installer.rawUrl} | bash`; }],
    ["rawUrl for another tag", (o: any) => { o.installer.rawUrl = o.installer.rawUrl.replace("/v0.6.0/", "/v0.4.0/"); }],
    ["short sha", (o: any) => { o.commitSha = "abc"; }],
    ["bad sha256", (o: any) => { o.installer.sha256 = "zz"; }],
    ["missing installer", (o: any) => { delete o.installer; }],
    ["wrong schemaVersion", (o: any) => { o.schemaVersion = 2; }]
  ])("rejects %s (build fails closed)", (_name, mutate) => {
    const o = clone();
    mutate(o);
    expect(() => parseOmesRilis(o)).toThrow(/omes-rilis\.json/);
  });
});

describe("no OMES version literal outside the metadata", () => {
  test("Beranda.astro hardcodes no version or installer URL", () => {
    const src = readFileSync(join(import.meta.dir, "../src/profil/landing/Beranda.astro"), "utf8");
    expect(src).not.toMatch(/\bv?\d+\.\d+\.\d+\b/);
    expect(src).not.toContain("raw.githubusercontent.com");
  });
});

describe("landing build renders the metadata", () => {
  if (!canSpawnBun()) {
    test.skip("bun cannot be spawned here", () => {});
    return;
  }

  test(
    "home page shows the tag and the exact install command once; CSP is unchanged",
    async () => {
      await buildProfile("landing");
      const html = readFileSync(join(DIST_CLIENT, "index.html"), "utf8");
      const text = html.replace(/<[^>]+>/g, "");

      expect(text.split(omesRilis.installCommand).length - 1).toBe(1);
      expect(html).toContain(`Pre-alpha · ${omesRilis.tag}`);
      expect(html).toContain(omesRilis.releaseUrl);
      expect(html).toContain(omesRilis.installGuideUrl);

      // Every X.Y.Z-looking OMES version in the page body is the manifest tag.
      const versions = new Set(
        [...html.matchAll(/\bv\d+\.\d+\.\d+\b/g)].map((m) => m[0])
      );
      expect([...versions]).toEqual([omesRilis.tag]);
      expect(html).not.toContain("v0.4.0");

      // The derived CSP gained no origin: only the CMS beacon origin, no framing, no GitHub.
      const csp = JSON.parse(readFileSync(join(DIST_CLIENT, "csp.json"), "utf8")) as {
        connectSrc: string[];
        frameSrc: string[];
        imgSrc: string[];
      };
      expect(csp.connectSrc).toEqual(["https://cms.example.com"]);
      expect(csp.frameSrc).toEqual([]);
      expect(JSON.stringify(csp)).not.toContain("github");
    },
    BUILD_TIMEOUT_MS
  );
});
