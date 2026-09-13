import React from 'react';
import type { CalculationHistoryItem } from '../../../types/calculator';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Trash2, History, ArrowRight } from 'lucide-react';
import { playFeedback } from '../../../utils/feedback';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
  onRestore: (item: CalculationHistoryItem) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onRestore,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calculation History"
      subtitle="Recent weight & price calculations"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              playFeedback.click();
              onClearHistory();
            }}
            disabled={history.length === 0}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear History
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {history.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center text-slate-400">
          <History className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-300">No calculation history yet</p>
          <p className="text-xs text-slate-500 mt-0.5">Your calculations will be saved here automatically.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                playFeedback.click();
                onRestore(item);
                onClose();
              }}
              className="p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={item.type === 'weight-to-price' ? 'emerald' : 'indigo'}>
                    {item.type === 'weight-to-price' ? 'Weight → ₹' : '₹ → Weight'}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Base: ₹{item.baseRate.price} / {item.baseRate.quantity} {item.baseRate.unit}
                  </span>
                </div>
                <div className="text-xs text-slate-200 flex items-center gap-1.5 font-mono">
                  <span>
                    Input: <strong>{item.input.value} {item.input.unit || '₹'}</strong>
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-emerald-400 font-bold">
                    Result: {item.result.display}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all">
                Restore →
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
