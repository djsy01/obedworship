# Repository Guidelines

## Project Structure

- `client/src/` contains the Vue 3 and TypeScript frontend. Put pages in `views/`, reusable UI in `components/`, shared Vue logic in `composables/`, and API calls in `api/`. Use `assets/` for imported media and `client/public/` for files served by URL.
- `server/app.js` mounts the production Express routes. Domain handlers live in `server/routes/` and share the MySQL pool in `server/config/db.js`.
- `api/` holds endpoint specifications based on the optional local NestJS implementation in `test-server/`. Check production behavior against the Express handler and its client caller. Consult `database/MySQL.md` for table definitions.

## Local Development and Build

Use Node.js 20.19+ within the 20.x series or 22.12+. Run `npm ci` separately in `client/` and `server/`. Configure development MySQL credentials and `JWT_SECRET` in `server/.env`. Keep credentials out of Git.

| Directory | Command | Purpose |
| --- | --- | --- |
| `server/` | `npm start` | Start Express on port 3000 by default. |
| `client/` | `npm run dev` | Start Vite in a second terminal. Set `VITE_BASE_URL` if the API runs elsewhere. |
| `client/` | `npm run build` | Generate the production bundle in `dist/`. |
| `client/` | `npm run preview` | Serve the last production build locally. |

## Coding Style and Naming

Keep each code file you create or edit at **60 lines or fewer**, including comments and blank lines. Use two-space indentation in Vue and TypeScript and four spaces in Express handlers. Follow names such as `WorshipDetailView.vue`, `useAuth.ts`, and `worship-photos.js`. Match import paths to filename casing.

## Required Checks After Every Change

Run `npm test` from the repository root after every change. Install client dependencies first with `npm --prefix client ci`. The command runs the Vite build, checks changed source files against the 60-line limit, and type-checks TypeScript and Vue templates. All three checks run even if one fails. Any failure sets a nonzero exit code.

The line check includes working-tree changes against `HEAD` and new, unignored source files. For a committed PR, use its merge base, for example `CHECK_BASE="$(git merge-base HEAD origin/dev)" npm test`.

Report each result and any outstanding failures. Run `npm --prefix server test` for the Node.js backend tests. Exercise changed flows against local Express, including each affected user role.

## Commits and Pull Requests

Recent commits use `feat:`, `fix:`, and `docs:` with concise Korean summaries. In each pull request, describe the user-visible change, link any related issue, and list verification steps. Include screenshots for visual changes and a sample request and response when an endpoint contract changes.
