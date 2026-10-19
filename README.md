# Spotify Tracks Explorer

![tests](https://github.com/Neriarinda/spotify-tracks-explorer/actions/workflows/ci.yml/badge.svg)

An interactive React dashboard for exploring **114,000 Spotify tracks across 114 genres**:
which genres are most popular, which ones sound alike, and whether any audio feature actually predicts a hit.

**Stack:** React 18 · Vite · Recharts · Node data pipeline · Vitest · GitHub Actions

## Features

- **Genre ranking.** Rank genres by popularity, danceability, energy or valence; click a bar to inspect that genre.
- **Mood map.** Every genre plotted by energy versus valence (musical "happiness"), sized by popularity.
- **Genre profile.** A genre's audio fingerprint compared with the average, plus the five genres that sound most similar
  (nearest neighbours by Euclidean distance over seven audio features).
- **What tracks popularity?** Pearson correlation of each feature with popularity across every unique track.
- **Track table.** Search by track or artist, filter by genre, explicit content and minimum popularity, sort any column,
  page through results, and open tracks on Spotify.
- Light and dark themes that follow the system setting.

## What the data says

- **No single audio feature predicts popularity.** The strongest correlation is instrumentalness at −0.13
  (vocal tracks do slightly better), and every other feature is within ±0.07. Popularity depends on far more than how a song sounds.
- **The most popular genres** are pop-film, k-pop, chill and sad.
- The raw file lists a track once per genre it belongs to: **114,000 rows but 89,741 unique tracks** by 29,858 artists.
  The pipeline deduplicates them before computing correlations.

## How it works

```
data/dataset.csv (20 MB, from Kaggle)
        │  npm run data   (scripts/build-data.mjs)
        ▼
public/data/overview.json   headline numbers + feature correlations
public/data/genres.json     per-genre averages (29 KB)
public/data/tracks.json     top 25 tracks per genre (~0.9 MB)
        │
        ▼
React app (src/)  fetches the three JSON files; all filtering and sorting happens in the browser
```

Aggregating at build time keeps the app fast. It ships about 1 MB of JSON instead of the 20 MB CSV,
and it needs no backend, so it can be hosted on any static host (for example GitHub Pages).

All the data logic lives in one pure module, [`src/lib/aggregate.js`](src/lib/aggregate.js), shared by the build script
and the app. It is covered by unit tests in [`aggregate.test.js`](src/lib/aggregate.test.js).

## Run it

```bash
npm install
npm run data      # only needed if you replace data/dataset.csv; prebuilt JSON is committed
npm run dev       # http://localhost:5173
npm test
npm run build
```

## Data

[Spotify Tracks Dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset) by Maharshi Pandya on Kaggle.
The raw CSV is not committed. Download it into `data/dataset.csv` to rebuild the JSON.

---

Built by Neria Fay Arinda, with help from Claude (Anthropic) as a coding assistant.
