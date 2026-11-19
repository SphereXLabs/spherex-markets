import { useState, useEffect } from 'react';
import { LiveStreamData, isDemoMode, subscribeDemoMode } from '../api';
import { enableDemoMode } from '../demo/mode';
import { liveTick } from '../demo/live';

export function useLiveData(enabled = true) {
  const [data, setData] = useState<LiveStreamData | null>(null);
  const [connected, setConnected] = useState(false);
  const [demo, setDemo] = useState(isDemoMode());

  useEffect(() => subscribeDemoMode(() => setDemo(true)), []);

  useEffect(() => {
    if (!enabled) return;

    if (demo || isDemoMode()) {
      let cancelled = false;
      const poll = async () => {
        try {
          const tick = await liveTick();
          if (!cancelled) {
            setData(tick);
            setConnected(true);
          }
        } catch {
          if (!cancelled) {
            setData({
              time: new Date().toISOString(),
              btc: { price: 65000, change: 0 },
              usdTry: 34.5,
              bist100: { price: 9850, change: 0.4 },
              gold: { price: 2350, change: 0.3 },
            });
            setConnected(true);
          }
        }
      };
      poll();
      const id = window.setInterval(poll, 30000);
      return () => {
        cancelled = true;
        window.clearInterval(id);
      };
    }

    const es = new EventSource('/api/stream');
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try { setData(JSON.parse(e.data)); } catch { /* */ }
    };
    es.onerror = () => {
      setConnected(false);
      es.close();
      enableDemoMode();
      setDemo(true);
    };
    return () => es.close();
  }, [enabled, demo]);

  return { data, connected };
}
