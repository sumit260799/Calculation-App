import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { LineChart, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { currencyService } from '../../../services/currencyService';
import type { HistoricalPeriod } from '../types';
import { formatRate } from '../../../utils/currency';
import dayjs from 'dayjs';
import { playFeedback } from '../../../utils/feedback';

interface HistoricalRateChartProps {
  fromCurrency: string;
  toCurrency: string;
}

const PERIODS: Array<{ label: string; value: HistoricalPeriod; days: number }> = [
  { label: '1W', value: '1W', days: 7 },
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
];

export const HistoricalRateChart: React.FC<HistoricalRateChartProps> = ({
  fromCurrency,
  toCurrency,
}) => {
  const [period, setPeriod] = useState<HistoricalPeriod>('1M');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const selectedPeriodConfig = PERIODS.find((p) => p.value === period) || PERIODS[1];

  // Calculate start & end date using dayjs
  const { startDate, endDate } = useMemo(() => {
    const end = dayjs().format('YYYY-MM-DD');
    const start = dayjs().subtract(selectedPeriodConfig.days, 'day').format('YYYY-MM-DD');
    return { startDate: start, endDate: end };
  }, [selectedPeriodConfig.days]);

  // React Query fetch for historical rates
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['historicalRates', fromCurrency, toCurrency, startDate, endDate],
    queryFn: () =>
      currencyService.getHistoricalRates(fromCurrency, toCurrency, startDate, endDate),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    enabled: isExpanded && Boolean(fromCurrency) && Boolean(toCurrency) && fromCurrency !== toCurrency,
  });

  const chartData = useMemo(() => {
    if (!data?.data || data.data.length === 0) return [];
    return data.data.map((item) => ({
      rawDate: item.date,
      formattedDate: dayjs(item.date).format('MMM D'),
      rate: item.rate,
    }));
  }, [data]);

  // Compute statistics: min, max, avg, % change
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, avg: 0, change: 0, isPositive: true };
    }
    const rates = chartData.map((d) => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;

    const first = rates[0];
    const last = rates[rates.length - 1];
    const change = first > 0 ? ((last - first) / first) * 100 : 0;

    return {
      min,
      max,
      avg,
      change,
      isPositive: change >= 0,
    };
  }, [chartData]);

  if (fromCurrency === toCurrency) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 shadow-sm space-y-3.5">
      {/* Header and Period Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 my-0">
              {fromCurrency} to {toCurrency} Rate History
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {dayjs(startDate).format('MMM D, YYYY')} – {dayjs(endDate).format('MMM D, YYYY')}
            </span>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start sm:self-auto">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                playFeedback.click();
                setPeriod(p.value);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                period === p.value
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {chartData.length > 0 && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Low</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-rose-400">
              {formatRate(stats.min)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">High</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400">
              {formatRate(stats.max)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Average</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-200">
              {formatRate(stats.avg)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Period Trend</span>
              <span
                className={`font-mono text-xs sm:text-sm font-bold ${
                  stats.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {stats.isPositive ? '+' : ''}
                {stats.change.toFixed(2)}%
              </span>
            </div>
            {stats.isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-52 w-full pt-1 relative">
        {isLoading ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>Loading historical exchange data...</span>
          </div>
        ) : isError ? (
          <div className="h-full w-full flex items-center justify-center text-rose-400 text-xs text-center px-4">
            Unable to load historical rates: {(error as any)?.message || 'Network error'}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
            No historical rate points available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={['dataMin - 0.001', 'dataMax + 0.001']}
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => formatRate(val, 2)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700/90 rounded-xl px-3 py-2 shadow-xl text-xs">
                        <div className="text-slate-400 text-[11px]">{dataPoint.rawDate}</div>
                        <div className="font-mono font-bold text-emerald-300 text-sm mt-0.5">
                          1 {fromCurrency} = {formatRate(dataPoint.rate)} {toCurrency}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rateGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
