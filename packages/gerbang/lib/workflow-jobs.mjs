/**
 * workflow-jobs.mjs — the status-check names a GitHub Actions workflow produces.
 *
 * ## Why this exists
 *
 * Branch protection names required status checks as free text. A name that
 * matches no real job is not an error anywhere: GitHub accepts it, the check
 * never reports, and the PR waits forever — or, worse, a renamed job silently
 * stops being required. `repo-settings-policy.mjs` keeps the expected context
 * set in one place; this module derives, from the workflow files themselves,
 * the names that can actually appear, so a test can assert the two agree.
 *
 * ## What it understands (deliberately small)
 *
 * Only the shapes this repo's workflows use: a job's `name:` (optionally
 * containing `${{ matrix.<axis> }}`) and a one-line inline matrix axis
 * (`axis: [a, b, c]`). A static `name:` on a matrix job gets GitHub's own
 * " (value)" suffix; a job with no `name:` is named by its id. Anything else
 * (an `include:` matrix, a multi-line axis) is not expanded, and the job's
 * name is returned unexpanded — which then fails the comparison loudly
 * instead of passing quietly.
 *
 * Pure: takes workflow text, reads nothing.
 */

/**
 * @param {string} text - the contents of one workflow file
 * @returns {string[]} every check name its jobs can report
 */
export function workflowCheckNames(text) {
  const lines = text.split("\n");
  const jobsAt = lines.findIndex((line) => /^jobs:\s*$/.test(line));
  if (jobsAt === -1) return [];

  /** @type {{ id: string, lines: string[] }[]} */
  const jobs = [];
  for (const line of lines.slice(jobsAt + 1)) {
    if (/^\S/.test(line)) break; // next top-level key ends the jobs block
    const header = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (header) jobs.push({ id: header[1], lines: [] });
    else if (jobs.length > 0) jobs[jobs.length - 1].lines.push(line);
  }

  const names = [];
  for (const job of jobs) {
    const nameLine = job.lines.find((line) => /^ {4}name:/.test(line));
    const rawName = nameLine
      ? nameLine.replace(/^ {4}name:\s*/, "").replace(/\s+#.*$/, "").replace(/^(["'])(.*)\1$/, "$2")
      : job.id;

    /** @type {Record<string, string[]>} */
    const axes = {};
    for (const line of job.lines) {
      const axis = /^ {8}([A-Za-z0-9_-]+):\s*\[(.*)\]\s*$/.exec(line);
      if (axis) axes[axis[1]] = axis[2].split(",").map((v) => v.trim()).filter(Boolean);
    }

    const axisNames = Object.keys(axes);
    if (axisNames.length === 0) {
      names.push(rawName);
      continue;
    }

    const ref = /\$\{\{\s*matrix\.([A-Za-z0-9_-]+)\s*\}\}/.exec(rawName);
    if (ref && axes[ref[1]]) {
      for (const value of axes[ref[1]]) {
        names.push(rawName.replace(/\$\{\{\s*matrix\.[A-Za-z0-9_-]+\s*\}\}/g, value));
      }
    } else if (!ref && axisNames.length === 1) {
      for (const value of axes[axisNames[0]]) names.push(`${rawName} (${value})`);
    } else {
      names.push(rawName);
    }
  }
  return names;
}
