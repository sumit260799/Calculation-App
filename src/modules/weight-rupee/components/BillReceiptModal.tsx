import React, { useState } from 'react';
import type { CartItem } from '../../../types/calculator';
import { formatIndianCurrency } from '../utils';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { 
  Trash2, 
  Copy, 
  Check, 
  Printer, 
  Receipt, 
  ShoppingBag
} from 'lucide-react';
import { playFeedback } from '../../../utils/feedback';

interface BillReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearBill: () => void;
}

export const BillReceiptModal: React.FC<BillReceiptModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearBill,
}) => {
  const [copied, setCopied] = useState(false);

  const grandTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);

  const generateReceiptText = () => {
    const lines = [
      '==============================',
      '     GROCERY / MARKET BILL    ',
      '==============================',
      `Date: ${new Date().toLocaleDateString('en-IN')}  Time: ${new Date().toLocaleTimeString('en-IN')}`,
      '------------------------------',
      ...items.map((item, i) => 
        `${i + 1}. ${item.name} (${item.purchasedWeight} ${item.purchasedUnit})\n   @ ₹${item.basePrice}/${item.baseQuantity}${item.baseUnit} = ${formatIndianCurrency(item.finalPrice)}`
      ),
      '------------------------------',
      `TOTAL ITEMS : ${items.length}`,
      `GRAND TOTAL : ${formatIndianCurrency(grandTotal)}`,
      '==============================',
      'Generated via PriceScale App',
    ];
    return lines.join('\n');
  };

  const handleCopy = () => {
    playFeedback.click();
    navigator.clipboard.writeText(generateReceiptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    playFeedback.click();
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grocery / Market Bill Slip"
      subtitle={`${items.length} items added to your calculation slip`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              playFeedback.click();
              onClearBill();
            }}
            disabled={items.length === 0}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={items.length === 0}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied Receipt' : 'Copy for WhatsApp'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              disabled={items.length === 0}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Slip
            </Button>
          </div>
        </div>
      }
    >
      {items.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 mb-3">
            <ShoppingBag className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-base font-medium text-slate-300">Your bill slip is empty</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Calculate items using Weight to Price or Price to Weight and tap "Add to Bill / Shopping List".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Item & Qty</th>
                  <th className="px-4 py-3 text-right">Base Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-2 py-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[11px] font-mono text-emerald-400">
                        {item.purchasedWeight} {item.purchasedUnit}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      ₹{item.basePrice} / {item.baseQuantity} {item.baseUnit}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-100 font-numeric text-sm">
                      {formatIndianCurrency(item.finalPrice)}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => {
                          playFeedback.click();
                          onRemoveItem(item.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Grand Total</span>
                <span className="text-xs text-slate-500 ml-2">({items.length} items)</span>
              </div>
            </div>
            <div className="font-numeric text-2xl font-extrabold text-emerald-400">
              {formatIndianCurrency(grandTotal)}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
