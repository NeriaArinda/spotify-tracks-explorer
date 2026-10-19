import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useChartColors } from '../theme.js';

export default function DriversChart({ drivers }) {
  const c = useChartColors();
  return (
    <div className="card">
      <div className="card-head">
        <h2>What tracks popularity?</h2>
      </div>
      <p className="muted">
        Pearson correlation between each audio feature and track popularity, across every unique track.
        Values near 0 mean the feature says little about popularity on its own.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={drivers} layout="vertical" margin={{ left: 24, right: 16 }}>
          <XAxis type="number" domain={[-0.3, 0.3]} tick={{ fontSize: 12, fill: c.text }} />
          <YAxis type="category" dataKey="feature" width={110} tick={{ fontSize: 12, fill: c.text }} />
          <ReferenceLine x={0} stroke={c.text} />
          <Tooltip formatter={(v) => [v, 'correlation']} cursor={{ fill: c.grid }} />
          <Bar dataKey="r" radius={4}>
            {drivers.map((d) => (
              <Cell key={d.feature} fill={d.r >= 0 ? c.series : c.negative} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
