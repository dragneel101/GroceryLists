import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [taxRate, setTaxRate] = useState(((user?.default_tax_rate || 0.13) * 100).toFixed(1));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch('/users/me', {
        name: name.trim(),
        default_tax_rate: parseFloat(taxRate) / 100,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-cyan-50 text-slate-400 cursor-pointer transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="flex-1 text-xl font-semibold text-slate-800">Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-cyan-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-semibold text-sm">
              {(user?.name || user?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="tax" className="block text-sm font-medium text-slate-700 mb-1">Default tax rate (%)</label>
              <input
                id="tax"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">Applied by default when creating new lists</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50'
              }`}
            >
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
