/**
 * Tests for `packages/gerbang/lib/subtree-ancestry.mjs` (issue #23), run
 * against throwaway git repositories built in a temp directory: an "upstream"
 * with its own release tag, and a "product" that merges it the way a
 * `git subtree pull` does (a real merge commit). No network, no dependence on
 * this repository's own history or remotes.
 */
import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { checkSubtreeAncestry } from "../packages/gerbang/lib/subtree-ancestry.mjs";

const CLI = new URL("../tools/subtree-ancestry-check.mjs", import.meta.url).pathname;
const ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@example.test",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@example.test"
};

function git(cwd, ...args) {
  const r = Bun.spawnSync(["git", "-C", cwd, ...args], { stdout: "pipe", stderr: "pipe", env: ENV });
  if (r.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr.toString()}`);
  return r.stdout.toString().trim();
}

function commit(cwd, file, message) {
  writeFileSync(join(cwd, file), `${message}\n`);
  git(cwd, "add", file);
  git(cwd, "commit", "-q", "-m", message);
  return git(cwd, "rev-parse", "HEAD");
}

/**
 * @returns the upstream and product repos, the upstream commits, and the
 *   product after one correct sync (a `-s ours` merge, which records
 *   ancestry exactly as a real pull's merge commit does).
 */
function fixture({ tagOpt = "--no-tags", fetchSpec = "+refs/heads/main:refs/remotes/awcms/main" } = {}) {
  const base = mkdtempSync(join(tmpdir(), "subtree-ancestry-"));
  const up = join(base, "upstream");
  const product = join(base, "product");
  git(base, "init", "-q", "-b", "main", up);
  const u1 = commit(up, "a", "u1");
  const u2 = commit(up, "b", "u2");
  git(up, "tag", "v9.9.9");

  git(base, "init", "-q", "-b", "main", product);
  commit(product, "p", "p0");
  git(product, "remote", "add", "awcms", up);
  git(product, "config", "remote.awcms.fetch", fetchSpec);
  if (tagOpt) git(product, "config", "remote.awcms.tagopt", tagOpt);
  git(product, "fetch", "-q", "awcms");
  git(product, "merge", "-q", "-s", "ours", "--allow-unrelated-histories", "-m", "sync", "awcms/main");
  git(product, "tag", "v0.1.0");
  return { up, product, u1, u2 };
}

function record(lastSyncCommit, extra = {}) {
  return {
    upstream: "https://x.test/awcms.git",
    remote: "awcms",
    branch: "main",
    lastSyncCommit,
    productTagPattern: "^v\\d+\\.\\d+\\.\\d+$",
    ...extra
  };
}

// The fixture remote's URL is a local path, so tests compare against it.
const rec = (f, sha, extra) => record(sha, { upstream: f.up, ...extra });
const run = (f, sha, opts = {}) =>
  checkSubtreeAncestry({ root: f.product, record: rec(f, sha), requireRemote: true, ...opts });
const text = (r) => r.findings.map((x) => `${x.file}: ${x.message}`).join("\n");

describe("checkSubtreeAncestry", () => {
  test("an intact subtree with the correct record passes", () => {
    const f = fixture();
    const r = run(f, f.u2);
    expect(r.findings).toEqual([]);
    expect(r.notes.join("\n")).toMatch(/merge-base .* equals lastSyncCommit/);
  });

  test("upstream moving ahead without a sync is NOT a finding", () => {
    const f = fixture();
    commit(f.up, "c", "u3");
    git(f.product, "fetch", "-q", "awcms");
    expect(run(f, f.u2).findings).toEqual([]);
  });

  test("a sync merged without updating the record is reported as unrecorded", () => {
    const f = fixture();
    commit(f.up, "c", "u3");
    git(f.product, "fetch", "-q", "awcms");
    git(f.product, "merge", "-q", "-s", "ours", "-m", "sync2", "awcms/main");
    expect(text(run(f, f.u2))).toMatch(/without updating the record/);
  });

  test("a record naming a commit that never landed (a squashed sync) is not an ancestor", () => {
    const f = fixture();
    const u3 = commit(f.up, "c", "u3");
    git(f.product, "fetch", "-q", "awcms");
    expect(text(run(f, u3))).toMatch(/not an ancestor of HEAD/);
  });

  test("a record naming a commit absent from the clone is reported", () => {
    const f = fixture();
    expect(text(run(f, "0123456789abcdef0123456789abcdef01234567"))).toMatch(/not a commit in this clone/);
  });

  test("a malformed record is reported without running git", () => {
    const f = fixture();
    expect(text(run(f, "abc"))).toMatch(/40-hex/);
  });

  test("a wide fetch refspec and a missing --no-tags are reported", () => {
    const f = fixture({ tagOpt: "", fetchSpec: "+refs/heads/*:refs/remotes/awcms/*" });
    const found = text(run(f, f.u2));
    expect(found).toMatch(/fetch refspec/);
    expect(found).toMatch(/tagOpt is not --no-tags/);
  });

  test("an upstream tag that leaked into the clone is reported; the product tag is not", () => {
    const f = fixture();
    git(f.product, "fetch", "-q", "--tags", "awcms");
    const found = text(run(f, f.u2));
    expect(found).toMatch(/tag:v9\.9\.9/);
    expect(found).not.toMatch(/tag:v0\.1\.0/);
  });

  test("a tag outside the product pattern is reported", () => {
    const f = fixture();
    git(f.product, "tag", "release-candidate");
    expect(text(run(f, f.u2))).toMatch(/tag:release-candidate.*product tag pattern/);
  });

  test("without the remote: skipped locally, a finding under requireRemote", () => {
    const f = fixture();
    git(f.product, "remote", "remove", "awcms");
    const lenient = run(f, f.u2, { requireRemote: false });
    expect(lenient.findings).toEqual([]);
    expect(lenient.notes.join("\n")).toMatch(/SKIPPED/);
    expect(text(run(f, f.u2, { requireRemote: true }))).toMatch(/not found|not configured/);
  });

  test("a shallow clone is refused rather than judged", () => {
    const f = fixture();
    const shallow = join(mkdtempSync(join(tmpdir(), "subtree-shallow-")), "c");
    git(tmpdir(), "clone", "-q", "--depth", "1", `file://${f.product}`, shallow);
    const r = checkSubtreeAncestry({ root: shallow, record: rec(f, f.u2), requireRemote: false });
    expect(text(r)).toMatch(/shallow/);
  });
});

describe("tools/subtree-ancestry-check.mjs", () => {
  test("exit 0 for a good fixture, exit 1 for a bad one, exit 1 for a missing record", () => {
    const f = fixture();
    const write = (sha) => {
      const path = join(mkdtempSync(join(tmpdir(), "rec-")), "r.json");
      writeFileSync(path, JSON.stringify(rec(f, sha)));
      return path;
    };
    const cli = (...a) =>
      Bun.spawnSync([process.execPath, CLI, "--root", f.product, ...a], { stdout: "pipe", stderr: "pipe" }).exitCode;

    expect(cli("--record", write(f.u2), "--require-remote")).toBe(0);
    expect(cli("--record", write(f.u1), "--require-remote")).toBe(1);
    expect(cli("--record", join(tmpdir(), "no-such-record.json"))).toBe(1);
  });
});

describe("the committed record", () => {
  test("ops/awcms-subtree.json is well-formed", () => {
    const r = JSON.parse(readFileSync("ops/awcms-subtree.json", "utf8"));
    expect(r.lastSyncCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(r.remote).toBe("awcms");
    expect(r.branch).toBe("main");
    expect(r.prefix).toBe("apps/cms");
    expect(() => new RegExp(r.productTagPattern)).not.toThrow();
  });
});
