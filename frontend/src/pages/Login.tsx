import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-cyan-100 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center">
            <ShoppingCart size={22} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-1 text-center">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">Sign in to your grocery list</p>
        {error && <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-6">
          No account?{' '}
          <Link to="/register" className="text-cyan-600 font-medium hover:text-cyan-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
