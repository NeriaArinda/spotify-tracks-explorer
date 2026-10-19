import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useChartColors } from '../theme.js';

const SORTS = {
  popularity: 'Average popularity',
  danceability: 'Danceability',
  energy: 'Energy',
  valence: 'Happiness (valence)',
};

export default function GenreRanking({ genres, selected, onSelect }) {
  const c = useChartColors();
  const [sortBy, setSortBy] = useState('popularity');
  const [order, setOrder] = useState('top');

  const sorted = [...genres].sort((a, b) => (order === 'top' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]));
  const rows = sorted.slice(0, 15);

  return (
    <div className="card">
      <div className="card-head">
        <h2>Genre ranking</h2>
        <div className="controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Rank genres by">
            {Object.entries(SORTS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={order} onChange={(e) => setOrder(e.target.value)} aria-label="Order">
            <option value="top">Highest</option>
            <option value="bottom">Lowest</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={rows} layout="vertical" margin={{ left: 24, right: 16 }}>
          <XAxis type="number" tick={{ fontSize: 12, fill: c.text }} />
          <YAxis type="category" dataKey="genre" width={110} tick={{ fontSize: 12, fill: c.text }} />
          <Tooltip formatter={(v) => [v, SORTS[sortBy]]} cursor={{ fill: c.grid }} />
          <Bar dataKey={sortBy} radius={[0, 4, 4, 0]} onClick={(d) => onSelect(d.genre)} cursor="pointer">
            {rows.map((g) => (
              <Cell key={g.genre} fill={g.genre === selected ? c.accent : c.series} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="hint">Click a bar to inspect that genre.</p>
    </div>
  );
}
