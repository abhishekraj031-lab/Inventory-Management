# Stockhouse — Item List (interactive prototype)

A standalone, single-file HTML/CSS/JS prototype of the Stockhouse inventory app's Item List page. No build step, no dependencies — open `index.html` in any browser.

## What's interactive
- Filter chips (All / Below reorder / Stockouts / Overstock)
- Search by item name or SKU
- Category dropdown filter
- Row checkboxes + "select all"
- Per-row action menu (kebab icon)
- Rows-per-page dropdown

## Push to your own GitHub repo
This folder is already a git repo with one commit. To publish it:

```bash
gh repo create stockhouse-inventory --public --source=. --remote=origin --push
```

or manually:

```bash
git remote add origin https://github.com/<your-username>/stockhouse-inventory.git
git branch -M main
git push -u origin main
```

## Deploy
Any static host works (GitHub Pages, Vercel, Netlify) since it's a single `index.html` with no build step. For GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
