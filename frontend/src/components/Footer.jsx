import React from 'react';
import { ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Regulatory Disclaimer Banner (Light theme) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold text-amber-950">Regulatory Disclaimer: </span>
            PolicyPilot AI is an educational and analytical recommendation tool designed for informational purposes only. It does not constitute formal financial, investment, legal, or actuarial advice. All policy premiums, waiting periods, claim settlement metrics, and coverage terms are simulated/benchmark figures based on insurer disclosures and remain subject to individual medical underwriting, age verification, and official policy wordings approved by the Insurance Regulatory and Development Authority of India (IRDAI).
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-slate-900 text-base">PolicyPilot AI</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-4">
              Intelligent multi-criteria insurance policy recommendation platform powered by machine learning, actuarial risk curves, and retrieval-augmented AI advice.
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-700 font-semibold">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>44+ Pre-loaded Policies across Health, Term, Life, Motor & Travel</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('recommender')} className="hover:text-sky-600 transition-colors">
                  Recommendation Engine
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('compare')} className="hover:text-sky-600 transition-colors">
                  Side-by-Side Comparison
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('estimator')} className="hover:text-sky-600 transition-colors">
                  Interactive Premium Estimator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('chat')} className="hover:text-sky-600 transition-colors">
                  AI Advisor Chatbot
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Core Technology</h4>
            <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
              <li>• FastAPI & Python 3.10</li>
              <li>• Scikit-Learn TF-IDF Cosine Matcher</li>
              <li>• Multi-Criteria Actuarial Scoring</li>
              <li>• FAISS / Vector RAG Engine</li>
              <li>• React 19 + Vite + Tailwind CSS</li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PolicyPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-1 font-medium">
            <span>Built with precision for intelligent insurance transparency</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
