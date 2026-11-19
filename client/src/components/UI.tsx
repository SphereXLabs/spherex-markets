import { Link } from 'react-router-dom';
import { formatPrice, formatChange } from '../hooks';

interface ChangeBadgeProps {
  value: number;
  size?: 'sm' | 'md';
}

export function ChangeBadge({ value, size = 'sm' }: ChangeBadgeProps) {
  const isUp = value >= 0;
  const cls = size === 'md' ? 'text-sm px-2.5 py-1' : '';
  return (
    <span className={`${isUp ? 'badge-up' : 'badge-down'} ${cls}`}>
      {formatChange(value)}
    </span>
  );
}

interface MiniSparklineProps {
  data: number[];
  positive?: boolean;
}

export function MiniSparkline({ data, positive }: MiniSparklineProps) {
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const color = positive !== undefined
    ? (positive ? '#34d399' : '#f87171')
    : (data[data.length - 1] >= data[0] ? '#34d399' : '#f87171');

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

interface AssetRowProps {
  type: 'stock' | 'crypto';
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  image?: string;
  currency?: string;
  extra?: React.ReactNode;
}

export function AssetRow({ type, id, name, symbol, price, change, image, currency, extra }: AssetRowProps) {
  const linkId = type === 'crypto' ? id : symbol;
  return (
    <Link to={`/detay/${type}/${linkId}`} className="card-hover flex items-center gap-4 py-3 px-4">
      {image ? (
        <img src={image} alt={name} className="w-8 h-8 rounded-full" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-spherex-700/30 flex items-center justify-center text-xs font-bold text-spherex-300">
          {symbol.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{name}</div>
        <div className="text-xs text-gray-500 font-mono">{symbol}</div>
      </div>
      {extra}
      <div className="text-right">
        <div className="text-sm font-mono font-medium text-white">{formatPrice(price, currency)}</div>
        <ChangeBadge value={change} />
      </div>
    </Link>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-white font-mono">{value}</div>
      {change !== undefined && (
        <div className="mt-1"><ChangeBadge value={change} /></div>
      )}
    </div>
  );
}

interface LoadingProps {
  text?: string;
}

export function Loading({ text = 'Veriler yükleniyor...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-spherex-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

interface ErrorBoxProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div className="card border-red-500/30 bg-red-500/5 text-center py-8">
      <p className="text-red-400 text-sm mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-spherex-400 hover:text-spherex-300 underline">
          Tekrar dene
        </button>
      )}
    </div>
  );
}
