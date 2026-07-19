# Link Dashboard

A Chrome extension that replaces the **New Tab** page with a customizable dashboard of web link shortcuts.

## Features

- **Link shortcuts** — add, edit, delete, open sites from your new tab
- **Custom icons** — image URL, upload image, or search free icons (Iconify); empty URL uses site favicon
- **Free icon stores** — built-in links to Iconify, Lucide, Heroicons, MDI, Simple Icons, Tabler, Phosphor, SVG Repo
- **Custom colors** — per-tile accent color and dashboard background color
- **Tile size** — small / medium / large
- **Grid layout** — auto columns or fixed column count
- **Background image** — optional wallpaper URL
- **Show/hide labels** under icons
- **Drag & drop** reorder
- **Persistent storage** via `chrome.storage.local` (or `localStorage` in local UI preview)

## Requirements

- Node.js 18+ (20 recommended)
- Google Chrome or Chromium

## Quick start (local development)

```bash
cd chrome-link-dashboard
npm install
```

**Note:** Node.js 20+ is recommended, though 18+ is sufficient.

---

### Option A — UI preview in the browser (fastest)

Best for styling and layout. Storage uses `localStorage` (not real extension storage).

```bash
npm run dev
```

Opens: [http://localhost:5173/newtab/index.html](http://localhost:5173/newtab/index.html)

You’ll see a yellow **Local preview** badge.

### Option B — Real Chrome extension (recommended before shipping)

Loads the extension into a dedicated Chrome profile:

```bash
npm run chrome
```

If Chrome is not found automatically:

```bash
CHROME_PATH="/path/to/chrome" npm run chrome
```

Or load manually:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this project folder
4. Open a **new tab**

After code changes: click **Reload** on the extension card, then open a new tab.

## npm scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Vite local UI server (hot reload) |
| `npm run chrome` | Launch Chrome with extension loaded |
| `npm start` | Same as `npm run chrome` |
| `npm test` | Run unit tests |
| `npm run package` | Build `dist/` + zip for sharing |
| `npm run build` | Same as `package` |
| `npm run preview` | Preview Vite production web build |

## Suggested workflow

1. **UI work** → `npm run dev` → edit CSS/HTML, refresh browser
2. **Extension APIs / new tab** → `npm run chrome` or Load unpacked
3. **Logic checks** → `npm test`
4. **Share / archive** → `npm run package` → use `dist/` or the `.zip`

## Project structure

```
chrome-link-dashboard/
├── manifest.json
├── package.json
├── vite.config.js
├── icons/
├── lib/                 # shared logic
├── newtab/              # dashboard page
├── scripts/
│   ├── open-chrome.mjs  # npm run chrome
│   └── package.mjs      # npm run package
└── tests/
```

## Usage (in the dashboard)

| Action | How |
|--------|-----|
| Add a link | **Add link** → title, URL, optional icon/color |
| Edit a link | Hover tile → ✎ |
| Delete a link | Edit → **Delete** |
| Reorder | Drag tiles |
| Customize look | **Customize** |
| Reset | Customize → **Reset defaults** |

## Notes

- Manifest V3
- Local UI preview (`npm run dev`) does **not** replace Chrome’s real new tab — use `npm run chrome` for that
- Favicons load with `referrerPolicy="no-referrer"` for better compatibility

## License

MIT
