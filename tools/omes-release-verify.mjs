#!/usr/bin/env bun
/**
 * omes-release-verify.mjs — `bun run verify:omes-release` (issue #16).
 *
 * Proves that `apps/storefront/src/config/omes-rilis.json` — the release the
 * landing page presents and the install command it prints — is true of the
 * real `ahliweb/omes` repository, using only the GitHub REST API:
 *
 *   1. releases/tags/<tag>   → published (not draft), not a prerelease, and
 *                              published on the recorded date;
 *   2. git/ref/tags/<tag>    → the tag points at the recorded tag object;
 *   3. git/tags/<sha>        → an annotated tag object whose target is the
 *                              recorded commit;
 *   4. git/trees/<commit>    → install/bootstrap.sh has the recorded blob sha.
 *
 * It NEVER downloads or executes the installer: the blob sha is read from
 * the tree listing. (The sha256 in the metadata was computed once, by hand,
 * from the raw file and is not re-checked here for that reason.)
 *
 * FAIL CLOSED: any network/API error or mismatch exits non-zero, and the two
 * causes have distinct codes so CI can tell "the manifest is wrong" from
 * "we could not ask":
 *
 *   0  verified
 *   1  mismatch — the metadata disagrees with GitHub
 *   2  could not verify — network error, rate limit, 4xx/5xx, bad JSON
 *   3  the metadata file itself is unreadable or malformed
 *
 * Env: GITHUB_TOKEN (optional) raises the API rate limit; see .env.example.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const EXIT_OK = 0;
export const EXIT_MISMATCH = 1;
export const EXIT_UNVERIFIED = 2;
export const EXIT_BAD_METADATA = 3;

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..");
export const METADATA_PATH = join(REPO_ROOT, "apps/storefront/src/config/omes-rilis.json");

export class UnverifiedError extends Error {}

async function getJson(fetchImpl, url, token) {
  const headers = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "omes-web-release-verify" };
  if (token) headers.authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetchImpl(url, { headers });
  } catch (error) {
    throw new UnverifiedError(`network error for ${url}: ${error?.message ?? error}`);
  }
  if (!res.ok) throw new UnverifiedError(`GET ${url} answered HTTP ${res.status}`);
  try {
    return await res.json();
  } catch {
    throw new UnverifiedError(`GET ${url} did not return JSON`);
  }
}

/**
 * Returns an array of mismatch messages (empty = verified). Throws
 * UnverifiedError when GitHub cannot be asked or answers unexpectedly.
 */
export async function verifyRelease(meta, { fetch: fetchImpl = fetch, token } = {}) {
  const api = `https://api.github.com/repos/${meta.repository}`;
  const mismatches = [];
  const expect = (what, actual, wanted) => {
    if (actual !== wanted) mismatches.push(`${what}: GitHub says ${JSON.stringify(actual)}, metadata says ${JSON.stringify(wanted)}`);
  };

  const release = await getJson(fetchImpl, `${api}/releases/tags/${meta.tag}`, token);
  expect("release.tag_name", release.tag_name, meta.tag);
  expect("release.draft", release.draft, false);
  expect("release.prerelease", release.prerelease, false);
  if (typeof release.published_at !== "string") throw new UnverifiedError("release has no published_at");
  expect("release.published_at (date)", release.published_at.slice(0, 10), meta.publishedAt);

  const ref = await getJson(fetchImpl, `${api}/git/ref/tags/${meta.tag}`, token);
  expect("tag ref object.type", ref.object?.type, "tag");
  expect("tag object sha", ref.object?.sha, meta.tagObjectSha);

  const tagObject = await getJson(fetchImpl, `${api}/git/tags/${meta.tagObjectSha}`, token);
  expect("tag object target type", tagObject.object?.type, "commit");
  expect("tag target commit", tagObject.object?.sha, meta.commitSha);

  const tree = await getJson(fetchImpl, `${api}/git/trees/${meta.commitSha}?recursive=1`, token);
  if (!Array.isArray(tree.tree)) throw new UnverifiedError("tree listing has no entries");
  if (tree.truncated) throw new UnverifiedError("tree listing was truncated");
  const entry = tree.tree.find((e) => e.path === meta.installer.path);
  if (!entry) mismatches.push(`${meta.installer.path} does not exist at ${meta.commitSha}`);
  else expect(`${meta.installer.path} blob sha`, entry.sha, meta.installer.gitBlobSha);

  return mismatches;
}

export async function main({ fetch: fetchImpl = fetch, env = process.env, out = console, metadataPath = METADATA_PATH } = {}) {
  let meta;
  try {
    meta = JSON.parse(await readFile(metadataPath, "utf8"));
    for (const key of ["repository", "tag", "tagObjectSha", "commitSha", "publishedAt", "installer"]) {
      if (!meta[key]) throw new Error(`missing ${key}`);
    }
  } catch (error) {
    out.error(`omes-release-verify: cannot use ${metadataPath}: ${error.message}`);
    return EXIT_BAD_METADATA;
  }

  try {
    const mismatches = await verifyRelease(meta, { fetch: fetchImpl, token: env.GITHUB_TOKEN });
    if (mismatches.length > 0) {
      out.error(`omes-release-verify: ${meta.repository} ${meta.tag} does NOT match apps/storefront/src/config/omes-rilis.json:`);
      for (const m of mismatches) out.error(`  - ${m}`);
      return EXIT_MISMATCH;
    }
    out.log(`omes-release-verify: ${meta.repository} ${meta.tag} verified (published ${meta.publishedAt}, stable, tag -> ${meta.commitSha.slice(0, 7)}, ${meta.installer.path} blob ${meta.installer.gitBlobSha.slice(0, 7)}).`);
    return EXIT_OK;
  } catch (error) {
    if (error instanceof UnverifiedError) {
      out.error(`omes-release-verify: could not verify (failing closed): ${error.message}`);
      return EXIT_UNVERIFIED;
    }
    throw error;
  }
}

if (import.meta.main) {
  process.exit(await main());
}
