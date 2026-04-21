import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingDown, Receipt, Smartphone, Check } from 'lucide-react';

const features = [
  {
    icon: ShoppingCart,
    title: 'Organised lists',
    desc: "Create lists for every trip. Add items with quantities and units, reorder on the fly, and move straight into shopping mode when you're ready.",
  },
  {
    icon: TrendingDown,
    title: 'Price memory',
    desc: 'Every price you enter is remembered. Next time you add the same item, the last price is pre-filled — so your estimates are always grounded in reality.',
  },
  {
    icon: Receipt,
    title: 'Instant receipt',
    desc: "When you're done shopping, get a full receipt with itemised totals, configurable tax rate, and a grand total. No mental math.",
  },
  {
    icon: Smartphone,
    title: 'Mobile-ready API',
    desc: 'The REST API uses JWT auth, so a native mobile app can connect to the same backend with no changes. Everything is built for multi-client from day one.',
  },
];

const steps = [
  'Create a grocery list and set your tax rate',
  'Add items — prices auto-fill from your history',
  'Switch to shopping mode and enter actual prices as you go',
  'Finish and get a complete receipt with tax',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-cyan-100 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShoppingCart size={20} className="text-cyan-600" />
            GroceryList
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/calculator"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors cursor-pointer"
            >
              Calculator
            </Link>
            <Link
              to="/login"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors cursor-pointer"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-cyan-600 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-semibold text-cyan-700 bg-cyan-100 rounded-full px-3 py-1 mb-6 tracking-wide uppercase">
          Free &amp; open source
        </span>
        <h1 className="text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
          Smarter grocery lists<br className="hidden sm:block" /> that learn your prices
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Plan your shop, track what you spend, and get an instant receipt with tax — all in one clean app that remembers what you paid last time.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-cyan-600 text-white rounded-xl px-6 py-3 font-medium hover:bg-cyan-700 transition-colors cursor-pointer"
          >
            Start for free
          </Link>
          <Link
            to="/login"
            className="text-slate-700 border border-slate-200 rounded-xl px-6 py-3 font-medium hover:bg-cyan-50 hover:border-cyan-200 transition-colors cursor-pointer"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* App preview */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-8">
          <div className="space-y-2">
            {['Whole milk — 2 L', 'Sourdough bread', 'Free-range eggs — 12', 'Cheddar — 400 g', 'Greek yogurt — 500 g'].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 bg-white rounded-xl border px-4 py-3 transition-all ${i < 2 ? 'opacity-40 border-cyan-100' : 'border-cyan-100'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${i < 2 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                  {i < 2 && <Check size={11} />}
                </div>
                <span className={`flex-1 text-sm font-medium ${i < 2 ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item}</span>
                <span className="text-sm text-slate-400">{['$4.29', '$5.49', '$6.99', '$8.49', '$3.99'][i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-cyan-100 flex justify-between text-sm text-slate-500">
            <span>3 items left</span>
            <span className="font-bold text-cyan-600">Total ~$29.25</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-cyan-50 border-y border-cyan-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">{"Everything you need, nothing you don't"}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-cyan-100 p-6 hover:border-cyan-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-cyan-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">How it works</h2>
        <div className="max-w-lg mx-auto space-y-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-cyan-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-slate-700 text-sm leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cyan-600 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to shop smarter?</h2>
          <p className="text-cyan-100 text-sm mb-8">Free to use. No credit card required.</p>
          <Link
            to="/register"
            className="inline-block bg-white text-cyan-700 rounded-xl px-6 py-3 font-medium hover:bg-cyan-50 transition-colors cursor-pointer"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShoppingCart size={14} className="text-cyan-500" />
            GroceryList
          </div>
          <span>Built with React + Express + PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
