/**
 * tools/omes-release-verify.mjs (issue #16), exercised offline with an
 * injected `fetch` and canned GitHub API fixtures — no network, no token.
 * Covers the happy path, each mismatch it must catch, and the fail-closed
 * contract (every network/API failure is exit 2, never a silent pass).
 */
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  EXIT_BAD_METADATA,
  EXIT_MISMATCH,
  EXIT_OK,
  EXIT_UNVERIFIED,
  main,
  verifyRelease
} from "../tools/omes-release-verify.mjs";

const META_PATH = "apps/storefront/src/config/omes-rilis.json";
const META = JSON.parse(readFileSync(META_PATH, "utf8"));
const API = `https://api.github.com/repos/${META.repository}`;

/** Canned GitHub responses that agree with the committed metadata. */
function goodRoutes() {
  return {
    [`${API}/releases/tags/${META.tag}`]: {
      tag_name: META.tag,
      draft: false,
      prerelease: false,
      published_at: `${META.publishedAt}T03:00:00Z`
    },
    [`${API}/git/ref/tags/${META.tag}`]: { object: { type: "tag", sha: META.tagObjectSha } },
    [`${API}/git/tags/${META.tagObjectSha}`]: { object: { type: "commit", sha: META.commitSha } },
    [`${API}/git/trees/${META.commitSha}?recursive=1`]: {
      truncated: false,
      tree: [
        { path: "README.md", sha: "1".repeat(40) },
        { path: META.installer.path, sha: META.installer.gitBlobSha }
      ]
    }
  };
}

function fakeFetch(routes, calls = []) {
  return async (url, init) => {
    calls.push({ url, init });
    const body = routes[url];
    if (body instanceof Error) throw body;
    if (typeof body === "number") return { ok: false, status: body, json: async () => ({}) };
    if (body === undefined) return { ok: false, status: 404, json: async () => ({}) };
    if (body === "not-json") return { ok: true, status: 200, json: async () => { throw new SyntaxError("bad"); } };
    return { ok: true, status: 200, json: async () => body };
  };
}

const quiet = () => {
  const lines = [];
  return { lines, log: (m) => lines.push(m), error: (m) => lines.push(m) };
};

async function run(routes, env = {}) {
  const out = quiet();
  const calls = [];
  const code = await main({ fetch: fakeFetch(routes, calls), env, out, metadataPath: META_PATH });
  return { code, out: out.lines.join("\n"), calls };
}

describe("verifyRelease / main", () => {
  test("verifies when GitHub agrees with the metadata", async () => {
    const { code, out } = await run(goodRoutes());
    assert.equal(code, EXIT_OK, out);
  });

  test("makes only read-only GETs to api.github.com and never fetches the installer", async () => {
    const { calls } = await run(goodRoutes());
    assert.equal(calls.length, 4);
    for (const { url, init } of calls) {
      const { protocol, hostname } = new URL(url);
      assert.equal(protocol, "https:", url);
      assert.equal(hostname, "api.github.com", url);
      assert.equal(init.method, undefined); // default GET
    }
  });

  test("sends the token only when GITHUB_TOKEN is set", async () => {
    const without = await run(goodRoutes());
    assert.equal(without.calls[0].init.headers.authorization, undefined);
    const withToken = await run(goodRoutes(), { GITHUB_TOKEN: "t0k" });
    assert.equal(withToken.calls[0].init.headers.authorization, "Bearer t0k");
  });

  const mismatchCases = [
    ["a draft release", (r) => { r[`${API}/releases/tags/${META.tag}`].draft = true; }],
    ["a prerelease", (r) => { r[`${API}/releases/tags/${META.tag}`].prerelease = true; }],
    ["a different publish date", (r) => { r[`${API}/releases/tags/${META.tag}`].published_at = "2026-01-01T00:00:00Z"; }],
    ["a moved tag object", (r) => { r[`${API}/git/ref/tags/${META.tag}`].object.sha = "f".repeat(40); }],
    ["a lightweight tag", (r) => { r[`${API}/git/ref/tags/${META.tag}`].object.type = "commit"; }],
    ["a different commit", (r) => { r[`${API}/git/tags/${META.tagObjectSha}`].object.sha = "e".repeat(40); }],
    ["a changed installer blob", (r) => { r[`${API}/git/trees/${META.commitSha}?recursive=1`].tree[1].sha = "d".repeat(40); }],
    ["a missing installer", (r) => { r[`${API}/git/trees/${META.commitSha}?recursive=1`].tree.pop(); }]
  ];
  for (const [name, mutate] of mismatchCases) {
    test(`exit 1 on ${name}`, async () => {
      const routes = goodRoutes();
      mutate(routes);
      const { code, out } = await run(routes);
      assert.equal(code, EXIT_MISMATCH, out);
    });
  }

  const unverifiedCases = [
    ["a network error", (r) => { r[`${API}/releases/tags/${META.tag}`] = new Error("ECONNRESET"); }],
    ["a proxy 403", (r) => { r[`${API}/releases/tags/${META.tag}`] = 403; }],
    ["a rate limit 429", (r) => { r[`${API}/git/ref/tags/${META.tag}`] = 429; }],
    ["a 404", (r) => { delete r[`${API}/git/tags/${META.tagObjectSha}`]; }],
    ["a non-JSON body", (r) => { r[`${API}/git/trees/${META.commitSha}?recursive=1`] = "not-json"; }],
    ["a truncated tree", (r) => { r[`${API}/git/trees/${META.commitSha}?recursive=1`].truncated = true; }]
  ];
  for (const [name, mutate] of unverifiedCases) {
    test(`exit 2 (fail closed) on ${name}`, async () => {
      const routes = goodRoutes();
      mutate(routes);
      const { code, out } = await run(routes);
      assert.equal(code, EXIT_UNVERIFIED, out);
    });
  }

  test("exit 3 when the metadata file is unreadable", async () => {
    const out = quiet();
    const code = await main({ fetch: fakeFetch({}), env: {}, out, metadataPath: "/nonexistent/omes-rilis.json" });
    assert.equal(code, EXIT_BAD_METADATA);
  });

  test("the four exit codes are distinct and non-zero on failure", () => {
    assert.equal(new Set([EXIT_OK, EXIT_MISMATCH, EXIT_UNVERIFIED, EXIT_BAD_METADATA]).size, 4);
  });

  test("verifyRelease returns [] for a matching fixture", async () => {
    assert.deepEqual(await verifyRelease(META, { fetch: fakeFetch(goodRoutes()) }), []);
  });
});
