import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, CheckCircle2, Clock, Trash2, User } from 'lucide-react';
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
  draft: { label: 'Draft', icon: Clock, color: 'text-gray-400 bg-gray-50' },
  shopping: { label: 'Shopping', icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Grocery Lists</h1>
          <div className="flex items-center gap-2">
            <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-50 text-gray-500">
              <User size={18} />
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} /> New list
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {showCreate && (
          <form onSubmit={createList} className="mb-4 bg-white rounded-xl border border-gray-200 p-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="List name…"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? '…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : lists.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No lists yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first grocery list above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lists.map((list) => {
              const cfg = statusConfig[list.status];
              const Icon = cfg.icon;
              return (
                <div key={list.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:border-gray-200 transition-colors">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${cfg.color}`}>
                    <Icon size={12} />
                    {cfg.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{list.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(list.created_at).toLocaleDateString()} · Tax {(list.tax_rate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {list.status === 'completed' ? (
                      <Link to={`/lists/${list.id}/receipt`} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                        Receipt
                      </Link>
                    ) : (
                      <>
                        <Link to={`/lists/${list.id}/edit`} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                          Edit
                        </Link>
                        {list.status !== 'draft' && (
                          <Link to={`/lists/${list.id}/shop`} className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                            Shop
                          </Link>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => deleteList(list.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors"
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
