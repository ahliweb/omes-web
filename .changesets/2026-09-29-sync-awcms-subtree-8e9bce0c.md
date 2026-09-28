---
bump: patch
type: fix
impact: internal
---

# Sync apps/cms subtree to awcms 8e9bce0c

Pulled `ahliweb/awcms` `main` (`9ca28dee` → `8e9bce0c`) into `apps/cms`: dependency bumps (#847
`@astrojs/node` 11.1.6, #848 prettier, #849 astro 7.3.5, #851 yaml, #855 `codeql-action`), #856
`prettier-plugin-astro` 1.1.0 (a repo-wide reformat of upstream's `.astro` files, verified
render-neutral), and #857 — a real fix: `ssrfSafeFetch` no longer misclassifies HTTP `304 Not
Modified` as a broken redirect. That bug (found while verifying the `ahliweb/omes#249`
repository-progress poller on production) failed every conditional GitHub request once an ETag
existed, reporting `pollStatus: "error"`/`errorClass: "network_error"` on each poll after the first —
#857 fixes it at the source.

- No new migrations in this range (`sql/` is byte-identical between `9ca28dee` and `8e9bce0c`).
- `APP_BUDGET_BYTES` unchanged (277,356 B) — the `prettier-plugin-astro` reformat is whitespace-only;
  the built app bundle is byte-identical too (277,154 B, same as the previous sync).
- Running `bun run format` with the new `prettier-plugin-astro` version also reformatted this embed's
  own local `commerce` module `.astro` files for consistency (whitespace/brace-placement only, no
  behavior change) — the same reformat class upstream's own #856 applied to its files.

Part of ahliweb/omes#249.
