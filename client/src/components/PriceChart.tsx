import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface PriceChartProps {
  data: { time: number; price: number }[];
  color?: string;
  height?: number;
  currency?: string;
}

export default function PriceChart({ data, color = '#5c7cfa', height = 300, currency = 'USD' }: PriceChartProps) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        Grafik verisi yükleniyor...
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
  }));

  const min = Math.min(...data.map((d) => d.price)) * 0.995;
  const max = Math.max(...data.map((d) => d.price)) * 1.005;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min, max]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(v < 1 ? 4 : 2)
          }
        />
        <Tooltip
          contentStyle={{
            background: '#1a1d27',
            border: '1px solid #2a2f45',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#9ca3af' }}
          formatter={(value: number) => [
            value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
            currency,
          ]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill="url(#chartGrad)"
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
