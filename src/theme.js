import { useEffect, useState } from 'react';

// Chart colours as real values: SVG fill/stroke attributes cannot read CSS variables.
const LIGHT = {
  series: '#3b6ea8',
  seriesMuted: '#b7c6d8',
  accent: '#1db954',
  negative: '#c4553f',
  grid: '#eceef1',
  text: '#5d6673',
};

const DARK = {
  series: '#6f9fd8',
  seriesMuted: '#3c4a5c',
  accent: '#1ed760',
  negative: '#e07a63',
  grid: '#252a31',
  text: '#9aa3ad',
};

const query = () => window.matchMedia?.('(prefers-color-scheme: dark)');

export function useChartColors() {
  const [dark, setDark] = useState(() => Boolean(query()?.matches));
  useEffect(() => {
    const mq = query();
    if (!mq) return undefined;
    const onChange = (e) => setDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return dark ? DARK : LIGHT;
}
