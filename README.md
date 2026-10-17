# Kawaii Garden

A gamified to-do app: completing tasks grows a kawaii tree, unlocks flower plots and attracts streak companions.
Built from `../design_handoff_kawaii_garden` with Vite + React + TypeScript + Tailwind CSS v4 + Lucide React + Framer Motion.

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build a single self-contained dist/index.html
```

The build inlines all JS and CSS, so `dist/index.html` opens directly from disk — no server needed.
Copy it to `../Kawaii Garden.html` to update the double-clickable version.

## Live site

Published at **https://ez5662.github.io/kawaii-garden/** — every push to `main` rebuilds and redeploys it
(`.github/workflows/deploy.yml`). Your garden data stays in your browser; nothing is uploaded.

## Testing overrides

Append query params to the URL (these replace the prototype's testing props):

| Param | Example | Effect |
| --- | --- | --- |
| `tod` | `?tod=night` | Force `morning` / `noon` / `sunset` / `night` instead of the system clock |
| `streak` | `?streak=8` | Override the streak (bird at >3, frog at >6) |
| `days` | `?days=120` | Add `days × 3` simulated chores to grow the tree |
| `hour` | `?hour=18.4` | Pretend the clock reads this hour (watch the sun set) |

Progress is saved in `localStorage` under `kawaii-garden-v1`; "Reset garden" in the clipboard clears it.
Use **Backup → Export / Import** in the clipboard to save your garden to a `.json` file and restore it.
**Auto-backup** (clipboard footer → Turn on):
- Chrome / Edge: pick a file once; it's rewritten ~1s after every change and when the tab is hidden or closed.
  After a browser restart Chrome may ask for one click ("Reconnect") before writing again.
- Safari / Firefox (no file-writing API): a dated backup downloads on your first click each day.

## Live sky

- The sun and moon follow the device clock, rising and setting behind the hills; the sky cross-fades between periods.
- **Live weather** (the default) uses [Open-Meteo](https://open-meteo.com) — free, no API key. It asks for your location
  once, or you can type a city in the weather menu. It refreshes every 15 minutes and also supplies real sunrise/sunset times.
- Picking a weather under "Simulate weather" turns live weather off; pick the location row to turn it back on.
- Your location is stored only in this browser (`kawaii-garden-place`) and sent only to Open-Meteo.

## Layout

- `src/lib/garden.ts` — types, constants, pure game rules, persistence
- `src/lib/useGarden.ts` — state, actions (complete / undo / drop / plant) and derived values
- `src/lib/theme.ts` — time-of-day + weather palettes
- `src/lib/sun.ts`, `src/lib/useSky.ts`, `src/lib/weatherApi.ts` — clock, sun/moon arc, sky blending, live weather
- `src/lib/backup.ts`, `src/lib/useAutoBackup.ts` — export / import, automatic backups
- `src/components/scene/*` — the CSS-drawn garden scene (waterfall, tree, plots, critters, effects, weather)
- `src/components/*` — header, status strip, clipboard panel, seed picker, `Flower`
