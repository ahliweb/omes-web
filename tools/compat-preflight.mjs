#!/usr/bin/env bun
/**
 * compat-preflight.mjs — `bun run compat:preflight` (issue #20).
 *
 * Refuses an unsupported combination of the native OMES release, the OMES
 * Control Center contract vendored in `apps/cms`, the AWCMS upstream sync
 * point and the OMES release the storefront markets, by comparing
 * `ops/compat/release-manifest.json` with what is on disk. Deterministic and
 * offline: no network, no database, no secrets. The DB-backed replay /
 * idempotency / tenant-scope proof is `check-cms`'s job in CI; this gate only
 * verifies those tests still exist and still cover what they claim.
 *
 * Usage: bun run compat:preflight [--root <dir>] [--now YYYY-MM-DD]
 *
 *   0  compatible
 *   1  incompatible (one or more findings)
 *   3  an input file is unreadable or malformed
 */
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { formatReport } from "../packages/gerbang/lib/reporter.mjs";
import { gatherCompatInputs, CompatInputError } from "../packages/gerbang/lib/compat-inputs.mjs";
import { evaluateCompat } from "../packages/gerbang/lib/compat-policy.mjs";

export const EXIT_OK = 0;
export const EXIT_INCOMPATIBLE = 1;
export const EXIT_BAD_INPUT = 3;

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..");

export function parseArgs(argv) {
  const value = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return { root: value("--root") ?? REPO_ROOT, now: value("--now") };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log("-- compat:preflight --");
  const now = args.now ? new Date(`${args.now}T00:00:00Z`) : new Date();
  let result;
  try {
    result = evaluateCompat(gatherCompatInputs(args.root), { now });
  } catch (error) {
    if (error instanceof CompatInputError) {
      console.log(`  input error: ${error.message}`);
      process.exit(EXIT_BAD_INPUT);
    }
    throw error;
  }
  const { text, exitCode } = formatReport(
    result.notes,
    result.findings.map((f) => ({ gate: f.check, file: f.file, message: f.message }))
  );
  console.log(text);
  process.exit(exitCode === 0 ? EXIT_OK : EXIT_INCOMPATIBLE);
}

if (import.meta.main) main();
