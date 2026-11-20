/** Honest live-source status for the UI badge */

export interface SourceReport {
  id: string;
  label: string;
  ok: boolean;
  at: string;
  detail?: string;
}

const sources = new Map<string, SourceReport>();
const listeners = new Set<() => void>();

export function recordSource(id: string, label: string, ok: boolean, detail?: string): void {
  sources.set(id, { id, label, ok, at: new Date().toISOString(), detail });
  listeners.forEach((fn) => { try { fn(); } catch { /* */ } });
}

export function getLiveStatus() {
  const list = [...sources.values()];
  const ok = list.filter((s) => s.ok).length;
  const latest = list.reduce<string | null>((acc, s) => (!acc || s.at > acc ? s.at : acc), null);
  const timeLabel = latest
    ? new Date(latest).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;
  return {
    sources: list,
    liveCount: ok,
    total: list.length,
    lastUpdate: latest,
    label: ok > 0
      ? `Canlı Piyasa Verisi · ${ok}/${Math.max(list.length, 1)} kaynak${timeLabel ? ` · ${timeLabel}` : ''}`
      : 'Kaynak bekleniyor',
  };
}

export function resetLiveStatus(): void {
  sources.clear();
  listeners.forEach((fn) => { try { fn(); } catch { /* */ } });
}

export function subscribeLiveStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
