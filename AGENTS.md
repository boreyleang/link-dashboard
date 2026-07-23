# AGENTS.md

A Chrome MV3 extension that overrides the New Tab page with a link dashboard. Plain JS, no framework, no bundler for the extension itself.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173/newtab/index.html (UI-only preview; uses `localStorage`, NOT `chrome.storage`). Hot reload.
- `npm run chrome` — launches Chrome with the extension loaded into `.chrome-dev-profile/` (real extension APIs). Override binary with `CHROME_PATH`.
- `npm test` — runs `node --test tests/**/*.test.js`. Only covers pure logic in `lib/`.
  - Run a single file: `node --test tests/shortcuts.test.js`
  - Run a single test name: `node --test --test-name-pattern="adds https" tests/url.test.js`
- `npm run package` (a.k.a. `npm run build`) — copies source dirs into `dist/` and zips it. No transpile/bundle; `dist/` mirrors the source layout (`manifest.json`, `background.js`, `icons/`, `lib/`, `newtab/`).
- There is no lint or typecheck step configured. Don't invent one.

## Architecture

- `newtab/app.js` is the composition root: builds element refs, the `StateService`, and wires every UI feature module. No feature logic here.
- Three-layer split (see header comment in `app.js`):
  - `lib/` — pure domain logic, the only thing unit-tested. Storage helpers also live here (`lib/storage.js`).
  - `newtab/core/` — `StateService` (`state.js`) + shared DOM helpers (`dom.js`).
  - `newtab/ui/` — feature modules, one responsibility each, wired with dependency injection via a `ctx` object (Dependency Inversion).
- `background.js` is the MV3 service worker (alarms for auto-backup). It intentionally re-implements storage helpers locally because ES module imports are not available in the service worker context here — do not refactor it to `import` from `lib/`.
- Storage keys (all under `chrome.storage.local`): `linkDashboard` (main state), `linkDashboard_notes`, `linkDashboard_recent`, `linkDashboard_backups`. `lib/storage.js` falls back to `localStorage` when `chrome.storage` is unavailable (the `npm run dev` preview path). Tests must respect this fallback.

## Workflow notes

- Two distinct run modes behave differently: dev-server preview ≠ real extension. Test UI styling with `dev`, but anything touching `chrome.*` APIs (storage, alarms, bookmarks, history, `chrome_url_overrides`) must be verified via `npm run chrome` (or Load unpacked from the project root). After edits, click **Reload** on the extension card then open a new tab.
- The extension loads directly from the repo root — there is no build output to load. Only `npm run package` produces `dist/` for sharing/Web Store.
- `dist/`, `dist-web/`, `.chrome-dev-profile/`, and `*.zip` are gitignored.
- Node version: `.nvmrc` pins `20`; `package.json` requires `>=18`. Vite is the sole dev dependency.

## Gotchas

- Version numbers must stay in sync between `package.json` and `manifest.json` — `scripts/package.mjs` reads the version from `package.json` to name the zip, while the Chrome Web Store reads it from `manifest.json`. Both are `1.4.0` as of this release.
- The `history` permission is NOT requested. The "Recent" bar records only dashboard shortcut clicks (stored in `localStorage` via `newtab/ui/recent.js`); it never calls `chrome.history`. Don't re-add the permission without wiring it up.
- `background.js` registers `chrome.action.onClicked` to open `chrome://newtab` — the toolbar button is intentionally wired, not decorative. Keep the listener when editing.
- `npm run dev` shows a yellow "Local preview" badge (`#dev-badge`) that is hidden in the extension — controlled by `app.js` based on `chrome.runtime` availability.
- Remote fetches: `lib/icons.js` → `https://api.iconify.design/*` and `lib/images.js` → `https://api.openverse.org/*`. Both are declared in `host_permissions`. Icon embedding (`fetchUrlToDataUrl`) also fetches arbitrary user-provided icon URLs best-effort (relies on remote CORS). Favicons render via `<img>` against `https://www.google.com/s2/favicons` with `referrerPolicy="no-referrer"` — image loading only, not a data API.
- `PRIVACY.md` at the repo root is the privacy policy referenced in the Chrome Web Store listing. Keep it in sync with actual permissions/data flows when changing what the extension accesses.
- `feature.md` is a wishlist of unimplemented ideas, not a spec — do not treat it as requirements.