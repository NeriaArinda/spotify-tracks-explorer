import { describe, expect, it } from 'vitest';

import {
  dedupe,
  filterTracks,
  genreStats,
  pearson,
  popularityDrivers,
  similarGenres,
  toTrack,
  topTracksPerGenre,
} from './aggregate.js';

const raw = (over) => ({
  track_id: 'a',
  track_name: 'Song A',
  artists: 'Ann;Bob',
  album_name: 'Album',
  track_genre: 'pop',
  explicit: 'False',
  popularity: '50',
  duration_ms: '180000',
  tempo: '120',
  loudness: '-5',
  danceability: '0.5',
  energy: '0.5',
  valence: '0.5',
  acousticness: '0.5',
  instrumentalness: '0',
  speechiness: '0.1',
  liveness: '0.1',
  ...over,
});

describe('toTrack', () => {
  it('parses numbers, artists and explicit', () => {
    const t = toTrack(raw({ explicit: 'True' }));
    expect(t.artists).toEqual(['Ann', 'Bob']);
    expect(t.popularity).toBe(50);
    expect(t.explicit).toBe(true);
  });

  it('rejects rows with missing ids or bad numbers', () => {
    expect(toTrack(raw({ track_id: '' }))).toBeNull();
    expect(toTrack(raw({ energy: 'oops' }))).toBeNull();
  });
});

describe('aggregation', () => {
  const rows = [
    toTrack(raw({ track_id: 'a', track_genre: 'pop', popularity: '80', energy: '0.9' })),
    toTrack(raw({ track_id: 'a', track_genre: 'dance', popularity: '80', energy: '0.9' })),
    toTrack(raw({ track_id: 'b', track_genre: 'pop', popularity: '40', energy: '0.3' })),
    toTrack(raw({ track_id: 'c', track_genre: 'ambient', popularity: '10', energy: '0.1', explicit: 'True' })),
  ];

  it('dedupes tracks listed under several genres', () => {
    const unique = dedupe(rows);
    expect(unique).toHaveLength(3);
    expect(unique.find((t) => t.id === 'a').genres).toEqual(['pop', 'dance']);
  });

  it('computes per-genre averages sorted by popularity', () => {
    const stats = genreStats(rows);
    expect(stats[0].genre).toBe('dance');
    const pop = stats.find((s) => s.genre === 'pop');
    expect(pop.count).toBe(2);
    expect(pop.popularity).toBe(60);
    expect(pop.energy).toBe(0.6);
  });

  it('finds features that track popularity', () => {
    const drivers = popularityDrivers(dedupe(rows));
    expect(drivers[0].feature).toBe('energy');
    expect(drivers[0].r).toBeCloseTo(1, 1);
  });

  it('keeps the top tracks per genre', () => {
    const top = topTracksPerGenre(rows, 1);
    expect(top.filter((t) => t.genre === 'pop').map((t) => t.id)).toEqual(['a']);
  });

  it('ranks similar genres by audio features', () => {
    const similar = similarGenres(genreStats(rows), 'pop', 2);
    expect(similar[0].genre).toBe('dance');
  });

  it('filters by query, genre, explicit and popularity', () => {
    const unique = dedupe(rows);
    expect(filterTracks(unique, { query: 'bob' })).toHaveLength(3);
    expect(filterTracks(unique, { explicit: 'explicit' }).map((t) => t.id)).toEqual(['c']);
    expect(filterTracks(unique, { minPopularity: 50 }).map((t) => t.id)).toEqual(['a']);
    expect(filterTracks(rows, { genre: 'ambient' })).toHaveLength(1);
  });
});

describe('pearson', () => {
  it('handles perfect, inverse and flat series', () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
    expect(pearson([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1);
    expect(pearson([1, 1, 1], [1, 2, 3])).toBe(0);
  });
});
