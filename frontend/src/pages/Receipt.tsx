import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Printer } from 'lucide-react';
import api from '../api/client';

interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string | null;
  actual_price: number | null;
  line_total: number | null;
}

interface ReceiptData {
  list: { id: string; name: string; tax_rate: number; completed_at: string | null };
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export default function Receipt() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/lists/${id}/receipt`).then((r) => setReceipt(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-cyan-50 text-slate-400">Loading…</div>
  );
  if (!receipt) return (
    <div className="flex h-screen items-center justify-center bg-cyan-50 text-red-400">Receipt not found</div>
  );

  return (
    <div className="min-h-screen bg-cyan-50">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-cyan-50 text-slate-400 cursor-pointer transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-800">{receipt.list.name}</h1>
            {receipt.list.completed_at && (
              <p className="text-xs text-slate-400">{new Date(receipt.list.completed_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
            <CheckCircle2 size={12} /> Completed
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl border border-cyan-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Items</p>
            <span className="text-xs text-slate-400">{receipt.items.length} items</span>
          </div>
          {receipt.items.map((item, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400">{item.quantity} {item.unit || 'unit'}</p>
              </div>
              <div className="text-right">
                {item.line_total != null ? (
                  <>
                    <p className="text-sm font-semibold text-slate-800">${item.line_total.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">${item.actual_price?.toFixed(2)} each</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">—</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-cyan-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Tax ({(receipt.list.tax_rate * 100).toFixed(0)}%)</span>
              <span>${receipt.tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="px-4 py-4 bg-cyan-600 flex items-center justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-2xl font-bold text-white">${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 bg-white border border-cyan-100 text-slate-600 rounded-xl py-3 text-sm font-medium hover:bg-cyan-50 transition-colors cursor-pointer shadow-sm"
        >
          <Printer size={16} />
          Print receipt
        </button>
      </main>
    </div>
  );
}
