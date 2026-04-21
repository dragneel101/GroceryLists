import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DiscountCalculator() {
  const { user } = useAuth();
  const defaultTax = user ? (user.default_tax_rate * 100).toFixed(1) : '13.0';

  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState(defaultTax);

  const original = parseFloat(price) || 0;
  const discountPct = parseFloat(discount) || 0;
  const taxPct = parseFloat(tax) || 0;

  const savings = original * (discountPct / 100);
  const afterDiscount = original - savings;
  const taxAmount = afterDiscount * (taxPct / 100);
  const finalPrice = afterDiscount + taxAmount;

  const hasResult = original > 0;

  return (
    <div className="min-h-screen bg-cyan-50">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to={user ? '/dashboard' : '/'}
            className="p-2 rounded-lg hover:bg-cyan-50 text-slate-400 cursor-pointer transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-cyan-600" />
            <h1 className="text-xl font-semibold text-slate-800">Discount Calculator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-cyan-100 p-6 space-y-5 shadow-sm">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1.5">
              Original price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-slate-700 mb-1.5">
              Discount
            </label>
            <div className="relative">
              <input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
                className="w-full rounded-lg border border-slate-200 px-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>

          <div>
            <label htmlFor="tax" className="block text-sm font-medium text-slate-700 mb-1.5">
              Tax rate
            </label>
            <div className="relative">
              <input
                id="tax"
                type="number"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
                className="w-full rounded-lg border border-slate-200 px-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={`bg-white rounded-2xl border border-cyan-100 overflow-hidden shadow-sm transition-opacity ${hasResult ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="px-6 py-4 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Breakdown</p>
          </div>

          <div className="divide-y divide-slate-50">
            <Row label="Original price" value={original} />
            <Row
              label={`Discount (${discountPct}%)`}
              value={-savings}
              valueClass="text-emerald-600"
              prefix="−$"
              showAbs
            />
            <Row label="Price after discount" value={afterDiscount} bold />
            <Row
              label={`Tax (${taxPct}%)`}
              value={taxAmount}
              valueClass="text-slate-500"
            />
          </div>

          <div className="px-6 py-5 bg-cyan-600 flex items-center justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-2xl font-bold text-white">${finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Savings callout */}
        {hasResult && savings > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-emerald-800 font-medium">You save</span>
            <span className="text-lg font-bold text-emerald-700">${savings.toFixed(2)}</span>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = 'text-slate-800',
  prefix,
  showAbs = false,
  bold = false,
}: {
  label: string;
  value: number;
  valueClass?: string;
  prefix?: string;
  showAbs?: boolean;
  bold?: boolean;
}) {
  const display = showAbs ? Math.abs(value).toFixed(2) : value.toFixed(2);
  return (
    <div className="px-6 py-3.5 flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{label}</span>
      <span className={`text-sm font-medium ${bold ? 'text-slate-800' : valueClass}`}>
        {prefix ?? '$'}{display}
      </span>
    </div>
  );
}
