import { useEffect, useMemo, useState } from 'react';

import { filterTracks } from '../lib/aggregate.js';

const PAGE = 15;
const COLUMNS = [
  ['name', 'Track'],
  ['artists', 'Artists'],
  ['genre', 'Genre'],
  ['popularity', 'Popularity'],
  ['danceability', 'Dance'],
  ['energy', 'Energy'],
  ['tempo', 'BPM'],
];

export default function TrackTable({ tracks, genres, genre }) {
  const [filters, setFilters] = useState({ query: '', genre, explicit: 'any', minPopularity: 0 });
  const [sort, setSort] = useState({ key: 'popularity', dir: -1 });
  const [page, setPage] = useState(0);

  // Follow the genre picked elsewhere on the page.
  useEffect(() => setFilters((f) => ({ ...f, genre })), [genre]);
  useEffect(() => setPage(0), [filters, sort]);

  const rows = useMemo(() => {
    const filtered = filterTracks(tracks, filters);
    const value = (t) => (sort.key === 'artists' ? t.artists.join(', ') : t[sort.key]);
    return filtered.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      return (typeof va === 'string' ? va.localeCompare(vb) : va - vb) * sort.dir;
    });
  }, [tracks, filters, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const visible = rows.slice(page * PAGE, page * PAGE + PAGE);
  const update = (key) => (e) => setFilters({ ...filters, [key]: key === 'minPopularity' ? Number(e.target.value) : e.target.value });

  return (
    <section className="card">
      <div className="card-head">
        <h2>Top tracks</h2>
        <span className="muted">{rows.length} matching</span>
      </div>
      <div className="filters">
        <input type="search" placeholder="Search track or artist" value={filters.query} onChange={update('query')} />
        <select value={filters.genre} onChange={update('genre')} aria-label="Genre">
          <option value="all">All genres</option>
          {[...genres].sort((a, b) => a.genre.localeCompare(b.genre)).map((g) => (
            <option key={g.genre} value={g.genre}>{g.genre}</option>
          ))}
        </select>
        <select value={filters.explicit} onChange={update('explicit')} aria-label="Explicit">
          <option value="any">Clean + explicit</option>
          <option value="clean">Clean only</option>
          <option value="explicit">Explicit only</option>
        </select>
        <label className="range">
          Popularity ≥ {filters.minPopularity}
          <input type="range" min="0" max="100" value={filters.minPopularity} onChange={update('minPopularity')} />
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {COLUMNS.map(([key, label]) => (
                <th key={key}>
                  <button type="button" onClick={() => setSort({ key, dir: sort.key === key ? -sort.dir : -1 })}>
                    {label} {sort.key === key ? (sort.dir === -1 ? '▼' : '▲') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={`${t.id}-${t.genre}`}>
                <td>
                  <a href={`https://open.spotify.com/track/${t.id}`} target="_blank" rel="noreferrer">{t.name}</a>
                  {t.explicit && <span className="badge">E</span>}
                </td>
                <td>{t.artists.join(', ')}</td>
                <td>{t.genre}</td>
                <td className="num">{t.popularity}</td>
                <td className="num">{t.danceability.toFixed(2)}</td>
                <td className="num">{t.energy.toFixed(2)}</td>
                <td className="num">{t.tempo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page + 1} of {pages}</span>
        <button type="button" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </section>
  );
}
