@echo off
REM deploy.bat - helper to commit and push to GitHub and deploy to Netlify (requires git, gh and netlify CLI)
cd /d "%~dp0"
echo "Committing changes..."
git add --all
git commit -m "deploy: update site" 2>nul
echo "Pushing to origin main..."
git push origin main
if %ERRORLEVEL% NEQ 0 (
  echo "Push failed (no remote?). If you haven't set an origin, run: git remote add origin https://github.com/<user>/<repo>.git"
  goto :end
)
echo "Attempting Netlify deploy (if netlify CLI installed)..."
netlify deploy --dir=. --prod
:end
echo Done.
pause