/**
 * compat-policy.mjs — the pure evaluator behind `bun run compat:preflight`
 * (issue #20).
 *
 * ## What it decides
 *
 * Four parties must agree for a deployment of this product to be supported:
 *
 *   1. the native OMES release (`ahliweb/omes`, a published tag);
 *   2. the OMES Control Center contract vendored inside `apps/cms`
 *      (`PIN.json` + the worker schema files themselves);
 *   3. the AWCMS upstream sync point `apps/cms` was last pulled at;
 *   4. the OMES release the storefront markets (`omes-rilis.json`).
 *
 * `ops/compat/release-manifest.json` records the combination that was
 * verified. This module compares that record with what is ACTUALLY on disk and
 * returns findings; it reads nothing itself (`compat-inputs.mjs` gathers the
 * facts) and never touches the network, so every branch is testable with a
 * fixture tree.
 *
 * ## The honesty rule
 *
 * The vendored contract may sit AHEAD of the published release (today it is
 * `v0.6.0` + 2 commits). That is allowed only when it is declared as
 * `release-plus-additive` AND the worker protocol digest equals the one
 * recorded for the base release. In that case the result says, in so many
 * words, that the contract is NOT claimed tested against an exact published
 * OMES release. `exact-release` is accepted only when the pinned source
 * commit IS the release commit.
 *
 * ## Host model
 *
 * The supported worker transport is OMES ADR-0027's signed, outbound-only
 * HTTPS enroll/poll/result/heartbeat. The static checks refuse an inbound
 * WebSocket/upgrade handler under the OMES API routes.
 */
import { createHash } from "node:crypto";

export const SUPPORTED_CONTRACT_MAJORS = ["v1"];
export const SUPPORTED_WORKER_TRANSPORT = "signed-outbound-https-poll";
export const CMS_UPSTREAM = "ahliweb/awcms";
export const OMES_REPOSITORY = "ahliweb/omes";
export const PRODUCT_REPOSITORY = "ahliweb/omes-web";
export const MAX_MANIFEST_AGE_DAYS = 90;

export const WORKER_SCHEMA_NAMES = [
  "worker-enrollment.request.schema.json",
  "worker-enrollment.response.schema.json",
  "worker-heartbeat.request.schema.json",
  "worker-heartbeat.response.schema.json",
  "worker-poll.request.schema.json",
  "worker-poll.response.schema.json",
  "worker-result.request.schema.json",
  "worker-result.response.schema.json"
];

export const WORKER_ROUTE_FILES = ["enroll", "poll", "result", "heartbeat"].map(
  (name) => `apps/cms/src/pages/api/v1/omes/worker/${name}.ts`
);

/** Integration tests (run DB-backed by `check-cms` in CI) and the marker text each coverage claim is found by. */
export const REQUIRED_INTEGRATION_TESTS = [
  {
    path: "apps/cms/tests/integration/omes-control-worker.integration.test.ts",
    covers: {
      replay: /REPLAYED nonce/,
      idempotency: /idempotent/i,
      "tenant scope": /wrong-tenant|cross-tenant|WRONG tenant/i,
      signature: /WRONG key/
    }
  }
];

/** Matches what an inbound WebSocket/upgrade handler looks like, in comment-free source. */
export const INBOUND_SOCKET_PATTERN = /websocket|["'`]upgrade["'`]|\.upgrade\s*\(/i;

const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** sha256 hex of a string or bytes. */
export function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

/** Canonical digest of a worker-protocol file map: sorted `name sha256\n` lines. */
export function workerDigest(files) {
  const lines = Object.keys(files)
    .sort()
    .map((name) => `${name} ${files[name]}\n`)
    .join("");
  return sha256Hex(lines);
}

/** Remove `//` and block comments so prose mentioning a word is not mistaken for code. */
export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/**
 * @typedef {object} CompatInputs
 * @property {any} manifest
 * @property {string} packageVersion
 * @property {any} omesRilis
 * @property {any} pin
 * @property {Record<string, string | null>} schemaHashes actual sha256 of each worker schema on disk (null = missing)
 * @property {any | null} awcmsSubtree parsed ops/awcms-subtree.json, or null when the file does not exist
 * @property {Record<string, boolean>} routeFiles
 * @property {{ file: string, match: string }[]} inboundSocketHits
 * @property {Record<string, string | null>} testSources integration test source by path (null = missing)
 * @property {string} manifestText raw manifest text
 */

/**
 * @param {CompatInputs} input
 * @param {{ now: Date }} options
 * @returns {{ findings: { check: string, file: string, message: string }[], notes: string[], contractClaim: string }}
 */
export function evaluateCompat(input, { now }) {
  const findings = [];
  const notes = [];
  const MANIFEST = "ops/compat/release-manifest.json";
  const bad = (check, file, message) => findings.push({ check, file, message });

  const { manifest, pin, omesRilis, schemaHashes } = input;
  const contract = manifest.omesContract;
  const worker = contract.workerProtocol;

  // 1. product version
  if (manifest.product.repository !== PRODUCT_REPOSITORY) {
    bad("product", MANIFEST, `product.repository is "${manifest.product.repository}", expected ${PRODUCT_REPOSITORY}.`);
  }
  if (manifest.product.version !== input.packageVersion) {
    bad("product", MANIFEST, `product.version "${manifest.product.version}" disagrees with package.json version "${input.packageVersion}".`);
  }

  // 2. AWCMS upstream
  if (manifest.cms.upstream !== CMS_UPSTREAM || /awcms-one/i.test(input.manifestText)) {
    bad("cms-upstream", MANIFEST, `the AWCMS upstream must be ${CMS_UPSTREAM}; no reference to awcms-one (or any other repository) is allowed.`);
  }
  if (!COMMIT.test(manifest.cms.syncCommit)) {
    bad("cms-upstream", MANIFEST, "cms.syncCommit must be a full 40-character commit sha.");
  }
  if (input.awcmsSubtree) {
    const sub = input.awcmsSubtree;
    if (sub.lastSyncCommit !== manifest.cms.syncCommit) {
      bad("cms-sync-drift", "ops/awcms-subtree.json", `lastSyncCommit ${sub.lastSyncCommit} differs from the manifest's cms.syncCommit ${manifest.cms.syncCommit}.`);
    }
    const repo = String(sub.upstream ?? "").replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
    if (repo !== CMS_UPSTREAM) {
      bad("cms-sync-drift", "ops/awcms-subtree.json", `upstream "${sub.upstream}" is not ${CMS_UPSTREAM}.`);
    }
    notes.push("ops/awcms-subtree.json present — sync commit cross-checked.");
  } else {
    notes.push("ops/awcms-subtree.json absent — AWCMS sync-point cross-check skipped (it arrives with the subtree-sync tooling).");
  }

  // 3. OMES release agreement with the storefront
  if (manifest.omesRelease.repository !== OMES_REPOSITORY || omesRilis.repository !== OMES_REPOSITORY) {
    bad("omes-release", MANIFEST, `the OMES release repository must be ${OMES_REPOSITORY} in both the manifest and omes-rilis.json.`);
  }
  if (manifest.omesRelease.tag !== omesRilis.tag) {
    bad("omes-release", MANIFEST, `omesRelease.tag "${manifest.omesRelease.tag}" differs from the storefront's marketed tag "${omesRilis.tag}" (omes-rilis.json).`);
  }
  if (manifest.omesRelease.commitSha !== omesRilis.commitSha) {
    bad("omes-release", MANIFEST, `omesRelease.commitSha differs from omes-rilis.json commitSha.`);
  }

  // 4. contract pin
  if (pin.sourceRepo !== OMES_REPOSITORY) bad("contract-pin", contract.pinPath, `PIN sourceRepo "${pin.sourceRepo}" is not ${OMES_REPOSITORY}.`);
  if (pin.area !== contract.area) bad("contract-pin", contract.pinPath, `PIN area "${pin.area}" differs from the manifest's "${contract.area}".`);
  if (pin.version !== contract.major) bad("contract-pin", contract.pinPath, `PIN version "${pin.version}" differs from the manifest's contract major "${contract.major}".`);
  if (pin.sourceCommit !== contract.pinSourceCommit) {
    bad("contract-pin", contract.pinPath, `PIN sourceCommit ${pin.sourceCommit} differs from the manifest's pinSourceCommit ${contract.pinSourceCommit}.`);
  }

  // 5. supported majors / transport
  const supportedByManifest = manifest.supported.contractMajors;
  if (!SUPPORTED_CONTRACT_MAJORS.includes(contract.major) || !supportedByManifest.includes(contract.major)) {
    bad("contract-major", MANIFEST, `contract major "${contract.major}" is not supported (this preflight knows ${SUPPORTED_CONTRACT_MAJORS.join(", ")}; the manifest lists ${supportedByManifest.join(", ")}).`);
  }
  for (const major of supportedByManifest) {
    if (!SUPPORTED_CONTRACT_MAJORS.includes(major)) {
      bad("contract-major", MANIFEST, `supported.contractMajors lists "${major}", which this preflight has no verification for.`);
    }
  }
  if (manifest.supported.workerTransport !== SUPPORTED_WORKER_TRANSPORT) {
    bad("worker-transport", MANIFEST, `workerTransport "${manifest.supported.workerTransport}" is not ${SUPPORTED_WORKER_TRANSPORT} (OMES ADR-0027: signed, outbound-only HTTPS enroll/poll/result/heartbeat).`);
  }

  // 6. worker protocol: manifest self-consistency, then disk
  for (const name of WORKER_SCHEMA_NAMES) {
    if (!(name in worker.files)) bad("worker-protocol", MANIFEST, `workerProtocol.files has no entry for ${name}.`);
  }
  if (workerDigest(worker.files) !== worker.digest) {
    bad("worker-protocol", MANIFEST, "workerProtocol.digest does not equal the digest of workerProtocol.files.");
  }
  const actual = {};
  for (const name of WORKER_SCHEMA_NAMES) {
    const onDisk = schemaHashes[name];
    const file = `${contract.pinPath.replace(/\/PIN\.json$/, "")}/${name}`;
    if (onDisk == null) {
      bad("worker-schema", file, "is missing from the vendored contract.");
      continue;
    }
    actual[name] = onDisk;
    if (pin.files?.[name] !== onDisk) bad("worker-schema", file, `sha256 on disk ${onDisk} differs from PIN.json (${pin.files?.[name] ?? "no entry"}).`);
    if (worker.files[name] !== onDisk) bad("worker-schema", file, `sha256 on disk ${onDisk} differs from the manifest (${worker.files[name] ?? "no entry"}).`);
  }
  if (Object.keys(actual).length === WORKER_SCHEMA_NAMES.length) {
    notes.push(`worker protocol digest (vendored, 8 schemas): ${workerDigest(actual)}`);
  }

  // 7. relation honesty
  const exactPin = contract.pinSourceCommit === manifest.omesRelease.commitSha;
  let contractClaim;
  if (contract.relation === "exact-release") {
    contractClaim = "exact-release";
    if (!exactPin) {
      bad("contract-relation", MANIFEST, `relation "exact-release" requires pinSourceCommit to equal the release commit ${manifest.omesRelease.commitSha}, but it is ${contract.pinSourceCommit}.`);
    }
  } else if (contract.relation === "release-plus-additive") {
    contractClaim = "release-plus-additive";
    if (exactPin) bad("contract-relation", MANIFEST, 'pinSourceCommit equals the release commit — declare the relation "exact-release".');
    if (contract.baseReleaseTag !== manifest.omesRelease.tag) {
      bad("contract-relation", MANIFEST, `baseReleaseTag "${contract.baseReleaseTag}" differs from omesRelease.tag "${manifest.omesRelease.tag}".`);
    }
    notes.push(
      `Contract pin ${String(contract.pinSourceCommit).slice(0, 8)} is AHEAD of release ${manifest.omesRelease.tag}; its worker protocol is byte-identical to the base release. The contract is NOT claimed tested against an exact published OMES release.`
    );
  } else {
    contractClaim = "invalid";
    bad("contract-relation", MANIFEST, `relation "${contract.relation}" must be "exact-release" or "release-plus-additive".`);
  }
  if (contractClaim === "exact-release" && !findings.some((f) => f.check === "contract-relation")) {
    notes.push(`Contract pin equals published release ${manifest.omesRelease.tag}.`);
  }

  // 8. freshness
  const verified = new Date(`${manifest.verifiedAt}T00:00:00Z`);
  const ageDays = Math.floor((now.getTime() - verified.getTime()) / 86_400_000);
  if (ageDays > MAX_MANIFEST_AGE_DAYS) {
    bad("stale", MANIFEST, `verifiedAt ${manifest.verifiedAt} is ${ageDays} days old (limit ${MAX_MANIFEST_AGE_DAYS}) — re-verify the combination and update the manifest.`);
  } else if (ageDays < 0) {
    bad("stale", MANIFEST, `verifiedAt ${manifest.verifiedAt} is in the future.`);
  } else {
    notes.push(`manifest verified ${ageDays} day(s) ago (limit ${MAX_MANIFEST_AGE_DAYS}).`);
  }

  // 9. host model (static)
  for (const route of WORKER_ROUTE_FILES) {
    if (!input.routeFiles[route]) bad("worker-routes", route, "worker route is missing — the outbound enroll/poll/result/heartbeat API is incomplete.");
  }
  for (const hit of input.inboundSocketHits) {
    bad("host-model", hit.file, `contains an inbound socket/upgrade construct (${hit.match}); the OMES host model is outbound-only HTTPS (ADR-0027).`);
  }
  for (const spec of REQUIRED_INTEGRATION_TESTS) {
    const source = input.testSources[spec.path];
    if (source == null) {
      bad("integration-tests", spec.path, "is missing; replay/idempotency/tenant-scope/signature coverage cannot be shown (the DB-backed run itself belongs to check-cms in CI).");
      continue;
    }
    for (const [cover, marker] of Object.entries(spec.covers)) {
      if (!marker.test(source)) bad("integration-tests", spec.path, `no longer covers "${cover}".`);
    }
  }

  return { findings, notes, contractClaim };
}

/**
 * Structural validation of the manifest; returns messages (empty when well formed).
 * @param {any} manifest
 */
export function validateManifestShape(manifest) {
  const problems = [];
  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const str = (path, v) => typeof v === "string" && v !== "" ? null : problems.push(`${path} must be a non-empty string`);
  if (!isObj(manifest)) return ["manifest must be a JSON object"];
  if (manifest.schemaVersion !== 1) problems.push("schemaVersion must be 1");
  for (const key of ["product", "cms", "omesRelease", "omesContract", "supported"]) {
    if (!isObj(manifest[key])) problems.push(`${key} must be an object`);
  }
  if (problems.length) return problems;
  str("product.repository", manifest.product.repository);
  str("product.version", manifest.product.version);
  str("cms.upstream", manifest.cms.upstream);
  str("cms.syncCommit", manifest.cms.syncCommit);
  str("omesRelease.repository", manifest.omesRelease.repository);
  str("omesRelease.tag", manifest.omesRelease.tag);
  if (!COMMIT.test(String(manifest.omesRelease.commitSha))) problems.push("omesRelease.commitSha must be a 40-hex commit sha");
  const c = manifest.omesContract;
  for (const key of ["area", "major", "pinPath", "relation", "baseReleaseTag"]) str(`omesContract.${key}`, c[key]);
  if (!COMMIT.test(String(c.pinSourceCommit))) problems.push("omesContract.pinSourceCommit must be a 40-hex commit sha");
  if (!isObj(c.workerProtocol) || !isObj(c.workerProtocol.files)) {
    problems.push("omesContract.workerProtocol.files must be an object");
  } else {
    for (const [name, hash] of Object.entries(c.workerProtocol.files)) {
      if (!SHA256.test(String(hash))) problems.push(`workerProtocol.files["${name}"] must be a sha256 hex`);
    }
    if (!SHA256.test(String(c.workerProtocol.digest))) problems.push("workerProtocol.digest must be a sha256 hex");
  }
  if (!Array.isArray(manifest.supported.contractMajors)) problems.push("supported.contractMajors must be an array");
  str("supported.workerTransport", manifest.supported.workerTransport);
  if (!DATE.test(String(manifest.verifiedAt))) problems.push("verifiedAt must be YYYY-MM-DD");
  return problems;
}
