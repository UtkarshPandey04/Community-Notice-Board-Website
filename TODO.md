# TODO: Fix Vercel Build Timeout

## Approved Plan

- Optimize MongoDB connection in server.js to connect lazily instead of at module load.
- Review backend/package.json for unused dependencies and remove them.
- Verify changes and redeploy to test build time.

## Steps to Complete

- [x] Modify server.js to move mongoose.connect to a lazy connection function.
- [x] Remove unused dependencies from backend/package.json (e.g., nodemon from devDependencies).
- [x] Update TODO.md with completion status after each step.
- [x] Test server startup and basic API functionality locally (server starts, MongoDB connects lazily, health endpoint responds).
- [x] Remove backend dependencies from root package.json to avoid conflicts.
- [ ] Redeploy to Vercel and monitor build time.
