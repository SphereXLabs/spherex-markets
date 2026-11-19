/** Shared demo-mode flag for GitHub Pages / offline client fallback */

let demoMode = false;
const listeners = new Set<() => void>();

export function isDemoMode(): boolean {
  return demoMode;
}

export function enableDemoMode(): void {
  if (demoMode) return;
  demoMode = true;
  listeners.forEach((fn) => {
    try { fn(); } catch { /* */ }
  });
}

export function subscribeDemoMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
