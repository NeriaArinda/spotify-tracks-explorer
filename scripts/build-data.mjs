// Turns the 20 MB Kaggle CSV into two small JSON files the dashboard loads.
//   node scripts/build-data.mjs data/dataset.csv public/data

import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

import {
  dedupe,
  genreStats,
  popularityDrivers,
  toTrack,
  topTracksPerGenre,
} from '../src/lib/aggregate.js';

const [input = 'data/dataset.csv', outDir = 'public/data'] = process.argv.slice(2);

if (!fs.existsSync(input)) {
  console.error(`Cannot find ${input}. Download dataset.csv from Kaggle (see README).`);
  process.exit(1);
}

const csv = fs.readFileSync(input, 'utf8');
const { data, errors } = Papa.parse(csv, { header: true, skipEmptyLines: true });
if (errors.length) console.warn(`papaparse reported ${errors.length} row issues; they were skipped`);

const rows = data.map(toTrack).filter(Boolean);
const unique = dedupe(rows);

const overview = {
  source: 'Spotify Tracks Dataset (Kaggle, maharshipandya)',
  rows: rows.length,
  uniqueTracks: unique.length,
  genres: new Set(rows.map((r) => r.genre)).size,
  artists: new Set(unique.flatMap((t) => t.artists)).size,
  explicitShare: unique.filter((t) => t.explicit).length / unique.length,
  drivers: popularityDrivers(unique),
};

const slim = topTracksPerGenre(rows, 25).map((t) => ({
  id: t.id,
  name: t.name,
  artists: t.artists,
  genre: t.genre,
  explicit: t.explicit,
  popularity: t.popularity,
  danceability: t.danceability,
  energy: t.energy,
  valence: t.valence,
  acousticness: t.acousticness,
  instrumentalness: t.instrumentalness,
  speechiness: t.speechiness,
  liveness: t.liveness,
  tempo: Math.round(t.tempo),
  duration_ms: t.duration_ms,
}));

fs.mkdirSync(outDir, { recursive: true });
const write = (name, value) => {
  const file = path.join(outDir, name);
  fs.writeFileSync(file, JSON.stringify(value));
  console.log(`wrote ${file} (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
};
write('overview.json', overview);
write('genres.json', genreStats(rows));
write('tracks.json', slim);
