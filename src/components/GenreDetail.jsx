import { useMemo } from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { FEATURES, mean, round, similarGenres } from '../lib/aggregate.js';
import { useChartColors } from '../theme.js';

export default function GenreDetail({ genre, genres, onSelect }) {
  const c = useChartColors();
  const comparison = useMemo(
    () =>
      FEATURES.map((f) => ({
        feature: f,
        [genre.genre]: genre[f],
        'all genres': round(mean(genres.map((g) => g[f])), 3),
      })),
    [genre, genres],
  );
  const similar = useMemo(() => similarGenres(genres, genre.genre, 5), [genre, genres]);

  return (
    <div className="card">
      <div className="card-head">
        <h2>{genre.genre}</h2>
        <span className="muted">
          {genre.count} tracks · popularity {genre.popularity} · {genre.tempo} BPM · {genre.minutes} min
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparison} margin={{ left: 0, right: 8 }}>
          <XAxis dataKey="feature" tick={{ fontSize: 11, fill: c.text }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis domain={[0, 1]} tick={{ fontSize: 12, fill: c.text }} />
          <Tooltip cursor={{ fill: c.grid }} />
          <Legend />
          <Bar dataKey={genre.genre} fill={c.accent} radius={[4, 4, 0, 0]} />
          <Bar dataKey="all genres" fill={c.seriesMuted} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <h3>Sounds most like</h3>
      <div className="chips">
        {similar.map((s) => (
          <button key={s.genre} type="button" className="chip" onClick={() => onSelect(s.genre)}>
            {s.genre}
          </button>
        ))}
      </div>
    </div>
  );
}
