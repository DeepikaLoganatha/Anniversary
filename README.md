# Celebration — Happy Anniversary Page

This is a small static site (HTML/CSS/JS) for a Happy Anniversary celebration. It includes:

- `index.html`, `styles.css`, `script.js` — the main page and logic
- `Images/` — your photos used by the gallery and Memories
- `Audio/` — audio file(s) used by the Memories feature

This repository is intended to be published as a static site (Netlify is recommended).

Quick guide — push this folder to GitHub and publish on Netlify

1) Initialize local git repo (run inside the `celebration` folder):

```cmd
cd "c:\Users\deepi\OneDrive\Documents\Java\celebration"
git init
git add --all
git commit -m "Initial celebration site"
```

2) Create a remote GitHub repo and push
- Option A (recommended if you have GitHub CLI `gh` installed):

```cmd
gh repo create <your-github-username>/<repo-name> --public --source=. --remote=origin --push
```

- Option B (create the repo on github.com manually):
  - Create a new repo on GitHub in your account (e.g. `celebration`), then run:

```cmd
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

3) Publish on Netlify

- Option A — connect via the Netlify web UI (no CLI required):
  1. Visit https://app.netlify.com and sign in.
  2. Choose "New site from Git" → GitHub, authorize if needed.
  3. Select your repository and branch (`main`).
  4. In the deploy settings set:
     - Build command: (leave empty)
     - Publish directory: `.` (the repository root contains `index.html`)
  5. Click Deploy site. Netlify builds and publishes a public URL.

Shareable mobile link (optional)
- After deployment, you can share a single tappable URL that redirects to the site by using `share-link.html` in the repository root. The share link will be:

```
https://<your-netlify-site>.netlify.app/share-link.html
```

When the recipient taps that URL on a mobile device it will automatically redirect (or show a large button) to open `index.html`.

- Option B — use Netlify CLI (deploy directly):
  1. Install Node.js and npm if you don't have them.
  2. Install Netlify CLI:

```cmd
npm install -g netlify-cli
netlify login
```

  3. From this folder run a one-off deploy:

```cmd
netlify deploy --dir=. --prod
```

  Or create a site and link it to the repo with:

```cmd
netlify init
```

Notes and tips
- If your images or audio are large, Netlify can still host them, but keep an eye on repo size for GitHub. Consider using LFS for very large files.
- If Netlify can't find an `index.html` at the repo root, set Publish directory to the folder path where `index.html` lives.
- For local testing on mobile, you can use Live Server in VS Code (I added `.vscode/settings.json` to bind to 0.0.0.0:5500).

Security and privacy
- You're publishing local photos and audio files. Make sure you are happy sharing these publicly before making the repository public on GitHub or connecting it to Netlify. Netlify will make the site public by default unless you enable password protection or set site visibility differently.

If you'd like, I can also:
- Create a GitHub Actions workflow template to automatically build/deploy (not needed for pure static sites),
- Add a tiny `deploy.bat` script that uses `gh` or `netlify` CLI if you prefer CLI-based deployment.

---
Generated: June 7, 2026
