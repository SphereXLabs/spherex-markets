import { useState, useEffect, useRef } from 'react';
import { LiveStreamData, isDemoMode, subscribeDemoMode } from '../api';
import { enableDemoMode } from '../demo/mode';
import { liveTick } from '../demo/live';
import { getLiveStatus, subscribeLiveStatus } from '../demo/status';

export function useLiveData(enabled = true) {
  const [data, setData] = useState<LiveStreamData | null>(null);
  const [connected, setConnected] = useState(false);
  const [demo, setDemo] = useState(isDemoMode());
  const [statusLabel, setStatusLabel] = useState(() => getLiveStatus().label);
  const dataRef = useRef<LiveStreamData | null>(null);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => subscribeDemoMode(() => setDemo(true)), []);
  useEffect(() => subscribeLiveStatus(() => setStatusLabel(getLiveStatus().label)), []);

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
            setStatusLabel(getLiveStatus().label);
          }
        } catch {
          // Keep previous real tick — never inject hardcoded fake prices
          if (!cancelled) setConnected(Boolean(dataRef.current));
        }
      };
      poll();
      const id = window.setInterval(poll, 20000);
      return () => {
        cancelled = true;
        window.clearInterval(id);
      };
    }

    const es = new EventSource('/api/stream');
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data));
        setConnected(true);
      } catch { /* */ }
    };
    es.onerror = () => {
      setConnected(false);
      es.close();
      enableDemoMode();
      setDemo(true);
    };
    return () => es.close();
  }, [enabled, demo]);

  return { data, connected, statusLabel, liveStatus: getLiveStatus() };
}
