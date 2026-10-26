import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  HeartPulse, 
  Clock, 
  Car, 
  Plane, 
  PiggyBank, 
  Search, 
  CheckCircle2, 
  TrendingUp, 
  Star,
  Scale,
  Award
} from 'lucide-react';
import { getPolicies } from '../api/client';

export default function LandingPage({ setActiveTab, onSelectPolicyForCompare, onAskAI }) {
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [policies, setPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, [selectedCategory]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await getPolicies({ category: selectedCategory, limit: 6 });
      setPolicies(data);
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'health', label: 'Health Insurance', icon: HeartPulse, count: '12 Plans' },
    { id: 'term', label: 'Term Life', icon: Clock, count: '8 Plans' },
    { id: 'life', label: 'Guaranteed Savings', icon: PiggyBank, count: '5 Plans' },
    { id: 'motor', label: 'Car & Two-Wheeler', icon: Car, count: '7 Plans' },
    { id: 'travel', label: 'Overseas Travel', icon: Plane, count: '6 Plans' }
  ];

  const filteredPolicies = policies.filter(p => 
    !searchQuery || 
    p.policy_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.insurer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.coverage_features.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen ombre-page-bg flex flex-col">
      
      {/* Light Fintech Hero Section with Light Blue Ombre */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-200/50 via-sky-100/30 to-transparent border-b border-sky-300/80 text-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        
        {/* Soft pastel ambient background glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-sky-300 text-xs font-bold text-sky-800 mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>AI-Powered Multi-Criteria Insurance Recommendation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight sm:leading-tight mb-6">
            Find the Exact Insurance You Need,{' '}
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Backed by Explainable AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
            Compare 44+ verified policies across Health, Term, Motor, and Travel. Ranked by content similarity, claim ratios, waiting period penalties, and your personalized budget.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('recommender')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Personalized Recommendation</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-all hover:border-slate-400"
            >
              <span>Ask AI Policy Advisor</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-10 border-t border-sky-200">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">44+</div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">Benchmarked Plans</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-600">99.5%</div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">Peak Claim Ratio</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sky-600">6-Axis</div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">Scoring Model</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600">100%</div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">Explainable Logic</div>
            </div>
          </div>

        </div>
      </section>

      {/* Explorer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block mb-1">
              Explore Our Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pre-Loaded Policy Catalog
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse coverage, claim settlement rates, and waiting periods across insurance verticals.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by insurer, feature, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 border border-sky-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs"
            />
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  isSelected
                    ? 'bg-sky-100/90 text-sky-800 border border-sky-300 shadow-xs ring-1 ring-sky-300/40'
                    : 'bg-white/90 text-slate-600 hover:bg-white border border-sky-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-500'}`} />
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isSelected ? 'bg-sky-200/90 text-sky-900' : 'bg-slate-100 text-slate-500'
                }`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Policies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 h-64 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                <div className="h-12 bg-slate-50 rounded mt-6"></div>
              </div>
            ))}
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-sm">No policies match your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((p) => {
              const features = (p.coverage_features || '').split(';').slice(0, 3);
              return (
                <div 
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                        {p.insurer}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                      {p.policy_name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {p.best_suited_for || p.policy_description}
                    </p>

                    {/* Pricing */}
                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Starting Base</span>
                        <div className="text-sm font-extrabold text-slate-900">
                          ₹{p.base_premium_annual.toLocaleString()}<span className="text-xs font-normal text-slate-500">/yr</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Claim Settlement</span>
                        <div className="text-sm font-extrabold text-teal-700">
                          {p.claim_settlement_ratio}%
                        </div>
                      </div>
                    </div>

                    {/* Features Snippet */}
                    <div className="mt-4 space-y-1.5">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onAskAI && onAskAI(p)}
                      className="text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
                    >
                      Ask AI Advisor →
                    </button>
                    <button
                      onClick={() => onSelectPolicyForCompare && onSelectPolicyForCompare(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Compare</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* Why PolicyPilot Section */}
      <section className="bg-white/80 backdrop-blur-md border-t border-sky-200/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Choose PolicyPilot AI?
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
              Traditional aggregator websites push policies based on sales commission. PolicyPilot uses objective actuarial algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 rounded-3xl p-6 border border-sky-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Zero Bias, 100% Math</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rankings are determined solely by TF-IDF cosine similarity, claim settlement track records, and strict affordability formulas.
              </p>
            </div>

            <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Pre-Existing Condition Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applicants with diabetes, hypertension, or cardiac histories receive intelligent waiting period weighting to prevent claim rejections.
              </p>
            </div>

            <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Citations-Backed AI Advisor</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask specific questions like maternity coverage or zero-depreciation riders and get answers citing specific policy clauses.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
