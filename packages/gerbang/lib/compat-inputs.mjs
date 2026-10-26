/**
 * compat-inputs.mjs — gathers the on-disk facts `compat-policy.mjs` judges
 * (issue #20). All I/O for the compatibility preflight lives here so the
 * policy itself stays pure. Importing this module runs nothing.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { readFileIfPresent } from "./files.mjs";
import {
  INBOUND_SOCKET_PATTERN,
  REQUIRED_INTEGRATION_TESTS,
  WORKER_ROUTE_FILES,
  WORKER_SCHEMA_NAMES,
  sha256Hex,
  stripComments,
  validateManifestShape
} from "./compat-policy.mjs";

export const MANIFEST_PATH = "ops/compat/release-manifest.json";
export const OMES_RILIS_PATH = "apps/storefront/src/config/omes-rilis.json";
export const AWCMS_SUBTREE_PATH = "ops/awcms-subtree.json";
const OMES_API_DIR = "apps/cms/src/pages/api/v1/omes";

/** Thrown when an input file is unreadable or malformed (CLI exit 3). */
export class CompatInputError extends Error {}

function readJson(root, rel, { optional = false } = {}) {
  const text = readFileIfPresent(join(root, rel));
  if (text === null) {
    if (optional) return { text: null, value: null };
    throw new CompatInputError(`${rel} does not exist.`);
  }
  try {
    return { text, value: JSON.parse(text) };
  } catch (error) {
    throw new CompatInputError(`${rel} is not valid JSON: ${error.message}`);
  }
}

function walkSources(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkSources(full));
    else if (/\.(ts|js|mjs|astro)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * @param {string} root repository root
 * @returns {import("./compat-policy.mjs").CompatInputs}
 */
export function gatherCompatInputs(root) {
  const { text: manifestText, value: manifest } = readJson(root, MANIFEST_PATH);
  const problems = validateManifestShape(manifest);
  if (problems.length) throw new CompatInputError(`${MANIFEST_PATH} is malformed: ${problems.join("; ")}.`);

  const pkg = readJson(root, "package.json").value;
  const omesRilis = readJson(root, OMES_RILIS_PATH).value;
  const pin = readJson(root, manifest.omesContract.pinPath).value;
  const awcmsSubtree = readJson(root, AWCMS_SUBTREE_PATH, { optional: true }).value;

  const schemaDir = manifest.omesContract.pinPath.replace(/\/PIN\.json$/, "");
  /** @type {Record<string, string | null>} */
  const schemaHashes = {};
  for (const name of WORKER_SCHEMA_NAMES) {
    const path = join(root, schemaDir, name);
    schemaHashes[name] = existsSync(path) ? sha256Hex(readFileSync(path)) : null;
  }

  const routeFiles = Object.fromEntries(WORKER_ROUTE_FILES.map((rel) => [rel, existsSync(join(root, rel))]));

  const inboundSocketHits = [];
  for (const file of walkSources(join(root, OMES_API_DIR))) {
    const match = stripComments(readFileSync(file, "utf8")).match(INBOUND_SOCKET_PATTERN);
    if (match) inboundSocketHits.push({ file: file.slice(root.length + 1), match: match[0] });
  }

  const testSources = Object.fromEntries(
    REQUIRED_INTEGRATION_TESTS.map((spec) => [spec.path, readFileIfPresent(join(root, spec.path))])
  );

  return {
    manifest,
    manifestText,
    packageVersion: pkg.version,
    omesRilis,
    pin,
    schemaHashes,
    awcmsSubtree,
    routeFiles,
    inboundSocketHits,
    testSources
  };
}
