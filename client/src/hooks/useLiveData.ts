import { useState, useEffect } from 'react';
import { LiveStreamData } from '../api';

export function useLiveData(enabled = true) {
  const [data, setData] = useState<LiveStreamData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const es = new EventSource('/api/stream');
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try { setData(JSON.parse(e.data)); } catch { /* */ }
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [enabled]);

  return { data, connected };
}
