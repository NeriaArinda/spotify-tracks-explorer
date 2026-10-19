import { useEffect, useState } from 'react';

const FILES = ['overview', 'genres', 'tracks'];

/** Loads the pre-built JSON files from public/data. */
export function useData() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      FILES.map((name) =>
        fetch(`${import.meta.env.BASE_URL}data/${name}.json`).then((res) => {
          if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
          return res.json();
        }),
      ),
    )
      .then(([overview, genres, tracks]) => {
        if (!cancelled) setState({ status: 'ready', data: { overview, genres, tracks }, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', data: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
