---
bump: patch
type: fix
impact: public
---

# The site no longer shows a phone number or street address OMES never published

`DEFAULT_IDENTITY` in `apps/storefront/src/config/site.ts` still carried the template's BjekMart
phone number and street address after `template:init`, although it was run without
`--kontak-telepon`/`--alamat`. Whenever the CMS held no value, those appeared in the footer, the
home page's contact section and `/kontak`, which is exactly what the production CMS does (OMES
publishes neither). Both fallbacks are now `null`, so every consumer omits the line. `/kontak`'s
address card is now conditional like the phone card already was. The default description is real
OMES text instead of a placeholder, and a regression test pins the rule. Found in the pre-cutover
check of `omes.ahlikoding.com` (ahliweb/omes-web#5).
