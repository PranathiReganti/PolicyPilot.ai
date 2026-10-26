import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Star, 
  Hospital, 
  Clock, 
  Percent, 
  MessageSquarePlus,
  Info
} from 'lucide-react';

export default function PolicyCard({ 
  rec, 
  isCompared = false, 
  onToggleCompare, 
  onAskAI 
}) {
  const [expanded, setExpanded] = useState(false);
  const p = rec.policy;

  // Split features
  const featuresList = (p.coverage_features || '').split(';').map(f => f.trim()).filter(Boolean);
  const exclusionsList = (p.exclusions || '').split(';').map(e => e.trim()).filter(Boolean);

  // Match badge styling based on score (Light pastel blue aesthetic)
  const getBadgeStyle = (pct) => {
    if (pct >= 90) return 'from-sky-50 via-blue-50 to-sky-100 text-sky-800 border-sky-300 shadow-xs';
    if (pct >= 80) return 'from-sky-50 via-cyan-50 to-blue-50 text-sky-700 border-sky-200 shadow-xs';
    return 'from-amber-50 via-yellow-50 to-amber-100 text-amber-800 border-amber-300 shadow-xs';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      
      {/* Top Banner with Match Score */}
      <div className="p-6 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-sky-800 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {p.category}
              </span>
              <span className="text-xs text-slate-500 font-medium">by {p.insurer}</span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold ml-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{p.rating}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              {p.policy_name}
            </h3>
            
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {p.best_suited_for || p.policy_description}
            </p>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end">
            <div className={`px-3 py-1.5 rounded-2xl bg-gradient-to-r font-extrabold text-sm flex items-center gap-1.5 shadow-md border ${getBadgeStyle(rec.match_percentage)}`}>
              <Sparkles className="w-4 h-4" />
              <span>{rec.match_percentage}% Match</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-medium">Multi-criteria score</span>
          </div>

        </div>

        {/* Pricing and Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Estimated Premium</span>
            <div className="text-base font-extrabold text-slate-900">
              ₹{rec.estimated_premium.toLocaleString()}<span className="text-xs font-normal text-slate-500">/yr</span>
            </div>
            <span className="text-[10px] text-slate-500">~₹{Math.round(rec.estimated_premium / 12).toLocaleString()}/mo</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Claim Ratio (CSR)</span>
            <div className="text-base font-extrabold text-teal-700 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              <span>{p.claim_settlement_ratio}%</span>
            </div>
            <span className="text-[10px] text-slate-500">Settled claims</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Sum Insured</span>
            <div className="text-base font-extrabold text-slate-900">
              {p.min_sum_insured >= 10000000 ? `₹${p.min_sum_insured / 10000000}Cr` : `₹${p.min_sum_insured / 100000}L`}
              <span className="text-xs font-normal text-slate-500"> to </span>
              {p.max_sum_insured >= 10000000 ? `₹${p.max_sum_insured / 10000000}Cr` : `₹${p.max_sum_insured / 100000}L`}
            </div>
            <span className="text-[10px] text-slate-500">Coverage span</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Waiting Period</span>
            <div className="text-base font-extrabold text-slate-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{p.waiting_period_months} mo</span>
            </div>
            <span className="text-[10px] text-slate-500">Pre-existing PED</span>
          </div>

        </div>

        {/* Explainability Section: Why Recommended */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Why This Policy is Recommended for You</span>
          </div>
          <div className="space-y-1.5">
            {rec.why_recommended.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Expanded Details Drawer */}
      {expanded && (
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-700 space-y-4 animate-fade-in">
          
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5">Key Inclusions & Benefits:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {featuresList.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {exclusionsList.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-1.5 text-red-700">Important Exclusions:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {exclusionsList.map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-slate-600">
            <div><span className="font-semibold text-slate-900">Room Rent: </span>{p.room_rent_limit}</div>
            <div><span className="font-semibold text-slate-900">Co-pay: </span>{p.copay_percentage > 0 ? `${p.copay_percentage}%` : 'Zero Co-payment'}</div>
            <div><span className="font-semibold text-slate-900">Cashless Network: </span>{p.network_hospitals_or_garages > 0 ? `${p.network_hospitals_or_garages.toLocaleString()}+ partners` : 'Direct Cashless'}</div>
          </div>

        </div>
      )}

      {/* Card Action Footer */}
      <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-slate-600 hover:text-sky-600 flex items-center gap-1 transition-colors"
        >
          <span>{expanded ? 'Hide Details' : 'View Full Details'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2">
          
          <button
            onClick={() => onAskAI && onAskAI(p)}
            title="Ask AI questions about this specific policy"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-sky-600" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => onToggleCompare && onToggleCompare(p.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isCompared
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'In Compare ✓' : 'Add to Compare'}</span>
          </button>

        </div>

      </div>

    </div>
  );
}
