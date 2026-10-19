import { CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';

import { useChartColors } from '../theme.js';

function MoodTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const g = payload[0].payload;
  return (
    <div className="tooltip">
      <strong>{g.genre}</strong>
      <div>energy {g.energy} · valence {g.valence}</div>
      <div>popularity {g.popularity}</div>
    </div>
  );
}

export default function MoodMap({ genres, selected, onSelect }) {
  const c = useChartColors();
  return (
    <div className="card">
      <div className="card-head">
        <h2>Mood map</h2>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
          <CartesianGrid stroke={c.grid} />
          <XAxis type="number" dataKey="energy" domain={[0, 1]} name="Energy" tick={{ fill: c.text }}
            label={{ value: 'Energy →', position: 'insideBottom', offset: -12, fill: c.text }} />
          <YAxis type="number" dataKey="valence" domain={[0, 1]} name="Valence" tick={{ fill: c.text }}
            label={{ value: 'Happier →', angle: -90, position: 'insideLeft', fill: c.text }} />
          <ZAxis type="number" dataKey="popularity" range={[30, 260]} />
          <Tooltip content={<MoodTooltip />} />
          <Scatter data={genres} onClick={(d) => onSelect(d.genre)} cursor="pointer">
            {genres.map((g) => (
              <Cell key={g.genre} fill={g.genre === selected ? c.accent : c.series}
                fillOpacity={g.genre === selected ? 1 : 0.55} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="hint">Each dot is a genre; bigger dots are more popular.</p>
    </div>
  );
}
