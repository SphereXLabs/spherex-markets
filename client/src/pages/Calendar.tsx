import { Calendar, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { usePolling, formatDate } from '../hooks';
import { Loading, ErrorBox } from '../components/UI';

const IMPACT_COLORS = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function CalendarPage() {
  const { data, loading, error, refresh } = usePolling(() => api.calendar(), 3600000);

  if (loading) return <Loading text="Ekonomik takvim yükleniyor..." />;
  if (error) return <ErrorBox message={error} onRetry={refresh} />;

  const grouped = (data || []).reduce<Record<string, typeof data>>((acc, ev) => {
    const d = ev.date.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d]!.push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Calendar className="w-6 h-6 text-spherex-400" />
        Ekonomik Takvim
      </h2>

      {Object.entries(grouped).map(([date, events]) => (
        <section key={date}>
          <h3 className="text-sm font-semibold text-spherex-300 mb-3">{formatDate(date)}</h3>
          <div className="space-y-2">
            {events?.map((ev) => (
              <div key={ev.id} className="card flex items-start gap-4 p-4">
                <div className="text-xs font-mono text-gray-500 w-12">{ev.time || '—'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{ev.title}</div>
                  {ev.description && <div className="text-xs text-gray-500 mt-1">{ev.description}</div>}
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface text-gray-400">{ev.country}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface text-gray-400">{ev.category}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${IMPACT_COLORS[ev.impact]}`}>
                  {ev.impact === 'high' ? <AlertCircle className="w-3 h-3 inline mr-1" /> : null}
                  {ev.impact}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
