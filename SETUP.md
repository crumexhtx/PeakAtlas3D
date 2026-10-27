# Weekly automation setup (about 30 minutes, once)

## 1. Google service account (read-only Search Console access)
1. Go to console.cloud.google.com, create a project (e.g. "peakatlas-gsc").
2. **APIs & Services → Library** → enable **Google Search Console API**.
3. **IAM & Admin → Service Accounts → Create service account** (e.g. `gsc-reader`). No roles needed.
4. Open the account → **Keys → Add key → JSON**. A `.json` file downloads.
5. In Search Console: **Settings → Users and permissions → Add user**. Paste the service account email (`gsc-reader@...iam.gserviceaccount.com`) and choose **Restricted** (read-only).

> **Secret warning:** that JSON file is a password. Don't commit it, don't paste it into Cursor's chat or the agent instructions, and delete the downloaded file after step 2.

## 2. GitHub secret
Repo → **Settings → Secrets and variables → Actions → New repository secret**
- Name: `GSC_SERVICE_ACCOUNT_JSON`
- Value: the full contents of the JSON file.

Then delete the JSON file from your computer.

## 3. Add the files to the repo (on `main`)
- `scripts/fetch-gsc.mjs`
- `.github/workflows/gsc-weekly.yml`
- `docs/peak-backlog.md`
- `docs/feature-ideas.md`

## 4. Keep Vercel from deploying the data branch
In `vercel.json`, add:
```json
"git": { "deploymentEnabled": { "gsc-data": false } }
```

## 5. First run
GitHub → **Actions → GSC weekly export → Run workflow**. When it finishes, a `gsc-data` branch should exist with `data/gsc/latest.md`. Open it and check the numbers roughly match Search Console.
- If it fails with 403: the service account wasn't added in Search Console, or the property name is wrong. If your property is a URL-prefix property, set `GSC_SITE: https://peakatlas3d.com/` in the workflow.

## 6. Cursor Automation
- Name: "PeakAtlas3D weekly update"
- Trigger: Every week, Monday 09:00 (the data export runs at 6:00 CDT / 5:00 CST).
- Repo/branch: PeakAtlas3D / `main`
- Agent instructions: paste `AGENT_INSTRUCTIONS.md`.
- Tools: keep **Open Pull Request** and **Memories**.
- Model: pick your strongest model rather than a "Fast" one. It runs once a week, so accuracy matters more than speed.
- Click **Test** once and read the PR carefully, then **Save** and toggle **Active**.

## Weekly routine (15–30 min)
1. Read the PR's Search Console section.
2. Open the Vercel preview and check every new peak's photo, location and facts.
3. Merge, or comment and close.
4. In `docs/feature-ideas.md`, move each new proposal to **Approved** or **Rejected**, with a one-line reason. The reasons are how the agent learns what you want.
5. Reorder `docs/peak-backlog.md` whenever priorities change.

For the agent to research trends, it needs web access. In the Automation's **Add Tool or MCP** list, add a web search or browsing tool if one is offered. Without one, it will say so and base ideas on your data only.
