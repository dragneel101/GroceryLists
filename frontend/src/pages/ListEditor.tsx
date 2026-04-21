import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import api from '../api/client';

interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  estimated_price: number | null;
  checked: boolean;
}

interface CatalogItem {
  id: string;
  name: string;
  last_price: number | null;
  default_unit: string | null;
}

export default function ListEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listName, setListName] = useState('');
  const [taxRate, setTaxRate] = useState(0.13);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState('');
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
  const [saving, setSaving] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/lists/${id}`).then((r) => {
      setListName(r.data.name);
      setTaxRate(parseFloat(r.data.tax_rate));
      setItems(r.data.items || []);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (newName.length < 1) { setSuggestions([]); return; }
    api.get(`/items?q=${encodeURIComponent(newName)}`).then((r) => setSuggestions(r.data));
  }, [newName]);

  async function saveListMeta() {
    await api.patch(`/lists/${id}`, { name: listName, tax_rate: taxRate });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/lists/${id}/items`, {
        name: newName.trim(),
        quantity: parseFloat(newQty) || 1,
        unit: newUnit.trim() || undefined,
      });
      setItems([...items, data]);
      setNewName('');
      setNewQty('1');
      setNewUnit('');
      setSuggestions([]);
    } finally {
      setSaving(false);
    }
  }

  function pickSuggestion(item: CatalogItem) {
    setNewName(item.name);
    if (item.default_unit) setNewUnit(item.default_unit);
    setSuggestions([]);
  }

  async function removeItem(itemId: string) {
    await api.delete(`/lists/${id}/items/${itemId}`);
    setItems(items.filter((i) => i.id !== itemId));
  }

  async function startShopping() {
    await saveListMeta();
    await api.patch(`/lists/${id}`, { status: 'shopping' });
    navigate(`/lists/${id}/shop`);
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-cyan-50 text-slate-400">Loading…</div>
  );

  return (
    <div className="min-h-screen bg-cyan-50">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-cyan-50 text-slate-400 cursor-pointer transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <input
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onBlur={saveListMeta}
            className="flex-1 text-xl font-semibold text-slate-800 bg-transparent focus:outline-none"
          />
          <button
            onClick={startShopping}
            className="flex items-center gap-1.5 bg-cyan-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-cyan-700 transition-colors cursor-pointer"
          >
            <ShoppingCart size={15} /> Shop
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Tax rate */}
        <div className="bg-white rounded-xl border border-cyan-100 p-4 flex items-center gap-3 shadow-sm">
          <span className="text-sm text-slate-600 flex-1">Tax rate</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={(taxRate * 100).toFixed(1)}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) / 100)}
              onBlur={saveListMeta}
              className="w-16 text-right rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            />
            <span className="text-sm text-slate-400">%</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-cyan-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {item.quantity} {item.unit || 'unit'}
                  {item.estimated_price != null && ` · ~$${parseFloat(String(item.estimated_price)).toFixed(2)}`}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-slate-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No items yet — add some below</p>
          )}
        </div>

        {/* Estimated total */}
        {items.some((i) => i.estimated_price != null) && (() => {
          const subtotal = items.reduce((sum, i) =>
            sum + (i.estimated_price != null ? parseFloat(String(i.estimated_price)) * i.quantity : 0), 0);
          const tax = subtotal * taxRate;
          return (
            <div className="bg-white rounded-xl border border-cyan-100 p-4 shadow-sm space-y-1.5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 pt-1 border-t border-slate-100">
                <span>Estimated total</span>
                <span>${(subtotal + tax).toFixed(2)}</span>
              </div>
              {items.some((i) => i.estimated_price == null) && (
                <p className="text-xs text-slate-400 pt-0.5">* items without a price history are not included</p>
              )}
            </div>
          );
        })()}

        {/* Add item form */}
        <div className="bg-white rounded-xl border border-cyan-100 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Add item</p>
          <form onSubmit={addItem} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Item name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                required
              />
              {suggestions.length > 0 && (
                <div ref={suggestRef} className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-cyan-100 rounded-lg shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => pickSuggestion(s)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-cyan-50 flex justify-between cursor-pointer transition-colors"
                    >
                      <span className="text-slate-800">{s.name}</span>
                      {s.last_price != null && <span className="text-slate-400">${parseFloat(String(s.last_price)).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder="Qty"
                min="0"
                step="any"
                className="w-20 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              />
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="Unit (L, kg…)"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              />
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1 bg-cyan-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 cursor-pointer transition-colors"
              >
                <Plus size={15} /> Add
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
