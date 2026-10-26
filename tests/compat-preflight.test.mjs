import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { CompatInputError, gatherCompatInputs } from "../packages/gerbang/lib/compat-inputs.mjs";
import {
  REQUIRED_INTEGRATION_TESTS,
  WORKER_ROUTE_FILES,
  WORKER_SCHEMA_NAMES,
  evaluateCompat,
  sha256Hex,
  stripComments,
  workerDigest
} from "../packages/gerbang/lib/compat-policy.mjs";

/**
 * Offline fixtures only: a temp tree is written, the evaluator reads it back.
 * The final describe block runs the evaluator against the REAL repository, so
 * root `bun test` (the `Check (toko)` leg) gates the shipped manifest.
 */

const REPO_ROOT = new URL("..", import.meta.url).pathname;
const CLI = join(REPO_ROOT, "tools/compat-preflight.mjs");
const PIN_PATH = "apps/cms/src/modules/omes-control/contracts/v1/PIN.json";
const RELEASE_COMMIT = "c".repeat(40);
const PIN_COMMIT = "a".repeat(40);
const SYNC_COMMIT = "8".repeat(40);

const roots = [];
afterEach(() => {
  while (roots.length) rmSync(roots.pop(), { recursive: true, force: true });
});

function put(root, rel, content) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), typeof content === "string" ? content : JSON.stringify(content, null, 2));
}

/** A fully compatible fixture tree; `mutate` receives the pieces before they are written. */
function makeTree(mutate = () => {}) {
  const root = mkdtempSync(join(tmpdir(), "compat-"));
  roots.push(root);
  const schemas = Object.fromEntries(WORKER_SCHEMA_NAMES.map((n) => [n, `{"title":"${n}"}`]));
  const hashes = Object.fromEntries(WORKER_SCHEMA_NAMES.map((n) => [n, sha256Hex(schemas[n])]));
  const parts = {
    schemas,
    pin: { sourceRepo: "ahliweb/omes", area: "control-center", version: "v1", sourceCommit: PIN_COMMIT, files: { ...hashes } },
    manifest: {
      schemaVersion: 1,
      product: { repository: "ahliweb/omes-web", version: "1.2.3" },
      cms: { upstream: "ahliweb/awcms", prefix: "apps/cms", syncCommit: SYNC_COMMIT },
      omesRelease: { repository: "ahliweb/omes", tag: "v0.6.0", commitSha: RELEASE_COMMIT },
      omesContract: {
        area: "control-center",
        major: "v1",
        pinPath: PIN_PATH,
        pinSourceCommit: PIN_COMMIT,
        relation: "release-plus-additive",
        baseReleaseTag: "v0.6.0",
        workerProtocol: { files: { ...hashes }, digest: workerDigest(hashes) }
      },
      supported: { contractMajors: ["v1"], workerTransport: "signed-outbound-https-poll" },
      verifiedAt: "2026-10-26",
      notes: "fixture"
    },
    omesRilis: { repository: "ahliweb/omes", tag: "v0.6.0", commitSha: RELEASE_COMMIT },
    pkg: { name: "fixture", version: "1.2.3" },
    awcmsSubtree: null,
    routes: Object.fromEntries(WORKER_ROUTE_FILES.map((r) => [r, "export const POST = () => new Response('ok');"])),
    tests: Object.fromEntries(
      REQUIRED_INTEGRATION_TESTS.map((s) => [s.path, "test('REPLAYED nonce idempotent wrong-tenant WRONG key')"])
    )
  };
  mutate(parts);
  const dir = PIN_PATH.replace(/\/PIN\.json$/, "");
  for (const [name, body] of Object.entries(parts.schemas)) if (body !== null) put(root, `${dir}/${name}`, body);
  put(root, PIN_PATH, parts.pin);
  put(root, "ops/compat/release-manifest.json", parts.manifest);
  put(root, "apps/storefront/src/config/omes-rilis.json", parts.omesRilis);
  put(root, "package.json", parts.pkg);
  if (parts.awcmsSubtree) put(root, "ops/awcms-subtree.json", parts.awcmsSubtree);
  for (const [rel, body] of Object.entries(parts.routes)) if (body !== null) put(root, rel, body);
  for (const [rel, body] of Object.entries(parts.tests)) if (body !== null) put(root, rel, body);
  return root;
}

const NOW = new Date("2026-10-27T00:00:00Z");
function run(root, now = NOW) {
  return evaluateCompat(gatherCompatInputs(root), { now });
}
const checks = (result) => result.findings.map((f) => f.check);

describe("supported combination", () => {
  test("release-plus-additive with an unchanged worker protocol is OK and states it is not an exact-release claim", () => {
    const result = run(makeTree());
    expect(result.findings).toEqual([]);
    expect(result.contractClaim).toBe("release-plus-additive");
    expect(result.notes.join("\n")).toMatch(/NOT claimed tested against an exact published OMES release/);
  });

  test("exact-release is accepted when the pin IS the release commit", () => {
    const root = makeTree((p) => {
      p.pin.sourceCommit = RELEASE_COMMIT;
      p.manifest.omesContract.pinSourceCommit = RELEASE_COMMIT;
      p.manifest.omesContract.relation = "exact-release";
    });
    const result = run(root);
    expect(result.findings).toEqual([]);
    expect(result.notes.join("\n")).not.toMatch(/NOT claimed/);
  });

  test("ops/awcms-subtree.json, when present and agreeing, is cross-checked", () => {
    const root = makeTree((p) => {
      p.awcmsSubtree = { upstream: "https://github.com/ahliweb/awcms.git", lastSyncCommit: SYNC_COMMIT };
    });
    expect(run(root).findings).toEqual([]);
  });
});

describe("refused combinations", () => {
  test("an unknown future contract major fails", () => {
    const root = makeTree((p) => {
      p.manifest.omesContract.major = "v2";
      p.manifest.supported.contractMajors = ["v1", "v2"];
      p.pin.version = "v2";
    });
    expect(checks(run(root))).toContain("contract-major");
  });

  test("a missing worker schema fails", () => {
    const root = makeTree((p) => {
      p.schemas["worker-poll.request.schema.json"] = null;
    });
    expect(checks(run(root))).toContain("worker-schema");
  });

  test("a schema whose bytes changed (hash mismatch with PIN and manifest) fails", () => {
    const root = makeTree((p) => {
      p.schemas["worker-result.request.schema.json"] = '{"tampered":true}';
    });
    const messages = run(root).findings.filter((f) => f.check === "worker-schema").map((f) => f.message);
    expect(messages.length).toBe(2);
  });

  test("a stale manifest fails, a fresh one does not", () => {
    const root = makeTree();
    expect(checks(run(root, new Date("2027-02-01T00:00:00Z")))).toContain("stale");
    expect(checks(run(root, new Date("2026-12-01T00:00:00Z")))).not.toContain("stale");
  });

  test("release-plus-additive with a CHANGED worker digest fails", () => {
    const root = makeTree((p) => {
      const name = "worker-poll.response.schema.json";
      p.schemas[name] = '{"changed":"worker protocol"}';
      p.pin.files[name] = sha256Hex(p.schemas[name]); // PIN agrees with disk, but not with the recorded base release
    });
    const found = run(root).findings.filter((f) => f.check === "worker-schema");
    expect(found.length).toBe(1);
    expect(found[0].message).toMatch(/manifest/);
  });

  test("exact-release claimed while the pin is not the release commit fails", () => {
    const root = makeTree((p) => {
      p.manifest.omesContract.relation = "exact-release";
    });
    expect(checks(run(root))).toContain("contract-relation");
  });

  test("an awcms-one upstream fails", () => {
    const root = makeTree((p) => {
      p.manifest.cms.upstream = "ahliweb/awcms-one";
    });
    expect(checks(run(root))).toContain("cms-upstream");
  });

  test("a sync commit that disagrees with ops/awcms-subtree.json fails", () => {
    const root = makeTree((p) => {
      p.awcmsSubtree = { upstream: "https://github.com/ahliweb/awcms.git", lastSyncCommit: "9".repeat(40) };
    });
    expect(checks(run(root))).toContain("cms-sync-drift");
  });

  test("product version drift fails", () => {
    const root = makeTree((p) => {
      p.pkg.version = "9.9.9";
    });
    expect(checks(run(root))).toContain("product");
  });

  test("the storefront marketing a different OMES release fails", () => {
    const root = makeTree((p) => {
      p.omesRilis.tag = "v0.7.0";
      p.omesRilis.commitSha = "d".repeat(40);
    });
    expect(checks(run(root))).toContain("omes-release");
  });

  test("a PIN whose source commit differs from the manifest fails", () => {
    const root = makeTree((p) => {
      p.pin.sourceCommit = "b".repeat(40);
    });
    expect(checks(run(root))).toContain("contract-pin");
  });

  test("a missing worker route fails", () => {
    const root = makeTree((p) => {
      p.routes[WORKER_ROUTE_FILES[1]] = null;
    });
    expect(checks(run(root))).toContain("worker-routes");
  });

  test("an inbound WebSocket handler under the OMES API routes fails; a comment mentioning one does not", () => {
    const commentOnly = makeTree((p) => {
      p.routes["apps/cms/src/pages/api/v1/omes/note.ts"] = "// never a WebSocket: outbound HTTPS only\nexport const GET = () => new Response('');";
    });
    expect(checks(run(commentOnly))).not.toContain("host-model");
    const socket = makeTree((p) => {
      p.routes["apps/cms/src/pages/api/v1/omes/live.ts"] = "const [c, s] = Object.values(new WebSocketPair());";
    });
    expect(checks(run(socket))).toContain("host-model");
    const upgrade = makeTree((p) => {
      p.routes["apps/cms/src/pages/api/v1/omes/up.ts"] = "if (request.headers.get('x') === 'upgrade') {}";
    });
    expect(checks(run(upgrade))).toContain("host-model");
  });

  test("the replay/idempotency/tenant coverage test going missing or losing a marker fails", () => {
    const path = REQUIRED_INTEGRATION_TESTS[0].path;
    expect(checks(run(makeTree((p) => { p.tests[path] = null; })))).toContain("integration-tests");
    expect(checks(run(makeTree((p) => { p.tests[path] = "test('nothing relevant')"; })))).toContain("integration-tests");
  });

  test("an unsupported worker transport fails", () => {
    const root = makeTree((p) => {
      p.manifest.supported.workerTransport = "inbound-websocket";
    });
    expect(checks(run(root))).toContain("worker-transport");
  });
});

describe("malformed input and CLI exit codes", () => {
  test("a manifest missing required fields is a CompatInputError", () => {
    const root = makeTree((p) => {
      delete p.manifest.omesContract;
    });
    expect(() => gatherCompatInputs(root)).toThrow(CompatInputError);
  });

  test("CLI exits 0, 1 and 3", () => {
    const spawn = (root) =>
      Bun.spawnSync(["bun", CLI, "--root", root, "--now", "2026-10-27"], { stdout: "pipe", stderr: "pipe" });
    expect(spawn(makeTree()).exitCode).toBe(0);
    expect(spawn(makeTree((p) => { p.pkg.version = "0.0.1"; })).exitCode).toBe(1);
    const broken = makeTree();
    writeFileSync(join(broken, "ops/compat/release-manifest.json"), "{not json");
    expect(spawn(broken).exitCode).toBe(3);
  });

  test("stripComments removes line and block comments but keeps URLs in strings", () => {
    expect(stripComments("a // b\n/* c */d\nconst u = 'https://x';")).toBe("a \nd\nconst u = 'https://x';");
  });
});

describe("the real repository tree", () => {
  test("the shipped manifest is compatible with the vendored contract, storefront release and package version", () => {
    const inputs = gatherCompatInputs(REPO_ROOT);
    // Freshness is a deploy-time concern (compat:preflight / deploy:preflight use the real clock);
    // evaluating "as of the verification date" keeps this unit test from becoming a calendar time bomb.
    const verifiedAt = new Date(`${inputs.manifest.verifiedAt}T00:00:00Z`);
    const result = evaluateCompat(inputs, { now: verifiedAt });
    expect(result.findings).toEqual([]);
    expect(JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")).version).toBe(inputs.manifest.product.version);
  });
});
