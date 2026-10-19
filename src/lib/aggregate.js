// Pure data helpers shared by the build script and the React app.

export const FEATURES = [
  'danceability',
  'energy',
  'valence',
  'acousticness',
  'instrumentalness',
  'speechiness',
  'liveness',
];

const NUMERIC = [...FEATURES, 'popularity', 'duration_ms', 'tempo', 'loudness'];

/** Convert one raw CSV row into a typed track, or null if it is unusable. */
export function toTrack(row) {
  if (!row.track_id || !row.track_genre) return null;
  const track = {
    id: row.track_id,
    name: (row.track_name || '').trim(),
    artists: (row.artists || '').split(';').map((a) => a.trim()).filter(Boolean),
    album: (row.album_name || '').trim(),
    genre: row.track_genre.trim(),
    explicit: String(row.explicit).toLowerCase() === 'true',
  };
  for (const key of NUMERIC) {
    const value = Number(row[key]);
    if (!Number.isFinite(value)) return null;
    track[key] = value;
  }
  return track;
}

/**
 * The Kaggle file lists a track once per genre it belongs to.
 * Keep each track once, remembering every genre it appeared under.
 */
export function dedupe(tracks) {
  const byId = new Map();
  for (const t of tracks) {
    const seen = byId.get(t.id);
    if (seen) {
      if (!seen.genres.includes(t.genre)) seen.genres.push(t.genre);
    } else {
      byId.set(t.id, { ...t, genres: [t.genre] });
    }
  }
  return [...byId.values()];
}

export function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Per-genre averages. `tracks` must be the non-deduplicated list (one row per genre). */
export function genreStats(tracks) {
  const groups = new Map();
  for (const t of tracks) {
    if (!groups.has(t.genre)) groups.set(t.genre, []);
    groups.get(t.genre).push(t);
  }
  const stats = [];
  for (const [genre, rows] of groups) {
    const entry = {
      genre,
      count: rows.length,
      popularity: round(mean(rows.map((r) => r.popularity)), 1),
      medianPopularity: median(rows.map((r) => r.popularity)),
      explicitShare: round(rows.filter((r) => r.explicit).length / rows.length, 3),
      tempo: round(mean(rows.map((r) => r.tempo)), 1),
      minutes: round(mean(rows.map((r) => r.duration_ms)) / 60000, 2),
    };
    for (const f of FEATURES) entry[f] = round(mean(rows.map((r) => r[f])), 3);
    stats.push(entry);
  }
  return stats.sort((a, b) => b.popularity - a.popularity);
}

/** Pearson correlation between two numeric arrays. */
export function pearson(x, y) {
  if (x.length !== y.length || x.length < 2) return 0;
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i += 1) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
}

/** How strongly each audio feature tracks popularity across all tracks. */
export function popularityDrivers(tracks) {
  const pop = tracks.map((t) => t.popularity);
  return FEATURES.map((f) => ({ feature: f, r: round(pearson(tracks.map((t) => t[f]), pop), 3) }))
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}

/** The most popular tracks for each genre, capped at `perGenre`. */
export function topTracksPerGenre(tracks, perGenre = 25) {
  const groups = new Map();
  for (const t of tracks) {
    if (!groups.has(t.genre)) groups.set(t.genre, []);
    groups.get(t.genre).push(t);
  }
  const out = [];
  for (const rows of groups.values()) {
    rows.sort((a, b) => b.popularity - a.popularity);
    out.push(...rows.slice(0, perGenre));
  }
  return out;
}

/** Euclidean distance between two tracks/genres over the audio features. */
export function featureDistance(a, b) {
  return Math.sqrt(FEATURES.reduce((sum, f) => sum + (a[f] - b[f]) ** 2, 0));
}

/** Genres that sound most like `genre`, closest first. */
export function similarGenres(stats, genre, n = 5) {
  const target = stats.find((s) => s.genre === genre);
  if (!target) return [];
  return stats
    .filter((s) => s.genre !== genre)
    .map((s) => ({ genre: s.genre, distance: round(featureDistance(target, s), 3) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}

/** Filter + search used by the track table. */
export function filterTracks(tracks, { query = '', genre = 'all', explicit = 'any', minPopularity = 0 } = {}) {
  const q = query.trim().toLowerCase();
  return tracks.filter((t) => {
    if (genre !== 'all' && t.genre !== genre) return false;
    if (explicit === 'clean' && t.explicit) return false;
    if (explicit === 'explicit' && !t.explicit) return false;
    if (t.popularity < minPopularity) return false;
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.artists.some((a) => a.toLowerCase().includes(q));
  });
}

export function round(value, digits) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}
