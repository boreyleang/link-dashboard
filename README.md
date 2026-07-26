# Link Dashboard

**A customizable New Tab page for the links you actually use.**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/bmgokniifobafhddjkkbafddmfhnhamf?label=Chrome%20Web%20Store&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/bmgokniifobafhddjkkbafddmfhnhamf)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/)

Open a new tab → your shortcuts are already there. No account, no cloud, no clutter.

---

## Install

### Chrome Web Store (recommended)

**[Install Link Dashboard from the Chrome Web Store →](https://chromewebstore.google.com/detail/bmgokniifobafhddjkkbafddmfhnhamf)**

1. Open the listing and click **Add to Chrome**
2. Confirm the permissions
3. Open a **new tab** — your dashboard appears

Works with Google Chrome and other Chromium-based browsers that support Chrome Web Store extensions.

### Load unpacked (developers)

1. Clone this repository
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project root
5. Open a **new tab**

---

## Features

### Shortcuts that feel like home

- Add, edit, and delete link shortcuts with title, URL, and optional description
- **Custom icons** — image URL, file upload, or search thousands of free icons ([Iconify](https://iconify.design/)); leave empty to use the site favicon
- **Per-tile accent colors** and dashboard background color
- **Tile size** — small / medium / large
- **Grid layout** — auto columns or a fixed column count
- Show or hide labels under icons
- **Drag & drop** reorder (including across groups)
- **Favorites** for one-tap access
- **Archive** links you don’t need right now without deleting them

### Organize & find fast

- **Groups** with rename, reorder, accent color, and emoji
- Group display modes: grid, tabs, list, or flat
- Instant search and a **command palette** (`Ctrl`/`Cmd`+`K`)
- **Recent** bar for shortcuts you open most from the dashboard
- Optional **Bookmarks** widget (read-only browser bookmarks tree)
- Optional **Notes** widget for quick local text
- Live **clock** and light / dark / auto **theme**
- **Lock layout** to prevent accidental edits

### Look & feel

- Background wallpaper from a URL, an uploaded image, or free Creative Commons photos ([Openverse](https://openverse.org/))
- Built-in icon store links (Iconify, Lucide, Heroicons, MDI, Simple Icons, Tabler, Phosphor, SVG Repo)

### Backup & portability

- **Export / import** your full dashboard as JSON
- Optional **automatic backups** (hourly, daily, weekly, or monthly) stored locally — restore or delete snapshots anytime

---

## Privacy

Link Dashboard is **offline-first** and **account-free**.

| What | Where it lives |
|------|----------------|
| Shortcuts, groups, settings, archives | Your browser (`chrome.storage.local`) only |
| Notes, recent clicks, auto-backups | Local storage on your device |

- No analytics, telemetry, advertising, or tracking SDKs
- No cloud sync and no developer access to your data
- Network use is optional only: Iconify (icon search) and Openverse (background images)
- Bookmarks are **read-only** and never leave the browser

Full details: **[Privacy Policy](PRIVACY.md)**

---

## Usage

| Action | How |
|--------|-----|
| Add a link | **Add link** → title, URL, optional icon/color |
| Save current tab | Click the toolbar icon → popup form |
| Edit a link | Hover a tile → edit |
| Delete a link | Edit → **Delete** |
| Reorder | Drag tiles (when unlocked) |
| Search / commands | `/` or `Ctrl`/`Cmd`+`K` |
| Customize look | **Customize** |
| Lock layout | Lock control in the UI |
| Reset | Customize → **Reset defaults** |

---

## Development

For contributors and local testing.

### Requirements

- Node.js **18+** (20 recommended — see `.nvmrc`)
- Google Chrome or Chromium

### Setup

```bash
git clone https://github.com/boreyleang/link-dashboard.git
cd link-dashboard
npm install
```

### Run modes

| Mode | Command | Notes |
|------|---------|--------|
| UI preview | `npm run dev` | Vite at [http://localhost:5173/newtab/index.html](http://localhost:5173/newtab/index.html). Uses `localStorage`, not `chrome.storage`. Yellow **Local preview** badge. |
| Real extension | `npm run chrome` | Launches Chrome with the extension loaded (full APIs, real New Tab override). |
| Tests | `npm test` | Unit tests for pure logic in `lib/` |
| Package | `npm run package` | Builds `dist/` and a shareable zip |

If Chrome is not found automatically:

```bash
CHROME_PATH="/path/to/chrome" npm run chrome
```

After code changes in the real extension: **Reload** the extension card on `chrome://extensions`, then open a new tab.

### Project structure

```
link-dashboard/
├── manifest.json          # MV3 extension manifest
├── background.js          # Service worker (alarms, toolbar)
├── icons/                 # Extension icons
├── lib/                   # Pure domain logic (unit-tested)
├── newtab/                # New Tab UI
│   ├── app.js             # Composition root
│   ├── core/              # State service + DOM helpers
│   └── ui/                # Feature modules
├── popup/                 # Toolbar “save current tab” popup
├── scripts/               # Dev + package helpers
└── tests/                 # Node test suite
```

Architecture: pure logic in `lib/`, shared state/DOM in `newtab/core/`, UI features in `newtab/ui/` wired through dependency injection. See [AGENTS.md](AGENTS.md) for contributor conventions.

### Suggested workflow

1. **UI / CSS** → `npm run dev`
2. **chrome.\* APIs / New Tab** → `npm run chrome` or Load unpacked
3. **Logic** → `npm test`
4. **Release zip** → `npm run package`

---

## Chrome Web Store

| | |
|--|--|
| **Listing** | [chromewebstore.google.com/…/bmgokniifobafhddjkkbafddmfhnhamf](https://chromewebstore.google.com/detail/bmgokniifobafhddjkkbafddmfhnhamf) |
| **Category** | Productivity |
| **Version** | See store listing (source: `1.5.0`) |

Store copy, permission justifications, and screenshot guidance live in [STORE_LISTING.md](STORE_LISTING.md).

---

## License

MIT — free and open source.

---

## Links

- **[Install on Chrome Web Store](https://chromewebstore.google.com/detail/bmgokniifobafhddjkkbafddmfhnhamf)**
- [Source on GitHub](https://github.com/boreyleang/link-dashboard)
- [Privacy Policy](PRIVACY.md)
- [Feature ideas](feature.md) (wishlist — not a roadmap)

Feedback and ideas are welcome via [GitHub Issues](https://github.com/boreyleang/link-dashboard/issues).
