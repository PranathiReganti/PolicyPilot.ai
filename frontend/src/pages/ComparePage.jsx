import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Check, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getPolicies, comparePolicies } from '../api/client';
import RadarChartComponent from '../components/RadarChartComponent';

export default function ComparePage({ 
  compareList = [], 
  onRemoveFromCompare, 
  onAddCompareId, 
  setActiveTab 
}) {
  const [allPolicies, setAllPolicies] = useState([]);
  const [selectedIds, setSelectedIds] = useState(compareList.length >= 2 ? compareList.slice(0, 4) : [1, 2]);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep selectedIds in sync if compareList updates from elsewhere
  useEffect(() => {
    if (compareList.length >= 2) {
      setSelectedIds(compareList.slice(0, 4));
    }
  }, [compareList]);

  // Fetch all policies for the dropdown selector
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getPolicies({ limit: 50 });
        setAllPolicies(data);
      } catch (err) {
        console.error('Failed to fetch policies for selector:', err);
      }
    };
    fetchAll();
  }, []);

  // Run comparison when selectedIds change
  useEffect(() => {
    if (selectedIds.length >= 2) {
      fetchComparison();
    } else {
      setCompareData(null);
    }
  }, [selectedIds]);

  const fetchComparison = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await comparePolicies(selectedIds);
      setCompareData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to compare policies.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolicy = (id) => {
    if (selectedIds.length >= 4) {
      setError('You can compare a maximum of 4 policies simultaneously.');
      return;
    }
    if (!selectedIds.includes(id)) {
      const next = [...selectedIds, id];
      setSelectedIds(next);
      if (onAddCompareId) onAddCompareId(id);
    }
  };

  const handleRemovePolicy = (id) => {
    const next = selectedIds.filter(pid => pid !== id);
    setSelectedIds(next);
    if (onRemoveFromCompare) onRemoveFromCompare(id);
  };

  return (
    <div className="min-h-screen ombre-page-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border border-sky-300 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-xs font-bold mb-2">
                <Scale className="w-3.5 h-3.5 text-sky-600" />
                <span>Side-by-Side Comparison</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Policy Attribute & Radar Benchmark
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Compare up to 4 policies across claim settlement, network reach, waiting period, and room rent capping.
              </p>
            </div>

            {/* Quick Add Policy Dropdown */}
            {selectedIds.length < 4 && (
              <div className="flex items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPolicy(Number(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
                >
                  <option value="" disabled>+ Add Policy to Compare...</option>
                  {allPolicies
                    .filter(p => !selectedIds.includes(p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.policy_name} ({p.insurer})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Policies Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400">Comparing:</span>
            {compareData?.policies.map((p, idx) => (
              <div 
                key={p.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>{p.policy_name}</span>
                {selectedIds.length > 2 && (
                  <button
                    onClick={() => handleRemovePolicy(p.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-sky-300">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Compiling multi-axis comparison data...</p>
          </div>
        ) : compareData ? (
          <div className="space-y-8">
            
            {/* Visual Radar Comparison Chart Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-4">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest block mb-0.5">
                  5-Axis Multi-Dimensional Scoring
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Radar Benchmark Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Visualizes strengths across Affordability, Claim Settlement Ratio, Network Reach, Waiting Period Advantage, and Rating.
                </p>
              </div>

              <RadarChartComponent 
                radarData={compareData.radar_data} 
                policies={compareData.policies} 
              />
            </div>

            {/* Side-by-Side Detailed Metrics Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  Detailed Feature-by-Feature Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Granular breakdown of costs, sub-limits, exclusions, and network facilities.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 font-bold text-slate-700 uppercase tracking-wider w-1/4">
                        Feature / Metric
                      </th>
                      {compareData.policies.map((p) => (
                        <th key={p.id} className="py-4 px-6 font-extrabold text-slate-900 text-sm">
                          <div>{p.policy_name}</div>
                          <div className="text-xs font-normal text-slate-500 mt-0.5">by {p.insurer}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {compareData.metrics_table.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="py-3.5 px-6 font-bold text-slate-700">
                          {row.metric}
                        </td>
                        {compareData.policies.map((p) => (
                          <td key={p.id} className="py-3.5 px-6 text-slate-600 leading-relaxed font-medium">
                            {row.values[p.policy_name]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Call to Action Bar (Light Blue Ombre) */}
            <div className="bg-gradient-to-r from-sky-100/90 via-blue-50/80 to-sky-100/90 border border-sky-300 text-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div>
                <h4 className="text-base font-bold text-slate-900">Unsure which policy fits your exact medical background?</h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">Our RAG AI advisor can answer specific clause queries with direct citations.</p>
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition-all shadow-md shadow-sky-600/20 flex items-center gap-1.5 shrink-0"
              >
                <span>Consult AI Advisor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Policies Selected for Comparison</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Select 2 to 4 policies from the catalog or recommendation results to view side-by-side metrics and radar charts.
            </p>
            <button
              onClick={() => setSelectedIds([1, 2])}
              className="mt-5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Compare Popular Benchmark Plans
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
