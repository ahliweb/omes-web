/**
 * gh.mjs — read-only GitHub API access through the `gh` CLI, never a shell.
 *
 * Mirrors `git.mjs`: the command is an argv array, so a repository slug or an
 * endpoint can never be reinterpreted by `/bin/sh`. Authentication is `gh`'s
 * own business (`GH_TOKEN` / `GITHUB_TOKEN` / a stored login); this module
 * reads no environment variable and never prints a credential.
 *
 * It only ever issues `GET` — there is deliberately no method parameter.
 */

/**
 * @typedef {{ ok: true, json: any }
 *   | { ok: false, status: number | null, message: string }} GhResult
 */

/**
 * `gh api <endpoint>` parsed as JSON.
 *
 * Failure carries the HTTP status when `gh` reported one (`gh: ... (HTTP 404)`),
 * so a caller can tell "branch not protected" (404) from "not allowed to ask"
 * (401/403) from "gh missing / offline" (`status: null`). It never throws.
 *
 * @param {string} endpoint - e.g. `repos/ahliweb/omes-web`
 * @returns {GhResult}
 */
export function ghApi(endpoint) {
  let result;
  try {
    result = Bun.spawnSync(["gh", "api", endpoint], { stderr: "pipe", stdout: "pipe" });
  } catch {
    return { ok: false, status: null, message: "the `gh` CLI could not be started (not installed?)" };
  }

  if (result.exitCode !== 0) {
    const stderr = result.stderr.toString().trim();
    const stdout = result.stdout.toString().trim();
    const status = /HTTP (\d{3})/.exec(stderr)?.[1];
    // `gh` prints the API error body on stdout; its message is the useful part.
    let apiMessage = "";
    try {
      apiMessage = JSON.parse(stdout)?.message ?? "";
    } catch {
      /* not JSON — stderr alone will do */
    }
    return {
      ok: false,
      status: status ? Number(status) : null,
      message: [stderr, apiMessage].filter(Boolean).join(" | ") || `gh exited ${result.exitCode}`
    };
  }

  try {
    return { ok: true, json: JSON.parse(result.stdout.toString()) };
  } catch {
    return { ok: false, status: null, message: `gh api ${endpoint} did not return JSON` };
  }
}
