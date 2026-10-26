import React, { useState, useEffect } from 'react';
import { 
  History, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  RefreshCw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { getHistory } from '../api/client';

export default function DashboardPage({ setActiveTab }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data: Premium vs Match Percentage for past sessions
  const chartData = history.slice(0, 7).map((item, idx) => ({
    name: item.top_policy_name ? item.top_policy_name.slice(0, 16) + '...' : `Session ${idx + 1}`,
    matchPercentage: item.top_match_percentage || 85,
    category: (item.insurance_type || 'health').toUpperCase()
  }));

  const COLORS = ['#0284c7', '#0ea5e9', '#3b82f6', '#6366f1', '#06b6d4'];

  return (
    <div className="min-h-screen ombre-page-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold mb-2">
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Session History & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recommendation Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit past search profiles, evaluate match distributions, and review saved recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setActiveTab('recommender')}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm shadow-sky-600/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>New Recommendation</span>
            </button>
          </div>
        </div>

        {/* Analytics Chart Card */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-3xl border border-sky-300 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest block mb-0.5">
                Session Analytics
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Match Score Distribution Across Recent Sessions
              </h3>
              <p className="text-xs text-slate-500">
                Shows the top-1 ranked policy match percentage calculated by the multi-criteria engine.
              </p>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#475569', fontSize: 11 }} 
                    angle={-15} 
                    textAnchor="end" 
                  />
                  <YAxis 
                    domain={[60, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    unit="%" 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '12px', 
                      color: '#0f172a', 
                      fontSize: '12px', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)' 
                    }} 
                  />
                  <Bar dataKey="matchPercentage" name="Match Score (%)" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Saved Sessions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Past Recommendation Sessions</h3>
              <p className="text-xs text-slate-500">Chronological log of user queries and candidate evaluations.</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {history.length} Sessions Logged
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading session logs...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No recommendation history logged yet. Complete a recommendation questionnaire to populate this dashboard!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="py-3.5 px-6 font-semibold">Timestamp</th>
                    <th className="py-3.5 px-6 font-semibold">Category</th>
                    <th className="py-3.5 px-6 font-semibold">Profile Summary</th>
                    <th className="py-3.5 px-6 font-semibold">Top Recommendation</th>
                    <th className="py-3.5 px-6 font-semibold">Match Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                          {row.insurance_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 font-medium">
                        {row.input_profile?.age ? `${row.input_profile.age}y, ${row.input_profile.city}` : 'Default profile'}
                        {row.input_profile?.budget_annual && ` (Budget: ₹${Number(row.input_profile.budget_annual).toLocaleString()})`}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {row.top_policy_name}
                      </td>
                      <td className="py-3.5 px-6 font-extrabold text-teal-700">
                        {row.top_match_percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
