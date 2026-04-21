import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, CheckCircle2, Clock, Trash2, User, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

interface GroceryList {
  id: string;
  name: string;
  tax_rate: number;
  status: 'draft' | 'shopping' | 'completed';
  created_at: string;
  completed_at: string | null;
}

const statusConfig = {
  draft: { label: 'Draft', icon: Clock, color: 'text-slate-500 bg-slate-100' },
  shopping: { label: 'Shopping', icon: ShoppingCart, color: 'text-cyan-700 bg-cyan-100' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-100' },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/lists').then((r) => setLists(r.data)).finally(() => setLoading(false));
  }, []);

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/lists', { name: newName.trim() });
      setLists([data, ...lists]);
      setNewName('');
      setShowCreate(false);
      navigate(`/lists/${data.id}/edit`);
    } finally {
      setCreating(false);
    }
  }

  async function deleteList(id: string) {
    if (!confirm('Delete this list?')) return;
    await api.delete(`/lists/${id}`);
    setLists(lists.filter((l) => l.id !== id));
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-cyan-600" />
            <h1 className="text-xl font-semibold text-slate-800">Grocery Lists</h1>
          </div>
          <div className="flex items-center gap-1">
            <Link to="/calculator" className="p-2 rounded-lg hover:bg-cyan-50 text-slate-400 cursor-pointer transition-colors" title="Discount calculator">
              <Tag size={18} />
            </Link>
            <Link to="/profile" className="p-2 rounded-lg hover:bg-cyan-50 text-slate-400 cursor-pointer transition-colors">
              <User size={18} />
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 bg-cyan-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-cyan-700 transition-colors cursor-pointer ml-1"
            >
              <Plus size={16} /> New list
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {showCreate && (
          <form onSubmit={createList} className="mb-4 bg-white rounded-xl border border-cyan-100 p-4 flex gap-2 shadow-sm">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="List name…"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-cyan-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {creating ? '…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading…</div>
        ) : lists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={28} className="text-cyan-400" />
            </div>
            <p className="text-slate-600 font-medium">No lists yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first grocery list above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lists.map((list) => {
              const cfg = statusConfig[list.status];
              const Icon = cfg.icon;
              return (
                <div key={list.id} className="bg-white rounded-xl border border-cyan-100 p-4 flex items-center gap-3 hover:border-cyan-200 hover:shadow-sm transition-all cursor-pointer">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>
                    <Icon size={12} />
                    {cfg.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{list.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(list.created_at).toLocaleDateString()} · Tax {(list.tax_rate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {list.status === 'completed' ? (
                      <Link
                        to={`/lists/${list.id}/receipt`}
                        className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Receipt
                      </Link>
                    ) : (
                      <>
                        <Link
                          to={`/lists/${list.id}/edit`}
                          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Link>
                        {list.status !== 'draft' && (
                          <Link
                            to={`/lists/${list.id}/shop`}
                            className="text-sm text-cyan-600 hover:text-cyan-700 px-3 py-1.5 rounded-lg hover:bg-cyan-50 cursor-pointer transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Shop
                          </Link>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => deleteList(list.id)}
                      className="p-1.5 text-slate-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
