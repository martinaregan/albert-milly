# Albert & Milly

A home-screen app for keeping two cats healthy and getting along: food, weight, play, poo and pee, breathing, fights and calm moments, vet notes, stock, costs and bookings.

It was built for Albert (ginger and white, on a vet-supervised weight-loss plan, with a cough being looked into) and Milly (black and white, picky eater, also losing weight), and for one big ongoing question: why does Albert bully Milly, and is it getting better?

**Open it:** https://martinaregan.github.io/albert-milly/

---

## Contents

1. [Install on iPhone](#install-on-iphone)
2. [Connect it to your data](#connect-it-to-your-data)
3. [Everyday use](#everyday-use)
4. [The tabs](#the-tabs)
5. [Extras](#extras)
6. [How the weight plan works](#how-the-weight-plan-works)
7. [How data and sync work](#how-data-and-sync-work)
8. [Updates](#updates)
9. [Files in this repo](#files-in-this-repo)
10. [For developers](#for-developers)

---

## Install on iPhone

1. Open the link above in **Safari**.
2. Tap **Share › Add to Home Screen**.
3. Open it from the home screen (not from Safari) so it runs full screen.

The home screen icon is saved when you add the app and never refreshes by itself. If the icon changes, remove the app from the home screen and add it again. Your data is safe because it all lives online.

## Connect it to your data

The first time you open the app it asks for two things:

- **An access key**: a GitHub fine-grained personal access token with access to **only** the `albert-milly-data` repository, permission **Contents: Read and write**.
- **Your name**: shown next to everything you log, so you can see who fed whom.

Each phone connects once. Someone else feeding the cats can connect their own phone the same way (Settings › This phone › "Someone else feeding them?").

## Everyday use

- **Headline card** at the top of Today: breakfast, dinner, weigh-in and the one thing that needs doing (an order, an overdue to-do, a cat hotel drop-off). From 21:00 it adds the bedtime routine. When everything is done, a sleepy cat shows up.
- **One-tap meals**: the headline card shows "Log both" or "Log Milly" when a meal is missing. It logs the usual amount from each cat's plan and marks it as eaten. A meal that is already logged can't be logged twice.
- **Quick log**: the round **+** button (Today, Health, Friendship) opens big buttons for breakfast, dinner, poo, pee, play, fight and calm moment. It guesses the meal from the time of day.
- **Undo**: most one-tap actions show "Logged · Undo" for 7 seconds.
- **Swipe left** on a meal or a poo/pee entry to delete it (with undo).
- **Poo and pee** forms open already filled in with what is usual for that cat lately, so saving is one tap.

## The tabs

| Tab | What's there |
|---|---|
| **Food & play** (Today) | Headline card, weekly check-in after a weigh-in, Sunday summary, week strip (dots for breakfast, dinner, play per day), who did what today, feeding plan, today's totals (dry, wet, kcal, treats), daily checklist (supplements), play with a timer, notes and photos. Past days with nothing logged offer "Add breakfast / Add dinner". |
| **Weight** | Next weigh-in countdown, weigh-in for both, each cat's progress, chart with current pace and the 1% a week plan, "Down X g" when a weigh-in drops, both cats on one chart (% change), history, feeding suggestion, food likes and dislikes. |
| **Health** | Per cat, three tabs. **Today**: poo and pee, sleeping breathing counter. **Trends**: 30-day symptoms and poo, symptom history, poo vs food. **Vet**: questions for the vet, vet notes and files. Below: things to keep an eye on, worming and flea dates. Vet summary button at the top. |
| **Calendar** | Month view with icons for fights, weigh-ins, vet, symptoms and more, cat hotel stays, to-dos, a monthly recap and a 7-day summary. |
| **Friendship** | This week vs last week, days since the last fight and the longest calm stretch, equal buttons for logging a fight or a calm moment, what stands out, fights per day, the full log, patterns, what seems to help, the bedtime routine comparison, and the background of what's been tried. |
| **Stock** | Shopping list, each food's "order by" date (3 days before it runs out, or before a cat hotel stay), supplements, treats and household items. |
| **Money** | Month total after insurance, coming up in the next 30 days, where the money went, claims waiting on insurance, monthly repeating costs (like the insurance premium) and totals by day, week, month and year. |
| **Info** | Vet, insurance, cat hotel, bookings (with a countdown), profiles. |
| **Settings** | Grouped into **Cats** (photos, plans, foods, checklist, play types), **This phone** (app icon badge, sharing, lock screen shortcut) and **Data & sync** (backup, connection, version). |

## Extras

- **Search** (magnifying glass, top right): symptoms, day notes, meals, poo and pee, fights, calm moments, vet notes, profiles, to-dos and costs.
- **Vet summary** (Health tab): weight, food per day, symptoms, health notes, poo and pee, breathing counts, worming and flea, vet history and open questions. Share as text or print to PDF.
- **Breathing counter**: tap once per breath while the cat sleeps, for 30 seconds. Over 30 a minute is flagged; over 40 says to call the vet.
- **Poo vs food**: how often a poo within a day of each food was soft, against the overall rate.
- **Bedtime routine**: tick "play + snack before bed" each night; after a few nights the Friendship tab compares fights with and without it.
- **Cat photos**: Settings › Cats › add a photo to replace the drawn face everywhere.
- **App icon badge**: Settings › This phone › turn on. The icon shows how many must-dos are open (breakfast after 7:00, dinner after 20:00, Saturday weigh-in).
- **Lock screen shortcut**: an iPhone Shortcut that opens `…/albert-milly/?log=breakfast` (or `?log=dinner`) logs the usual meal for both cats. Shortcuts open links in Safari, so connect the app once in Safari first.
- **Backup**: Settings › Data & sync › download everything as one file (photos stay online).
- **Light and dark mode** follow the phone. Animations switch off when the iPhone's Reduce Motion is on.

## How the weight plan works

- **Daily calories** come from the standard vet formula: resting energy at the target weight, 70 × target kg<sup>0.75</sup>, with a weight-loss range of 0.8 to 1.0 times that. A cat with a vet-set range (like Albert) uses the vet's numbers instead.
- **Safe loss** is about 1% of body weight a week, never more than 1.5%. Faster risks fatty liver.
- **Weekly check-in** (after each Saturday weigh-in) compares weigh-ins at least 5 days apart, only counting weeks since the food last changed:
  - more than 1.5% a week: go up about 10% and ring the vet
  - 0.5 to 1.5% a week: on track, keep everything the same
  - slower, one week: normal scale noise, keep the same
  - slower, two weeks running: drop dry food by about 10%, never below the bottom of the safe range. For cats on a vet-set plan it says to ask the vet instead.
- "Change to X g" updates the cat's allowance, feeding plan text and vet history in one tap.

This is a tracking tool, not veterinary advice. Run food changes past the vet, especially with prescription diets.

## How data and sync work

- Everything is stored in **`data.json`** in a separate **private** repository, `albert-milly-data`. Photos go in its `photos/` folder.
- The app reads and writes that file through the GitHub API with the access key. Nothing goes anywhere else.
- Photos are saved twice: the full photo and a small preview (`-t.jpg`). Lists show the preview; tapping opens the full one.
- Every phone keeps a copy, so the app opens instantly and works offline. Changes are saved locally straight away and uploaded about a second later.
- Every 20 seconds (and whenever the app comes back to the front) it pulls the latest version. If two phones changed things at the same time, the changes are **merged**, not overwritten.
- The screen never redraws while you're touching or scrolling; new data waits until you stop.
- Claude can also log things from chat by editing `data.json` directly, using the same merge rules.

## Updates

- The version number is at the bottom of **Settings › Data & sync**.
- After an update, GitHub can take up to about 10 minutes to serve it. Then close the app fully and open it again.
- The app always tries to load the newest version first and falls back to the saved copy when offline.

## Files in this repo

| File | What it is |
|---|---|
| `src/index.html` | Page shell (the HTML), with markers where the CSS and JavaScript go |
| `src/css/app.css` | All styles in one file, in three sections (base, look and feel, newer features). Dark mode is in `@media (prefers-color-scheme: dark)` blocks |
| `src/js/` | The code, by area (setup, sync, weight maths, each tab, icons, start-up), joined in name order. Each file starts with a one-line note saying what's in it |
| `src/js/19-actions-*.js` | What every button does, grouped by area (today, health, weight, money…). Each is `ACT["name"]`, run when a `data-a="name"` button is tapped |
| `tests/smoke.py` | Automated checks: every tab in light and dark mode, logging and undo, quick log, search, vet summary, swipe to delete, and the minified build |
| `tests/sample-data.json` | Made-up cats and logs used by the tests (never the real data) |
| `package.json` | Shortcuts: `npm run build`, `npm run dev`, `npm test` |
| `index.html` | The published app, built and minified from `src/` by `tools/build.js`. Don't edit by hand |
| `tools/build.js` | Build script: `npm i terser csso`, then `node tools/build.js` (add `--dev` for an unminified `dev.html` to test with) |
| `sw.js` | Service worker: keeps a copy of the app for offline use |
| `manifest.webmanifest` | Name, colours and icons for "Add to Home Screen" |
| `icon-*-v5.png`, `apple-touch-icon-v5.png` | App icons. The version number is in the name so phones fetch new ones |
| `nunito-v1.woff2` | The app's font, stored here so it loads instantly and offline |
| `beta/` | A test copy of the app |

## For developers

- **No framework.** Plain JavaScript in one `<script>` block, wrapped in a function so nothing leaks into the page. Edit the files in `src/`, then run `node tools/build.js` to produce the minified `index.html` that GitHub Pages serves. The JavaScript files are joined in order inside one function, so they share variables; function declarations can live in any file, but statements that run at start-up (in `20-start.js`) must stay last.
- **State**: one object `S` (the contents of `data.json`) plus `ui` for screen state (tab, selected cat, open sections, open sheet).
- **Rendering**: each view is a function that returns an HTML string (`vToday`, `vWeight`, `vHealth`, `vCal`, `vTogether`, `vStock`, `vMoney`, `vInfo`, `vSettings`). `render()` builds the page, swaps emoji for line icons, then updates only the parts of the screen that changed (a small DOM diff, `morphKids`), so taps are quick and the scroll position stays put. Switching tabs does a full rebuild. Collapsed sections marked `data-lazy` are only built when opened.
- **Actions**: buttons carry `data-a="action"` and `data-v="value"`; the click handler in `19-clicks.js` looks up `ACT[action]` and runs it. To add a button, add `ACT["myaction"] = function (e, t, a, v, c) {…}` to the right `19-actions-*.js` file. `change()` saves locally, redraws and schedules the upload.
- **Sync**: `pull()` / `push()` talk to the GitHub contents API; `merge3(base, mine, theirs)` merges concurrent edits by item id.
- **Offline**: `sw.js` caches the app shell. Bump the `SHELL` name in `sw.js` and `APPV` in `index.html` with every release.
- **Icons and font**: when they change, give the files a new name and update the references, because iOS caches them by file name.
- **Formatting**: the source is formatted with Prettier (`npx prettier --write src/js src/css --print-width 110`).
- **Testing**: `npm test` builds `dev.html` and runs `tests/smoke.py`, which loads the app in a headless browser with the sample data, blocks `api.github.com`, and checks every tab, the main actions, that partial screen updates match a full rebuild, and that the minified build runs. Needs `pip install playwright` and `playwright install chromium`. Run it before every release.
