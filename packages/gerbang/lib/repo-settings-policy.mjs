/**
 * repo-settings-policy.mjs — what this repository's GitHub settings MUST say.
 *
 * ## Why a policy evaluator and not a paragraph in a document
 *
 * `apps/cms` is `ahliweb/awcms` embedded by `git subtree`, and the whole
 * embed rests on one mechanical fact: a subtree-sync PR must land as a real
 * merge commit (AGENTS.md, "The subtree embed"). That is enforced by GitHub
 * settings, not by any file in the tree — and settings can be changed, or
 * were never what a document claims, without a single commit showing it. The
 * first version of issue #23 was filed against settings that had in fact
 * already changed; the lesson is that these facts must be READ, not
 * remembered. This module is the pure half of that: it takes the three JSON
 * documents the GitHub API returns and says what is wrong. The fetching half
 * is `tools/repo-settings-guard.mjs`.
 *
 * ## The policy (each line is a finding when violated)
 *
 *   - merge commits allowed; squash and rebase merges OFF (a squashed subtree
 *     pull destroys the merge base the next pull needs);
 *   - `main` is protected: force-push OFF, deletion OFF, `enforce_admins` ON
 *     (so no administrator bypass), conversation resolution ON;
 *   - required linear history OFF — it forbids the merge commits the subtree
 *     model is built from;
 *   - at least {@link MIN_APPROVING_REVIEWS} approving review, stale reviews
 *     dismissed on push;
 *   - strict required status checks containing every context in
 *     {@link EXPECTED_REQUIRED_CONTEXTS};
 *   - no ACTIVE repository ruleset that gives anyone a bypass (a ruleset is a
 *     second protection layer; an empty list is the verified state today).
 *
 * ## Single source for the context set
 *
 * {@link EXPECTED_REQUIRED_CONTEXTS} is the only place the expected names are
 * written. `tests/repo-settings-policy.test.mjs` asserts that every one is a
 * real job name produced by a workflow file in `.github/workflows/`, so a
 * renamed job cannot leave a phantom required check behind.
 *
 * Pure: no I/O, no clock, no network.
 */

/** The branch the policy protects. */
export const PROTECTED_BRANCH = "main";

/** Approving reviews required before merge. */
export const MIN_APPROVING_REVIEWS = 1;

/**
 * Status-check contexts `main` must require. Protection may require MORE
 * (additive promotion is normal); it may never require fewer.
 */
export const EXPECTED_REQUIRED_CONTEXTS = Object.freeze([
  "Check (toko)",
  "Check (berita)",
  "Check (landing)",
  "check-cms",
  "template-init-smoke (toko)",
  "template-init-smoke (berita)",
  "template-init-smoke (landing)",
  "template-init-smoke (root-suite)",
  "e2e (toko)",
  "e2e (berita)",
  "e2e (landing)",
  "Analyze (javascript-typescript)"
]);

const GATE = "repo-settings";

/**
 * @typedef {{ gate: string, file: string, message: string }} Finding
 * @param {{ repo: any, protection: any, rulesets: any }} input - the parsed
 *   responses of `repos/{r}`, `repos/{r}/branches/main/protection` (null when
 *   GitHub answered "Branch not protected") and `repos/{r}/rulesets`
 * @returns {Finding[]}
 */
export function evaluateRepoSettings({ repo, protection, rulesets }) {
  /** @type {Finding[]} */
  const findings = [];
  const add = (file, message) => findings.push({ gate: GATE, file, message });

  // --- repository merge settings -------------------------------------------
  if (repo?.allow_merge_commit !== true) {
    add("repo", "allow_merge_commit is not true — a subtree sync can only land as a merge commit");
  }
  if (repo?.allow_squash_merge !== false) {
    add("repo", "allow_squash_merge is not false — a squashed subtree pull destroys the merge base the next pull needs");
  }
  if (repo?.allow_rebase_merge !== false) {
    add("repo", "allow_rebase_merge is not false — a rebased subtree pull destroys the merge base the next pull needs");
  }

  // --- branch protection ---------------------------------------------------
  if (!protection) {
    add(`branch:${PROTECTED_BRANCH}`, `${PROTECTED_BRANCH} has no branch protection`);
  } else {
    const where = `branch:${PROTECTED_BRANCH}`;
    if (protection.allow_force_pushes?.enabled !== false) add(where, "force pushes are not refused");
    if (protection.allow_deletions?.enabled !== false) add(where, "branch deletion is not refused");
    if (protection.enforce_admins?.enabled !== true) {
      add(where, "enforce_admins is not on — an administrator could merge past a red check or a missing review");
    }
    if (protection.required_linear_history?.enabled !== false) {
      add(where, "required linear history is on (or unreadable) — it forbids the merge commits the full-history subtree model needs; it must stay OFF");
    }
    if (protection.required_conversation_resolution?.enabled !== true) {
      add(where, "required conversation resolution is not on");
    }

    const reviews = protection.required_pull_request_reviews;
    if (!reviews) {
      add(where, "pull requests are not required to be reviewed (required_pull_request_reviews absent)");
    } else {
      if (!(reviews.required_approving_review_count >= MIN_APPROVING_REVIEWS)) {
        add(where, `required_approving_review_count is ${reviews.required_approving_review_count ?? "unset"}, expected at least ${MIN_APPROVING_REVIEWS}`);
      }
      if (reviews.dismiss_stale_reviews !== true) {
        add(where, "dismiss_stale_reviews is not on — an approval would survive a later push");
      }
    }

    const checks = protection.required_status_checks;
    if (!checks) {
      add(where, "no required status checks");
    } else {
      if (checks.strict !== true) add(where, "required status checks are not strict (branch need not be up to date before merging)");
      const present = new Set([
        ...(checks.contexts ?? []),
        ...(checks.checks ?? []).map((c) => c?.context)
      ]);
      for (const context of EXPECTED_REQUIRED_CONTEXTS) {
        if (!present.has(context)) add(where, `required status check "${context}" is missing`);
      }
    }
  }

  // --- repository rulesets -------------------------------------------------
  if (!Array.isArray(rulesets)) {
    add("rulesets", "rulesets response is not a list");
  } else {
    for (const ruleset of rulesets) {
      if (ruleset?.enforcement === "active" && (ruleset.bypass_actors?.length ?? 0) > 0) {
        add(`ruleset:${ruleset.name ?? ruleset.id}`, "an active ruleset grants bypass actors — this repository's policy is no bypass");
      }
    }
  }

  return findings;
}
