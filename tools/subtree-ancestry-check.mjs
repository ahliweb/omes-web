#!/usr/bin/env bun
/**
 * subtree-ancestry-check.mjs — `bun run audit:subtree` (issue #23).
 *
 * Asserts the `apps/cms` subtree's git ancestry is intact: the recorded sync
 * point is in history, the merge base with upstream equals it, the upstream
 * remote is narrowed and tag-free, and no upstream tag leaked into the
 * product's tag namespace. What exactly is checked, and why, is the docblock
 * of `packages/gerbang/lib/subtree-ancestry.mjs`.
 *
 * Usage:
 *   bun run audit:subtree                    # local: skips the remote checks if the remote is not set up
 *   bun run audit:subtree --require-remote   # CI: a missing remote or remote ref is a finding
 *   --root <dir>      checkout to inspect (default: this repository)
 *   --record <file>   sync record (default: ops/awcms-subtree.json under --root)
 *
 * Needs full history and (for the merge-base check) a fetched upstream ref, so
 * it runs in `.github/workflows/governance.yml`, not in the bare root
 * `bun test`. Exit 0 = intact, 1 = findings.
 */
import { join, resolve } from "node:path";

import { readFileIfPresent } from "../packages/gerbang/lib/files.mjs";
import { createReporter } from "../packages/gerbang/lib/reporter.mjs";
import { checkSubtreeAncestry } from "../packages/gerbang/lib/subtree-ancestry.mjs";

/** @param {string} flag */
function argValue(flag) {
  const at = process.argv.indexOf(flag);
  return at === -1 ? undefined : process.argv[at + 1];
}

const root = resolve(argValue("--root") ?? new URL("..", import.meta.url).pathname);
const recordPath = resolve(argValue("--record") ?? join(root, "ops/awcms-subtree.json"));

const report = createReporter("audit:subtree");

const text = readFileIfPresent(recordPath);
let record = null;
if (text === null) {
  report.violation("subtree-ancestry", recordPath, "sync record does not exist");
} else {
  try {
    record = JSON.parse(text);
  } catch {
    report.violation("subtree-ancestry", recordPath, "sync record is not valid JSON");
  }
}

if (record) {
  const { notes, findings } = checkSubtreeAncestry({
    root,
    record,
    requireRemote: process.argv.includes("--require-remote")
  });
  for (const line of notes) report.note(line);
  for (const { gate, file, message } of findings) report.violation(gate, file, message);
}

report.finish();
