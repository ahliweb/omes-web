/**
 * Fixture-based tests for the repo-settings policy (issue #23): the pure
 * evaluator, the CLI's exit-code contract (0 / 1 / 2 — fail closed), and the
 * guarantee that every expected required context is a real job name in
 * `.github/workflows/`.
 */
import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  EXPECTED_REQUIRED_CONTEXTS,
  evaluateRepoSettings
} from "../packages/gerbang/lib/repo-settings-policy.mjs";
import { workflowCheckNames } from "../packages/gerbang/lib/workflow-jobs.mjs";

const CLI = new URL("../tools/repo-settings-guard.mjs", import.meta.url).pathname;

/** The state read from the live API on 2026-10-25. */
function goodRepo() {
  return { allow_merge_commit: true, allow_squash_merge: false, allow_rebase_merge: false, delete_branch_on_merge: true };
}
function goodProtection() {
  return {
    required_status_checks: {
      strict: true,
      contexts: [...EXPECTED_REQUIRED_CONTEXTS],
      checks: EXPECTED_REQUIRED_CONTEXTS.map((context) => ({ context, app_id: 15368 }))
    },
    required_pull_request_reviews: { required_approving_review_count: 1, dismiss_stale_reviews: true },
    enforce_admins: { enabled: true },
    required_linear_history: { enabled: false },
    allow_force_pushes: { enabled: false },
    allow_deletions: { enabled: false },
    required_conversation_resolution: { enabled: true }
  };
}
const good = () => ({ repo: goodRepo(), protection: goodProtection(), rulesets: [] });

function messages(input) {
  return evaluateRepoSettings(input).map((f) => f.message);
}

describe("evaluateRepoSettings", () => {
  test("the verified state passes", () => {
    expect(evaluateRepoSettings(good())).toEqual([]);
  });

  test("squash and rebase merges are findings; merge commit off is a finding", () => {
    const input = good();
    input.repo = { allow_merge_commit: false, allow_squash_merge: true, allow_rebase_merge: true };
    const found = messages(input).join("\n");
    expect(found).toMatch(/allow_merge_commit/);
    expect(found).toMatch(/allow_squash_merge/);
    expect(found).toMatch(/allow_rebase_merge/);
  });

  test("an unprotected main is one finding, not a crash", () => {
    const found = evaluateRepoSettings({ ...good(), protection: null });
    expect(found.length).toBe(1);
    expect(found[0].message).toMatch(/no branch protection/);
  });

  test.each([
    ["allow_force_pushes", { enabled: true }, /force pushes/],
    ["allow_deletions", { enabled: true }, /deletion/],
    ["enforce_admins", { enabled: false }, /enforce_admins/],
    ["required_linear_history", { enabled: true }, /linear history/],
    ["required_conversation_resolution", { enabled: false }, /conversation/]
  ])("%s violated is reported", (key, value, pattern) => {
    const input = good();
    input.protection[key] = value;
    expect(messages(input).join("\n")).toMatch(pattern);
  });

  test("missing key objects fail closed (an absent flag is not a pass)", () => {
    const input = good();
    delete input.protection.required_linear_history;
    delete input.protection.enforce_admins;
    expect(messages(input).length).toBe(2);
  });

  test("reviews: absent, zero, and not-dismissing-stale are each findings", () => {
    let input = good();
    delete input.protection.required_pull_request_reviews;
    expect(messages(input).join("\n")).toMatch(/not required to be reviewed/);

    input = good();
    input.protection.required_pull_request_reviews.required_approving_review_count = 0;
    expect(messages(input).join("\n")).toMatch(/required_approving_review_count is 0/);

    input = good();
    input.protection.required_pull_request_reviews.dismiss_stale_reviews = false;
    expect(messages(input).join("\n")).toMatch(/dismiss_stale_reviews/);
  });

  test("a missing required context is named; extra contexts are allowed", () => {
    const input = good();
    input.protection.required_status_checks.contexts = EXPECTED_REQUIRED_CONTEXTS.filter((c) => c !== "check-cms");
    input.protection.required_status_checks.checks = [];
    expect(messages(input)).toEqual(['required status check "check-cms" is missing']);

    const more = good();
    more.protection.required_status_checks.contexts.push("governance");
    expect(evaluateRepoSettings(more)).toEqual([]);
  });

  test("non-strict status checks are a finding", () => {
    const input = good();
    input.protection.required_status_checks.strict = false;
    expect(messages(input).join("\n")).toMatch(/not strict/);
  });

  test("an active ruleset with bypass actors is a finding; an evaluate-only one is not", () => {
    const input = good();
    input.rulesets = [
      { id: 1, name: "r1", enforcement: "active", bypass_actors: [{ actor_id: 5 }] },
      { id: 2, name: "r2", enforcement: "evaluate", bypass_actors: [{ actor_id: 5 }] },
      { id: 3, name: "r3", enforcement: "active", bypass_actors: [] }
    ];
    const found = evaluateRepoSettings(input);
    expect(found.length).toBe(1);
    expect(found[0].file).toBe("ruleset:r1");
  });
});

describe("EXPECTED_REQUIRED_CONTEXTS names real workflow jobs", () => {
  const produced = new Set(
    readdirSync(".github/workflows")
      .filter((name) => name.endsWith(".yml"))
      .flatMap((name) => workflowCheckNames(readFileSync(join(".github/workflows", name), "utf8")))
  );

  test("the workflow parser expands matrix names (non-vacuity)", () => {
    expect(produced.has("Check (toko)")).toBe(true);
    expect(produced.has("template-init-smoke (root-suite)")).toBe(true);
  });

  test.each(EXPECTED_REQUIRED_CONTEXTS.map((c) => [c]))("%s is produced by a workflow job", (context) => {
    expect(produced.has(context)).toBe(true);
  });
});

describe("tools/repo-settings-guard.mjs — exit codes", () => {
  function fixtureDir({ repo = goodRepo(), protection = goodProtection(), rulesets = [] } = {}) {
    const dir = mkdtempSync(join(tmpdir(), "repo-settings-"));
    writeFileSync(join(dir, "repo.json"), JSON.stringify(repo));
    writeFileSync(join(dir, "protection.json"), JSON.stringify(protection));
    writeFileSync(join(dir, "rulesets.json"), JSON.stringify(rulesets));
    return dir;
  }
  const run = (...args) => {
    const r = Bun.spawnSync([process.execPath, CLI, ...args], { stdout: "pipe", stderr: "pipe" });
    return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
  };

  test("good fixtures exit 0", () => {
    expect(run("--from", fixtureDir()).code).toBe(0);
  });

  test("violating fixtures exit 1", () => {
    const dir = fixtureDir({ repo: { ...goodRepo(), allow_squash_merge: true } });
    const r = run("--from", dir);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/allow_squash_merge/);
  });

  test("GitHub's 'Branch not protected' body is a finding (exit 1), not an outage", () => {
    const r = run("--from", fixtureDir({ protection: { message: "Branch not protected" } }));
    expect(r.code).toBe(1);
  });

  test("missing or malformed fixtures exit 2 (fail closed)", () => {
    expect(run("--from", join(tmpdir(), "does-not-exist-repo-settings")).code).toBe(2);
    const dir = fixtureDir();
    writeFileSync(join(dir, "rulesets.json"), "{not json");
    expect(run("--from", dir).code).toBe(2);
  });

  test("live mode without a usable gh exits 2, never 0", () => {
    const r = Bun.spawnSync([process.execPath, CLI, "--repo", "ahliweb/omes-web"], {
      stdout: "pipe",
      stderr: "pipe",
      env: { PATH: "/nonexistent", HOME: "/nonexistent" }
    });
    expect(r.exitCode).toBe(2);
    expect(r.stderr.toString()).toMatch(/UNAVAILABLE/);
  });
});

describe("workflowCheckNames", () => {
  test("static name + one axis gets GitHub's suffix; jobs without a name use their id", () => {
    const yml = [
      "jobs:",
      "  a:",
      "    name: Check",
      "    strategy:",
      "      matrix:",
      "        p: [x, y]",
      "  b:",
      "    runs-on: ubuntu-latest",
      "  c:",
      '    name: "t (${{ matrix.q }})"',
      "    strategy:",
      "      matrix:",
      "        q: [one]"
    ].join("\n");
    expect(workflowCheckNames(yml)).toEqual(["Check (x)", "Check (y)", "b", "t (one)"]);
  });
});
