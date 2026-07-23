# Chrome Web Store Listing Assets

Copy-paste-ready text for the Chrome Web Store Developer Dashboard
(https://chrome.google.com/webstore/devconsole/). Screenshots and the
128×128 store icon are image uploads — see the last section.

---

## 1. Listing language

Default to **English (United States)**. Add other locales if you translate the strings.

---

## 2. Extension name (max 30 chars)

```
Link Dashboard
```

(Already set in `manifest.json` — the store reads it from there. Keep them identical.)

---

## 3. Summary / short description (max 132 chars)

The store's "Summary" field. Keep it close to the manifest `description`
so reviewers see consistency.

```
A customizable new-tab dashboard for your web link shortcuts — icons, colors, and sizes your way.
```

(99 chars — within the 132 limit.)

---

## 4. Detailed description (max 16,000 chars)

Paste this into the store's "Description" field. It is separate from the
manifest `description` and can be much longer.

```
Link Dashboard turns your browser's New Tab page into a clean, customizable home for the links you actually use. Your favorite sites are one click away every time you open a tab — no typing, no bookmarks bar hunting, no clutter.

★ WHY YOU'LL LIKE IT
• Your shortcuts replace the default New Tab — open a tab, and they're already there.
• Everything is stored locally on your device. No account, no sign-in, no cloud sync, no tracking.
• Works offline. The only network calls are optional icon and background-image searches.

★ WHAT YOU CAN DO
• Add, edit, and delete link shortcuts with a title, URL, and optional description.
• Pick an icon three ways: enter an image URL, upload your own image, or search a library of thousands of free icons (powered by Iconify). Leave the icon empty and the site's favicon is used automatically.
• Choose a per-tile accent color, or a dashboard-wide background color.
• Set a background wallpaper from an image URL, an uploaded photo, or free Creative Commons images (powered by Openverse).
• Adjust tile size (small / medium / large) and grid columns (auto or fixed).
• Show or hide labels under icons.
• Organize links with groups — rename groups, reorder them, and assign each group a color and emoji.
• Drag & drop to reorder tiles.
• Mark favorites for one-tap access.
• Archive links you don't need right now without deleting them.
• Search your links instantly with a command palette (Ctrl/Cmd+K).
• A "Recent" bar remembers the shortcuts you click most, so you can jump back to them.
• Optional bookmarks widget shows your browser's bookmark tree so you can browse and open bookmarks from the new tab.
• Optional notes widget for quick text you want to keep in front of you.
• A clock and theme controls (light / dark / auto).
• Lock the layout to prevent accidental edits; unlock when you want to rearrange.

★ BACKUP & PORTABILITY
• Export your entire dashboard to a JSON file and import it on another computer.
• Optional automatic backups on an hourly, daily, weekly, or monthly schedule, kept locally on your device. Restore or delete individual snapshots any time.

★ PRIVACY
Link Dashboard is offline-first. Your shortcuts, groups, settings, notes, and backups are saved only in your browser's local storage. The extension does not require an account and does not send your data to any server. The only outbound requests are for optional icon searches (Iconify) and background-image searches (Openverse), which carry only your search query — never your dashboard contents. Bookmarks are read-only and never leave the browser. See the privacy policy link on this listing for full details.

★ PERMISSIONS, EXPLAINED
• storage / unlimitedStorage — saves your dashboard and uploaded images on your device.
• bookmarks — powers the optional bookmarks widget (read-only display of your bookmark tree).
• alarms — schedules the optional automatic backups.
• host permissions for api.iconify.design and api.openverse.org — power the optional icon and background-image search.

★ FREE AND OPEN SOURCE
Link Dashboard is MIT-licensed and the source code is available on GitHub.

We hope Link Dashboard makes every new tab feel like home. Feedback and feature ideas are welcome via the project repository.
```

---

## 5. Category

```
Productivity
```

---

## 6. Language

```
English
```

---

## 7. Single purpose (required, max 132 chars)

Plain-English statement of the one thing the extension does. Keep it under 132 chars.

```
Replace the New Tab page with a customizable dashboard of the user's web link shortcuts.
```

(83 chars.)

---

## 8. Permission justifications (REQUIRED for each permission)

The store asks you to justify each permission. Paste these verbatim into the
"Permissions" justification fields in the dev console.

### storage
```
Saves the user's dashboard — shortcuts, groups, settings, and notes — in the browser's local storage so it persists across sessions.
```

### unlimitedStorage
```
Allows uploaded tile icons and background images (stored as data URLs) to exceed the default local-storage quota. All data stays on the user's device; nothing is uploaded to a server.
```

### bookmarks
```
Used only by the optional Bookmarks widget, which displays the user's existing browser bookmark tree so they can browse and open bookmarks from the new tab. The extension only reads bookmarks; it never creates, modifies, or deletes them, and never transmits them anywhere.
```

### alarms
```
Schedules the optional automatic backup of the user's local dashboard state on an hourly, daily, weekly, or monthly interval. No background network activity occurs; the alarm only triggers a local snapshot stored in the browser.
```

### host permission — https://api.iconify.design/*
```
Powers the optional icon search when the user is editing a shortcut and chooses to search free icons. Only the icon name or search term is sent; no user identifiers or dashboard data are sent.
```

### host permission — https://api.openverse.org/*
```
Powers the optional background-image search, which looks up free Creative Commons / public-domain photos the user can set as a wallpaper. Only the image search query is sent; no user identifiers or dashboard data are sent.
```

---

## 9. Privacy practices

In the "Privacy Practices" tab of the dev console, you'll be asked which data
your extension collects/uses. For Link Dashboard the answers are:

- Authentication info — **No**
- Personal communications — **No**
- Location — **No**
- Web history — **No** (the "Recent" bar records only the user's own dashboard shortcut clicks, stored locally; it never reads `chrome.history`)
- User activity on websites — **No**
- Website content — Yes, but only **fetched, not stored**: icon search results and background-image search results are shown transiently; the user's chosen icon/image is embedded into local storage as the user requested.
- Financial & payment info — **No**
- Personal credentials — **No**

Tick **"I do not sell or transfer user data to third parties"** and
**"I do not use or transfer user data for purposes unrelated to my item's single purpose"**.

Then provide your hosted privacy-policy URL. Host the repo's
`PRIVACY.md` at a public URL (e.g. GitHub Pages):
`https://raw.githubusercontent.com/boreyleang/link-dashboard/main/PRIVACY.md`
or a GitHub Pages link you prefer.

---

## 10. Screenshots (1280×800, 1–5 PNG/JPG)

The store requires between 1 and 5 screenshots at **1280×800** (or 640×400, but
1280×800 looks best). Capture them from the REAL extension, not the
`npm run dev` preview, so the UI matches what users install.

### How to capture

1. Run the real extension:

   ```bash
   npm run chrome
   ```

   (Or Load unpacked from the project root in chrome://extensions.)

2. Open a new tab — the dashboard appears.
3. Chrome menu → More tools → Developer tools, then
   Device Toolbar (Ctrl+Shift+M), set Responsive **1280×800**.
4. Resize the window, then use the screenshot command palette action
   (Ctrl+Shift+P → "Capture full size screenshot"), or ImagePr
   your OS screen-grab tool cropped to 1280×800.

### Suggested shots (in order)

1. **Default dashboard** — the starter shortcuts with the dark theme, clock, and command-palette hint visible. Show users what they get out of the box.
2. **Editing a shortcut** — the edit form open with the icon search popover showing results from Iconify, plus the color picker.
3. **Groups & colors** — a populated dashboard with multiple groups visible, each group row showing its accent color and emoji.
4. **Customize panel** — the Customize sheet open showing background image, tile size, columns, and label toggles.
5. **Bookmarks widgets** — the optional bookmarks tree shown expanded in a corner of the dashboard.

Save them as `store/screenshot-1.png` … `store/screenshot-5.png` in your repo
(or a local folder outside the repo — these don't need to ship with the extension).

Minimum: **at least one**. Aim for 3–5; they sell the extension.

---

## 11. Store icon (128×128 PNG)

The store asks for a **128×128** icon for the listing itself (separate from
the icons inside your extension). Your `icons/icon128.png` already exists at
128×128 and can be reused as the store icon — upload that file directly.

If it looks blurry or too plain at full size, regenerate it from a larger
source image or simplify the design to something that reads well small (think
16×16). The same icon is shown at many sizes in the store, so keep it bold
and high-contrast.

---

## 12. Promotional images (optional but recommended)

Boosts your listing's visibility. Recommended sizes:

- Small promo tile: **440×280** PNG/JPG
- Large promo tile: **920×680** PNG/JPG
- Marquee promo tile: **1400×560** PNG/JPG

Reuse a screenshot or design a simple "dashboard preview" graphic. These are
optional in 2024 but still help on category pages.

---

## 13. Final pre-submit checklist

- [ ] `manifest.json` version is `1.4.0` (it is).
- [ ] `npm test` passes (it did: 85/85).
- [ ] `npm run package` produces `dist/` and `link-dashboard-v1.4.0.zip` (it did).
- [ ] Upload **the zip** to the dev console (not the raw `dist/` folder — the store takes a zip).
- [ ] Fill the listing fields using the text above.
- [ ] Upload 1–5 screenshots at 1280×800.
- [ ] Upload the 128×128 store icon.
- [ ] Provide the public privacy-policy URL (hosted `PRIVACY.md`).
- [ ] Complete the Privacy Practices questionnaire as above.
- [ ] Submit for review. Single-purpose New Tab overrides typically review in 1–7 days.