# PeakAtlas3D — post-launch checklist

The site is live and in Google Search Console. Work these in order.

## 1. Hosting / DNS (blocks clean indexing)

- [ ] Point `www.peakatlas3d.com` at Vercel (CNAME to your deployment).
  - Today www still parks on Namecheap — that splits signals and serves the wrong site.
  - `vercel.json` already redirects `www` → `https://peakatlas3d.com` once DNS hits Vercel.
- [ ] Confirm apex `peakatlas3d.com` stays on Vercel.
- [ ] In MapTiler Cloud: allow `peakatlas3d.com`, `*.vercel.app`, and `localhost` on the key; set a usage alert.

## 2. Google Search Console

- [ ] After each SEO deploy, View Source on `https://peakatlas3d.com/peak/rainier` and confirm a real `<h1>` (and trip copy) outside `<noscript>`.
- [ ] Confirm `https://peakatlas3d.com/sitemap.xml` and `/robots.txt` load.
- [ ] Validate fix on **Discovered – currently not indexed**.
- [ ] Request indexing for:
  - `/peaks`
  - `/contact`
  - Flagship peaks: `/peak/rainier`, `/peak/denali`, `/peak/everest`, `/peak/whitney`, `/peak/hood`, `/peak/fuji`, `/peak/halfdome`, `/peak/shasta`, `/peak/matterhorn`, `/peak/elbert`
- [ ] Ignore most **Page with redirect** (`/path/` → `/path`) and **Alternate page with proper canonical** (`?country=` → clean path) unless the target URL is wrong.

## 3. Analytics

- Vercel Analytics is already on in production.
- Optional Plausible: set `VITE_PLAUSIBLE_DOMAIN=peakatlas3d.com` (and rebuild/redeploy).
  - Self-hosted: also set `VITE_PLAUSIBLE_SCRIPT_SRC` to your script URL.

## 4. Content / product (earn the click)

- [x] Curate trip copy + permits for 10 flagship peaks (`npm run enrich:flagship`).
- [ ] Spot-check those peak pages on mobile (search → zoom → dossier).
- [ ] Empty lodging UX for remote peaks (improve as OSM coverage gaps show up).
- [ ] Add peaks in small batches with `enrich:content`, `enrich:lodging`, `validate:photos:check`.

## 5. Engineering follow-ups

- [ ] Lazy-load MapLibre on About / Peaks / Contact.
- [ ] Watch Core Web Vitals / MapTiler bandwidth after traffic starts.
