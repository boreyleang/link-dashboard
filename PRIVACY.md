# Privacy Policy — Link Dashboard

_Last updated: 2026-07-23_

Link Dashboard ("the extension") replaces your browser's New Tab page with a customizable dashboard of web-link shortcuts. This policy describes what data the extension accesses, where it is stored, and what network requests it makes.

## 1. Data we store

All user content is stored **locally** in the browser via `chrome.storage.local`. It never leaves your device unless you explicitly export it.

| Data | Key | Purpose |
|------|-----|---------|
| Shortcuts, groups, archived links, dashboard settings | `linkDashboard` | The main dashboard state |
| Free-text notes | `linkDashboard_notes` | The optional notes widget |
| Recently-visited shortcuts | `linkDashboard_recent` | The "Recent" bar |
| Automatic backups | `linkDashboard_backups` | Local snapshots taken on the schedule you choose |

Uploaded tile icons and background images are stored as **data URLs** inside the main state, which is why the extension requests the `unlimitedStorage` permission (large images can exceed the default 5 MB `chrome.storage.local` quota).

All of this data lives on your machine. The developer does not collect, receive, or have access to it.

## 2. Permissions and why each is requested

- **`storage`** / **`unlimitedStorage`** — persist your dashboard, notes, and backups locally and allow large uploaded images.
- **`bookmarks`** — read your browser bookmark tree for the optional Bookmarks widget. The extension only **reads** bookmarks; it never creates, modifies, or deletes them, and does not send them anywhere.
- **`alarms`** — schedule the optional automatic backup of your local dashboard state.

The `history` permission is **not** requested. The "Recent" bar records only the shortcuts you click from within the dashboard, stored in `localStorage` — it does not read your browser history.

## 3. Network requests

The extension is offline-first. The only outbound requests it makes are for optional media lookups:

- **Iconify** (`https://api.iconify.design/*`) — searching and embedding free icons when you pick one in the edit form. The request contains the icon name/search term you typed; no user identifiers are sent.
- **Openverse** (`https://api.openverse.org/*`) — searching Creative Commons / public-domain background images. The request contains your image search query; no user identifiers are sent.

Favicon rendering uses the browser's native `<img>` tag against `https://www.google.com/s2/favicons` (with `referrerPolicy="no-referrer"`) so shortcut icons display even when no custom icon is set. This is image loading only, not a data API call, and no referrer information is shared.

No analytics, telemetry, crash reporting, advertising, or tracking SDK is included in this extension.

## 4. Third-party content displayed

Default shortcuts shipped with the extension link to third-party websites (e.g. search engines, social networks). The extension does not embed those sites; it simply opens their URLs when you click a tile. Visiting them is governed by those sites' own policies.

## 5. Your controls

- **Reset to defaults** — Customize → Reset defaults clears your shortcuts and restores starter links.
- **Import / Export** — back up or transfer your state as a JSON file.
- **Delete backups** — the Backup panel lets you remove individual backups or disable auto-backup.
- **Browser controls** — removing the extension, or clearing extension data via Chrome's site settings, deletes all locally stored data.

## 6. Children's privacy

The extension does not knowingly collect any data from anyone, including children under 13.

## 7. Changes to this policy

Material changes will be reflected by updating this document and bumping the extension version. Your continued use after an update constitutes acceptance.

## 8. Contact

For privacy questions or data-handling concerns, please open an issue on the project repository or contact the developer at the address listed on the Chrome Web Store listing.