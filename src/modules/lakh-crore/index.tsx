import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Sparkles, Copy, Check } from 'lucide-react';
import { playFeedback } from '../../utils/feedback';

export const LakhCroreConverter: React.FC = () => {
  const [rupees, setRupees] = useState<number>(2500000);
  const [copied, setCopied] = useState<string | null>(null);

  const thousands = rupees / 1000;
  const lakhs = rupees / 100000;
  const crores = rupees / 10000000;

  const millions = rupees / 1000000;
  const billions = rupees / 1000000000;
  const trillions = rupees / 1000000000000;

  const PRESETS = [
    { label: '₹1 Lakh', val: 100000 },
    { label: '₹10 Lakh', val: 1000000 },
    { label: '₹50 Lakh', val: 5000000 },
    { label: '₹1 Crore', val: 10000000 },
    { label: '₹10 Crore', val: 100000000 },
    { label: '₹100 Cr', val: 1000000000 },
  ];

  const handleCopy = (key: string, text: string) => {
    playFeedback.click();
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      {/* Input Card */}
      <Card variant="glass" className="p-4 sm:p-5 border-slate-700/60 shadow-lg space-y-3">
        <Input
          label="Enter Amount in Rupees (₹)"
          type="number"
          min="0"
          step="any"
          value={rupees || ''}
          onChange={(e) => setRupees(parseFloat(e.target.value) || 0)}
          prefixElement="₹"
          placeholder="e.g. 2500000"
          className="text-lg font-bold text-emerald-400 py-2.5"
        />

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                playFeedback.click();
                setRupees(p.val);
              }}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-all shrink-0 cursor-pointer active:scale-95 ${
                rupees === p.val
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700/80'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Indian System */}
      <Card variant="glass" className="p-4 border-slate-700/60 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Indian Scale (Base 100)
          </span>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Crores (करोड़)</div>
              <div className="font-numeric text-xl font-bold text-emerald-400">
                {crores.toLocaleString('en-IN', { maximumFractionDigits: 4 })} Cr
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy('cr', `${crores} Crore`)}
            >
              {copied === 'cr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Lakhs (लाख)</div>
              <div className="font-numeric text-lg font-bold text-slate-100">
                {lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakh
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy('lakh', `${lakhs} Lakh`)}
            >
              {copied === 'lakh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          <div className="p-2.5 bg-slate-900/40 rounded-xl flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Thousands (K):</span>
            <span className="text-slate-200 font-bold">{thousands.toLocaleString('en-IN', { maximumFractionDigits: 1 })} K</span>
          </div>
        </div>
      </Card>

      {/* International System */}
      <Card variant="glass" className="p-4 border-slate-700/60 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            International Scale (Base 1,000)
          </span>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Millions (M)</div>
              <div className="font-numeric text-xl font-bold text-indigo-400">
                {millions.toLocaleString('en-US', { maximumFractionDigits: 4 })} M
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy('m', `${millions} Million`)}
            >
              {copied === 'm' ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Billions (B)</div>
              <div className="font-numeric text-lg font-bold text-slate-100">
                {billions.toLocaleString('en-US', { maximumFractionDigits: 6 })} B
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy('b', `${billions} Billion`)}
            >
              {copied === 'b' ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          <div className="p-2.5 bg-slate-900/40 rounded-xl flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Trillions (T):</span>
            <span className="text-slate-200 font-bold">{trillions.toLocaleString('en-US', { maximumFractionDigits: 8 })} T</span>
          </div>
        </div>
      </Card>

      {/* Tip */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Rule: <strong>10 Lakhs = 1 Million</strong> · <strong>100 Crores = 1 Billion</strong></span>
      </div>
    </div>
  );
};
