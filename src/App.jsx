import { useMemo, useState } from 'react';

import DriversChart from './components/DriversChart.jsx';
import GenreDetail from './components/GenreDetail.jsx';
import GenreRanking from './components/GenreRanking.jsx';
import MoodMap from './components/MoodMap.jsx';
import TrackTable from './components/TrackTable.jsx';
import { useData } from './useData.js';

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function App() {
  const { status, data, error } = useData();
  const [selected, setSelected] = useState(null);

  const genre = useMemo(() => {
    if (!data) return null;
    return data.genres.find((g) => g.genre === selected) ?? data.genres[0];
  }, [data, selected]);

  if (status === 'loading') return <p className="message">Loading data…</p>;
  if (status === 'error') {
    return (
      <p className="message">
        Could not load data ({error.message}). Run <code>npm run data</code> first — see the README.
      </p>
    );
  }

  const { overview, genres, tracks } = data;
  const fmt = new Intl.NumberFormat('en-US');

  return (
    <main>
      <header>
        <h1>Spotify Tracks Explorer</h1>
        <p className="subtitle">
          What makes a genre popular, and which genres sound alike? Built on the Kaggle Spotify Tracks dataset.
        </p>
        <div className="stats">
          <Stat label="tracks" value={fmt.format(overview.uniqueTracks)} />
          <Stat label="artists" value={fmt.format(overview.artists)} />
          <Stat label="genres" value={overview.genres} />
          <Stat label="explicit" value={`${Math.round(overview.explicitShare * 100)}%`} />
        </div>
      </header>

      <section className="grid two">
        <GenreRanking genres={genres} selected={genre.genre} onSelect={setSelected} />
        <MoodMap genres={genres} selected={genre.genre} onSelect={setSelected} />
      </section>

      <section className="grid two">
        <GenreDetail genre={genre} genres={genres} onSelect={setSelected} />
        <DriversChart drivers={overview.drivers} />
      </section>

      <TrackTable tracks={tracks} genres={genres} genre={genre.genre} />

      <footer>
        Data: <a href="https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset">Spotify Tracks Dataset</a>{' '}
        on Kaggle · Built with React, Vite and Recharts
      </footer>
    </main>
  );
}
