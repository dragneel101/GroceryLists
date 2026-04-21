import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/client';

interface ShopItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  estimated_price: number | null;
  actual_price: number | null;
  checked: boolean;
}

export default function ShoppingMode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listName, setListName] = useState('');
  const [taxRate, setTaxRate] = useState(0.13);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    api.get(`/lists/${id}`).then((r) => {
      setListName(r.data.name);
      setTaxRate(parseFloat(r.data.tax_rate));
      setItems(r.data.items || []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function toggleChecked(item: ShopItem) {
    const updated = await api.patch(`/lists/${id}/items/${item.id}`, { checked: !item.checked });
    setItems(items.map((i) => i.id === item.id ? { ...i, checked: updated.data.checked } : i));
  }

  async function setPrice(item: ShopItem, price: string) {
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed < 0) return;
    const updated = await api.patch(`/lists/${id}/items/${item.id}`, { actual_price: parsed });
    setItems(items.map((i) => i.id === item.id ? { ...i, actual_price: updated.data.actual_price } : i));
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const body: any = {
      name: newName.trim(),
      quantity: parseFloat(newQty) || 1,
    };
    if (newUnit.trim()) body.unit = newUnit.trim();
    if (newPrice) body.actual_price = parseFloat(newPrice);

    const { data } = await api.post(`/lists/${id}/items`, body);
    setItems([...items, data]);
    setNewName(''); setNewQty('1'); setNewUnit(''); setNewPrice('');
    setShowAdd(false);
  }

  async function finishShopping() {
    await api.patch(`/lists/${id}`, { status: 'completed' });
    navigate(`/lists/${id}/receipt`);
  }

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  const subtotal = items.reduce((sum, i) => {
    const price = i.actual_price ?? i.estimated_price;
    return sum + (price != null ? parseFloat(String(price)) * parseFloat(String(i.quantity)) : 0);
  }, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const pricedCount = items.filter((i) => i.actual_price != null || i.estimated_price != null).length;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-cyan-50 text-slate-400">Loading…</div>
  );

  return (
    <div className="min-h-screen bg-cyan-50 pb-44">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-cyan-50 text-slate-400 cursor-pointer transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="flex-1 text-xl font-semibold text-slate-800 truncate">{listName}</h1>
          <button
            onClick={finishShopping}
            className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        {unchecked.map((item) => (
          <ShopItemRow key={item.id} item={item} onToggle={toggleChecked} onPrice={setPrice} />
        ))}

        {checked.length > 0 && (
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2 pb-1 px-1">
              In cart ({checked.length})
            </p>
            {checked.map((item) => (
              <ShopItemRow key={item.id} item={item} onToggle={toggleChecked} onPrice={setPrice} />
            ))}
          </>
        )}

        {/* Add item inline */}
        <div className="bg-white rounded-xl border border-cyan-100 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-500 hover:bg-cyan-50 cursor-pointer transition-colors"
          >
            <Plus size={15} className="text-cyan-600" />
            <span>Add item</span>
            {showAdd ? <ChevronUp size={14} className="ml-auto text-slate-400" /> : <ChevronDown size={14} className="ml-auto text-slate-400" />}
          </button>
          {showAdd && (
            <form onSubmit={addItem} className="px-4 pb-4 space-y-2 border-t border-cyan-50">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Item name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-3 transition-colors"
                required
                autoFocus
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="Qty"
                  min="0"
                  step="any"
                  className="w-16 rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                />
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Unit"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                />
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="$0.00"
                  min="0"
                  step="0.01"
                  className="w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-cyan-700 cursor-pointer transition-colors"
              >
                Add
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Live total bar */}
      {pricedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-cyan-100 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{checked.length}/{items.length} in cart</span>
              <span>Tax {(taxRate * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-xs text-slate-400">Subtotal</p>
                  <p className="text-sm font-semibold text-slate-700">${subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tax</p>
                  <p className="text-sm font-semibold text-slate-700">${tax.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-2xl font-bold text-cyan-600">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopItemRow({
  item,
  onToggle,
  onPrice,
}: {
  item: ShopItem;
  onToggle: (item: ShopItem) => void;
  onPrice: (item: ShopItem, price: string) => void;
}) {
  const [priceVal, setPriceVal] = useState(
    item.actual_price != null ? String(parseFloat(String(item.actual_price)).toFixed(2)) : ''
  );

  return (
    <div className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-3 transition-all shadow-sm ${item.checked ? 'opacity-50 border-cyan-50' : 'border-cyan-100'}`}>
      <button
        onClick={() => onToggle(item)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
          item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-cyan-400'
        }`}
      >
        {item.checked && <Check size={12} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.name}</p>
        <p className="text-xs text-slate-400">{item.quantity} {item.unit || 'unit'}</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400">$</span>
        <input
          type="number"
          value={priceVal}
          onChange={(e) => setPriceVal(e.target.value)}
          onBlur={() => { if (priceVal) onPrice(item, priceVal); }}
          placeholder={item.estimated_price != null ? parseFloat(String(item.estimated_price)).toFixed(2) : '0.00'}
          min="0"
          step="0.01"
          className="w-20 text-right rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
        />
      </div>
    </div>
  );
}
