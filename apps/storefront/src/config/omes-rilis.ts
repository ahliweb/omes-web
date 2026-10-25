/**
 * The ONE place the storefront learns which OMES release it presents
 * (issue #16). `omes-rilis.json` is read-only build-time data: the landing
 * page renders its version chip, description, CTA links and install command
 * from it and nowhere else, so no OMES version literal lives in a
 * component. It is validated here at module load, so a malformed or
 * internally inconsistent file fails the BUILD (fail closed) instead of
 * publishing a wrong command.
 *
 * Whether the data is still TRUE of the real ahliweb/omes release is a
 * network question this module cannot answer; that is
 * `tools/omes-release-verify.mjs` (`bun run verify:omes-release`).
 *
 * Browser code must not import this file; it is for static rendering only.
 */
import raw from "./omes-rilis.json";

export interface OmesRilis {
  readonly schemaVersion: 1;
  readonly repository: string;
  readonly tag: string;
  readonly tagObjectSha: string;
  readonly commitSha: string;
  readonly publishedAt: string;
  readonly channel: "stable";
  readonly prerelease: false;
  readonly releaseUrl: string;
  readonly changelogUrl: string;
  readonly installGuideUrl: string;
  readonly installer: {
    readonly path: string;
    readonly rawUrl: string;
    readonly gitBlobSha: string;
    readonly sha256: string;
  };
  readonly installCommand: string;
  readonly verification: {
    readonly verifiedAt: string;
    readonly method: string;
    readonly notes: string;
  };
}

const SHA1 = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const TAG = /^v\d+\.\d+\.\d+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(message: string): never {
  throw new Error(`omes-rilis.json: ${message}`);
}

function str(value: unknown, name: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${name} must be a non-empty string`);
  return value;
}

/** Validate and return the release metadata; throws on any malformed or inconsistent field. */
export function parseOmesRilis(input: unknown): OmesRilis {
  if (typeof input !== "object" || input === null) fail("must be an object");
  const o = input as Record<string, unknown>;
  if (o.schemaVersion !== 1) fail("schemaVersion must be 1");
  if (o.channel !== "stable") fail('channel must be "stable"');
  if (o.prerelease !== false) fail("prerelease must be false");

  const repository = str(o.repository, "repository");
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) fail("repository must be owner/name");
  const tag = str(o.tag, "tag");
  if (!TAG.test(tag)) fail("tag must match vMAJOR.MINOR.PATCH (no pre-release suffix)");
  const tagObjectSha = str(o.tagObjectSha, "tagObjectSha");
  const commitSha = str(o.commitSha, "commitSha");
  if (!SHA1.test(tagObjectSha)) fail("tagObjectSha must be a 40-hex sha");
  if (!SHA1.test(commitSha)) fail("commitSha must be a 40-hex sha");
  const publishedAt = str(o.publishedAt, "publishedAt");
  if (!DATE.test(publishedAt)) fail("publishedAt must be YYYY-MM-DD");

  const base = `https://github.com/${repository}`;
  const releaseUrl = str(o.releaseUrl, "releaseUrl");
  const changelogUrl = str(o.changelogUrl, "changelogUrl");
  const installGuideUrl = str(o.installGuideUrl, "installGuideUrl");
  if (releaseUrl !== `${base}/releases/tag/${tag}`) fail("releaseUrl must be the release page of tag");
  if (!changelogUrl.startsWith(`${base}/blob/${tag}/`)) fail("changelogUrl must be pinned to tag");
  if (!installGuideUrl.startsWith(`${base}/blob/${tag}/`)) fail("installGuideUrl must be pinned to tag");

  const inst = o.installer as Record<string, unknown> | undefined;
  if (typeof inst !== "object" || inst === null) fail("installer must be an object");
  const path = str(inst.path, "installer.path");
  const rawUrl = str(inst.rawUrl, "installer.rawUrl");
  const gitBlobSha = str(inst.gitBlobSha, "installer.gitBlobSha");
  const sha256 = str(inst.sha256, "installer.sha256");
  if (rawUrl !== `https://raw.githubusercontent.com/${repository}/${tag}/${path}`) {
    fail("installer.rawUrl must be raw.githubusercontent.com/<repository>/<tag>/<path>");
  }
  if (!SHA1.test(gitBlobSha)) fail("installer.gitBlobSha must be a 40-hex sha");
  if (!SHA256.test(sha256)) fail("installer.sha256 must be a 64-hex sha256");

  const installCommand = str(o.installCommand, "installCommand");
  if (installCommand !== `curl -fsSL ${rawUrl} | bash -s -- --ref ${tag}`) {
    fail("installCommand must be `curl -fsSL <rawUrl> | bash -s -- --ref <tag>` (the --ref pin is required)");
  }

  const ver = o.verification as Record<string, unknown> | undefined;
  if (typeof ver !== "object" || ver === null) fail("verification must be an object");
  const verifiedAt = str(ver.verifiedAt, "verification.verifiedAt");
  if (!DATE.test(verifiedAt)) fail("verification.verifiedAt must be YYYY-MM-DD");

  return {
    schemaVersion: 1,
    repository,
    tag,
    tagObjectSha,
    commitSha,
    publishedAt,
    channel: "stable",
    prerelease: false,
    releaseUrl,
    changelogUrl,
    installGuideUrl,
    installer: { path, rawUrl, gitBlobSha, sha256 },
    installCommand,
    verification: {
      verifiedAt,
      method: str(ver.method, "verification.method"),
      notes: str(ver.notes, "verification.notes")
    }
  };
}

export const omesRilis: OmesRilis = parseOmesRilis(raw);
