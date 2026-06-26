# Deploying PlaysOut Uplift to Vercel (GitHub flow)

This sets up a live URL that **auto-updates** whenever changes are pushed — perfect for
iterating here and handing off to a developer to point the domain. No terminal required.

The whole thing is a one-time setup (~10 min). After that, every change goes live in ~30s.

---

## One-time setup

### 1. Put the project on GitHub (using GitHub Desktop — no commands)
1. Download **GitHub Desktop** from https://desktop.github.com and sign in with your GitHub account.
2. In GitHub Desktop: **File → Add Local Repository** → choose this folder
   (`Desktop/playsout-uplift`).
3. It will say "this isn't a Git repository — create one?" → click **Create a repository** →
   **Create Repository**.
4. Click **Publish repository** (top right).
   - Name: `playsout-uplift`
   - You can keep it **Private** (untick "Keep this code private" only if you want it public).
   - Click **Publish Repository**.

Your code is now on GitHub. ✅

### 2. Connect the repo to Vercel
1. Go to https://vercel.com and log in.
2. Click **Add New… → Project**.
3. Choose **Import Git Repository** → pick `playsout-uplift`.
   (If GitHub isn't connected yet, Vercel will prompt you to authorize it — approve it.)
4. Leave all build settings at their defaults (it's a static site — **no framework, no build
   command needed**). Just click **Deploy**.
5. After ~30 seconds you'll get a live URL like `https://playsout-uplift.vercel.app`.

That URL is your shareable preview. ✅

---

## The day-to-day loop (after setup)

1. Tell me what to change here in chat — I edit the files in your `Desktop/playsout-uplift` folder.
2. Open **GitHub Desktop** → you'll see the changed files listed.
3. Type a short summary (e.g. "update hero copy") → click **Commit to main** → click **Push origin**.
4. Vercel auto-deploys. Refresh your `.vercel.app` URL in ~30 seconds to see it live.

That's it — no commands, ever.

---

## Handing off to the developer / pointing the domain
Once you're happy with the preview:
- **Option A (simplest):** In Vercel → your project → **Settings → Domains**, add `playsout.com`
  and follow the DNS instructions. Your developer (or whoever controls the domain's DNS) updates
  the records, and the live site is served at your domain.
- **Option B:** In Vercel → project → **Settings → Members**, invite the developer, or transfer the
  project to their Vercel team so they own the domain + deployments.
- The developer also has the full source in the GitHub repo and `HANDOFF.md` for context.

---

## Notes
- This is a **static site** — Vercel needs no build step. If it ever asks for a "Framework Preset,"
  choose **Other**.
- Local preview still works anytime: double-click `index.html` in the folder.
- `vercel.json` just sets light caching on the `/assets` files; safe to leave as-is.
