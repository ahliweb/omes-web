/**
 * subtree-ancestry.mjs — is the `apps/cms` subtree's git ancestry intact?
 *
 * ## What can go wrong, and why a file in the tree cannot show it
 *
 * `git subtree pull` needs a merge base shared with upstream. A subtree-sync
 * PR that is squashed or rebased replaces upstream's commits with one
 * synthetic commit; CI stays green, and the break surfaces only at the NEXT
 * pull, far from the cause (AGENTS.md, "The subtree embed"). Likewise a
 * plain `git fetch` of the upstream remote imports upstream's release tags
 * into this clone, where `tools/rilis.mjs` then mistakes `v10.3.0` for this
 * repository's own latest release.
 *
 * ## The single recorded fact
 *
 * `ops/awcms-subtree.json` records `lastSyncCommit`, the upstream commit the
 * tree last synced to. Every subtree-sync PR updates it in the same change
 * (a sync that does not is exactly an "unrecorded sync" below). One
 * machine-readable value replaces prose that drifts: AGENTS.md's "Last sync"
 * row was once three syncs stale.
 *
 * ## What is checked
 *
 *   1. the clone is not shallow (ancestry cannot be judged without history);
 *   2. `lastSyncCommit` exists and is an ancestor of HEAD;
 *   3. when the upstream remote ref exists, `git merge-base HEAD <remote>/<branch>`
 *      EQUALS `lastSyncCommit`. A merge base that is a descendant of the
 *      record means a sync landed without recording it; any other value
 *      means the record is not on the path to upstream (ancestry broken);
 *   4. the remote, when configured, fetches only `<branch>`, has
 *      `tagOpt --no-tags`, and points at the recorded upstream URL;
 *   5. every local tag matches the product pattern, and none points at a
 *      commit that is an ancestor of `lastSyncCommit` (i.e. into upstream's
 *      own history) — those are upstream's release tags.
 *
 * Absent remote ref: skipped with a note, or a finding when
 * `requireRemote` is set (CI sets it).
 *
 * Needs a full-history checkout; it asks git, so it belongs in a dedicated
 * workflow and never in the bare `bun test` path (its unit tests build a
 * throwaway repository instead).
 */
import { gitLines, gitRun } from "./git.mjs";

const GATE = "subtree-ancestry";
const SHA = /^[0-9a-f]{40}$/;

/** `https://host/x/y.git`, `…/y` and trailing slashes compare equal. */
function normalizeUrl(url) {
  return String(url ?? "").trim().replace(/\/+$/, "").replace(/\.git$/, "").toLowerCase();
}

/**
 * @param {{ root: string, record: any, requireRemote?: boolean }} options
 * @returns {{ notes: string[], findings: { gate: string, file: string, message: string }[] }}
 */
export function checkSubtreeAncestry({ root, record, requireRemote = false }) {
  const notes = [];
  const findings = [];
  const add = (file, message) => findings.push({ gate: GATE, file, message });
  const git = (...args) => gitRun(root, ...args);

  const recordFile = "ops/awcms-subtree.json";
  const { remote, branch, lastSyncCommit: recorded } = record ?? {};
  if (!SHA.test(recorded ?? "") || !remote || !branch) {
    add(recordFile, "must carry a 40-hex lastSyncCommit and a remote and branch name");
    return { notes, findings };
  }

  if (git("rev-parse", "HEAD") === null) {
    add("git", "not a git checkout (or no commits) — ancestry cannot be judged");
    return { notes, findings };
  }
  if (git("rev-parse", "--is-shallow-repository")?.trim() === "true") {
    add("git", "shallow clone — ancestry needs full history (use fetch-depth: 0)");
    return { notes, findings };
  }

  // 2. the recorded commit is in HEAD's history
  const known = git("cat-file", "-e", `${recorded}^{commit}`) !== null;
  const isAncestor = (a, b) => git("merge-base", "--is-ancestor", a, b) !== null;
  if (!known) {
    add(recordFile, `lastSyncCommit ${recorded.slice(0, 8)} is not a commit in this clone — fetch ${remote} or fix the record`);
  } else if (!isAncestor(recorded, "HEAD")) {
    add(recordFile, `lastSyncCommit ${recorded.slice(0, 8)} is not an ancestor of HEAD — the sync it names is not in this history (squashed or rebased?)`);
  } else {
    notes.push(`lastSyncCommit ${recorded.slice(0, 8)} is an ancestor of HEAD`);
  }

  // 3. merge-base against the upstream remote ref
  const remoteRef = `refs/remotes/${remote}/${branch}`;
  const haveRef = git("rev-parse", "--verify", "--quiet", remoteRef) !== null;
  if (!haveRef) {
    if (requireRemote) add(`remote:${remote}`, `${remoteRef} not found — add the remote and fetch it before this audit`);
    else notes.push(`remote ref ${remoteRef} not present — merge-base check SKIPPED (pass --require-remote to demand it)`);
  } else if (known) {
    const base = git("merge-base", "HEAD", remoteRef)?.trim();
    if (!base) {
      add(`remote:${remote}`, `HEAD and ${remoteRef} share no merge base — subtree ancestry is lost`);
    } else if (base === recorded) {
      notes.push(`merge-base with ${remote}/${branch} equals lastSyncCommit`);
    } else if (isAncestor(recorded, base)) {
      add(recordFile, `merge-base with ${remote}/${branch} is ${base.slice(0, 8)}, newer than the recorded ${recorded.slice(0, 8)} — a sync landed without updating the record`);
    } else {
      add(recordFile, `merge-base with ${remote}/${branch} is ${base.slice(0, 8)}, which does not descend from the recorded ${recorded.slice(0, 8)} — ancestry broken`);
    }
  }

  // 4. remote configuration
  const url = git("config", "--get", `remote.${remote}.url`)?.trim();
  if (!url) {
    if (requireRemote) add(`remote:${remote}`, "remote is not configured");
    else notes.push(`remote ${remote} not configured — remote configuration check SKIPPED`);
  } else {
    const fetchSpecs = gitLines(git("config", "--get-all", `remote.${remote}.fetch`));
    const wanted = `+refs/heads/${branch}:refs/remotes/${remote}/${branch}`;
    if (fetchSpecs.length !== 1 || fetchSpecs[0] !== wanted) {
      add(`remote:${remote}`, `fetch refspec is ${JSON.stringify(fetchSpecs)}, expected exactly ["${wanted}"] — a wide refspec drags in every upstream branch`);
    }
    if (git("config", "--get", `remote.${remote}.tagopt`)?.trim() !== "--no-tags") {
      add(`remote:${remote}`, "tagOpt is not --no-tags — a fetch would import upstream's release tags into this repository's tag namespace");
    }
    if (normalizeUrl(url) !== normalizeUrl(record.upstream)) {
      add(`remote:${remote}`, `url is ${url}, the record says ${record.upstream}`);
    }
    notes.push(`remote ${remote}: refspec, tagOpt and url checked`);
  }

  // 5. tags
  let pattern = null;
  try {
    pattern = new RegExp(record.productTagPattern);
  } catch {
    add(recordFile, "productTagPattern is not a valid regular expression");
  }
  const tags = gitLines(git("tag", "--list"));
  for (const tag of tags) {
    if (pattern && !pattern.test(tag)) {
      add(`tag:${tag}`, `does not match the product tag pattern ${record.productTagPattern}`);
      continue;
    }
    const commit = git("rev-list", "-n", "1", tag)?.trim();
    if (known && commit && isAncestor(commit, recorded)) {
      add(`tag:${tag}`, `points at ${commit.slice(0, 8)}, inside upstream's history (an ancestor of lastSyncCommit) — an upstream tag; delete it with \`git tag -d ${tag}\``);
    }
  }
  notes.push(`${tags.length} local tag(s) examined`);

  return { notes, findings };
}
