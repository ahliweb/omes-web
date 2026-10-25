#!/usr/bin/env bun
/**
 * repo-settings-guard.mjs — `bun run audit:repo-settings` (issue #23).
 *
 * Reads this repository's LIVE GitHub settings (merge methods, `main`'s
 * branch protection, repository rulesets) and judges them against
 * `packages/gerbang/lib/repo-settings-policy.mjs`. See that module for the
 * policy and for why it is read rather than remembered.
 *
 * Usage:
 *   bun run audit:repo-settings                      # live, via `gh api`
 *   bun run audit:repo-settings --repo owner/name    # default: parsed from `origin`
 *   bun run audit:repo-settings --from <dir>         # fixtures: repo.json, protection.json, rulesets.json
 *
 * Exit codes (distinct on purpose — CI and a human must be able to tell a
 * violated policy from an audit that could not run):
 *   0  every policy line holds
 *   1  at least one finding (the settings are wrong)
 *   2  the settings could not be read — `gh` missing, unauthenticated, or the
 *      caller lacks admin rights. FAIL CLOSED: an unreadable setting is never
 *      reported as a passing one.
 *
 * Reading branch protection needs repository ADMIN rights; the default
 * `GITHUB_TOKEN` of a workflow cannot. That is why this audit is a
 * maintainer-run command and not a CI step (docs/alur-kerja-pengembangan.md,
 * "Branch protection on `main`").
 */
import { join } from "node:path";

import { readFileIfPresent } from "../packages/gerbang/lib/files.mjs";
import { ghApi } from "../packages/gerbang/lib/gh.mjs";
import { gitRun } from "../packages/gerbang/lib/git.mjs";
import {
  PROTECTED_BRANCH,
  evaluateRepoSettings
} from "../packages/gerbang/lib/repo-settings-policy.mjs";
import { createReporter } from "../packages/gerbang/lib/reporter.mjs";

const EXIT_UNAVAILABLE = 2;
const ROOT = new URL("..", import.meta.url).pathname;

/** @param {string} flag */
function argValue(flag) {
  const at = process.argv.indexOf(flag);
  return at === -1 ? undefined : process.argv[at + 1];
}

/** `owner/name` from an https or ssh GitHub remote URL, or null. */
function slugFromRemote(url) {
  const match = /github\.com[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?\/?\s*$/.exec(url ?? "");
  return match ? match[1] : null;
}

function unavailable(reason) {
  console.error(`-- audit:repo-settings --\n  UNAVAILABLE — ${reason}\n  Failing closed (exit ${EXIT_UNAVAILABLE}): unreadable settings are not treated as passing.`);
  process.exit(EXIT_UNAVAILABLE);
}

/** GitHub's "not protected" answer is a finding, not an outage. */
function isNotProtected(message) {
  return /Branch not protected/i.test(message);
}

/** @returns {{ repo: any, protection: any, rulesets: any, source: string }} */
function loadFixtures(dir) {
  const read = (name) => {
    const text = readFileIfPresent(join(dir, name));
    if (text === null) unavailable(`fixture ${join(dir, name)} is missing`);
    try {
      return JSON.parse(text);
    } catch {
      return unavailable(`fixture ${join(dir, name)} is not valid JSON`);
    }
  };
  const protection = read("protection.json");
  return {
    repo: read("repo.json"),
    protection: protection?.message && isNotProtected(protection.message) ? null : protection,
    rulesets: read("rulesets.json"),
    source: `fixtures in ${dir}`
  };
}

function loadLive() {
  const slug =
    argValue("--repo") ?? slugFromRemote(gitRun(ROOT, "remote", "get-url", "origin")?.trim());
  if (!slug) unavailable("no --repo given and `origin` is not a GitHub remote");

  const repo = ghApi(`repos/${slug}`);
  if (!repo.ok) unavailable(`repos/${slug}: ${repo.message}`);

  const protection = ghApi(`repos/${slug}/branches/${PROTECTED_BRANCH}/protection`);
  if (!protection.ok && !(protection.status === 404 && isNotProtected(protection.message))) {
    unavailable(`branch protection of ${PROTECTED_BRANCH}: ${protection.message} (administrator rights are required to read it)`);
  }

  const rulesets = ghApi(`repos/${slug}/rulesets`);
  if (!rulesets.ok) unavailable(`rulesets: ${rulesets.message}`);

  return {
    repo: repo.json,
    protection: protection.ok ? protection.json : null,
    rulesets: rulesets.json,
    source: `live GitHub API for ${slug}`
  };
}

const fromDir = argValue("--from");
const input = fromDir ? loadFixtures(fromDir) : loadLive();

const report = createReporter("audit:repo-settings");
report.note(`source: ${input.source}`);
report.note(`${PROTECTED_BRANCH}: merge methods, protection, reviews, ${input.rulesets?.length ?? 0} ruleset(s) evaluated`);

for (const { gate, file, message } of evaluateRepoSettings(input)) report.violation(gate, file, message);

report.finish();
