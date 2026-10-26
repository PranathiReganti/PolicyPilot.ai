import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  User, 
  Heart, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  Sliders,
  DollarSign,
  Scale
} from 'lucide-react';
import { getRecommendations } from '../api/client';
import PolicyCard from '../components/PolicyCard';

const PRE_EXISTING_OPTIONS = [
  'Diabetes',
  'Hypertension / High BP',
  'Asthma / Respiratory',
  'Cardiac / Heart Ailments',
  'Thyroid',
  'None'
];

const CITIES = [
  'Mumbai',
  'Bengaluru',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Other'
];

export default function RecommenderPage({ 
  compareList = [], 
  onToggleCompare, 
  onAskAI,
  setActiveTab 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendationsData, setRecommendationsData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    age: 32,
    gender: 'male',
    city: 'Mumbai',
    annual_income: 1200000,
    dependents: 1,
    smoker: false,
    pre_existing_conditions: ['Hypertension / High BP'],
    budget_annual: 22000,
    insurance_type: 'health',
    coverage_priority: 'balanced'
  });

  const handleConditionToggle = (cond) => {
    let current = [...formData.pre_existing_conditions];
    if (cond === 'None') {
      current = ['None'];
    } else {
      current = current.filter(c => c !== 'None');
      if (current.includes(cond)) {
        current = current.filter(c => c !== cond);
      } else {
        current.push(cond);
      }
    }
    setFormData({ ...formData, pre_existing_conditions: current });
  };

  const loadDemoProfile = (type = 'health_family') => {
    if (type === 'health_family') {
      setFormData({
        age: 34,
        gender: 'female',
        city: 'Bengaluru',
        annual_income: 1500000,
        dependents: 2,
        smoker: false,
        pre_existing_conditions: ['None'],
        budget_annual: 25000,
        insurance_type: 'health',
        coverage_priority: 'maximum_coverage'
      });
    } else if (type === 'senior_cardiac') {
      setFormData({
        age: 62,
        gender: 'male',
        city: 'Delhi NCR',
        annual_income: 900000,
        dependents: 1,
        smoker: false,
        pre_existing_conditions: ['Diabetes', 'Cardiac / Heart Ailments'],
        budget_annual: 35000,
        insurance_type: 'health',
        coverage_priority: 'critical_illness'
      });
    } else {
      setFormData({
        age: 29,
        gender: 'male',
        city: 'Mumbai',
        annual_income: 1800000,
        dependents: 2,
        smoker: false,
        pre_existing_conditions: ['None'],
        budget_annual: 15000,
        insurance_type: 'term',
        coverage_priority: 'claim_settlement'
      });
    }
    setError('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.age || formData.age < 18 || formData.age > 100) {
        setError('Please enter a valid age between 18 and 100.');
        return;
      }
      if (!formData.city) {
        setError('Please specify your residential city.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.annual_income || formData.annual_income < 100000) {
        setError('Please enter annual income of at least ₹1,00,000.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.budget_annual || formData.budget_annual < 1000) {
      setError('Please specify an annual budget of at least ₹1,000.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        age: Number(formData.age),
        gender: formData.gender,
        city: formData.city,
        annual_income: Number(formData.annual_income),
        dependents: Number(formData.dependents),
        smoker: Boolean(formData.smoker),
        pre_existing_conditions: formData.pre_existing_conditions,
        budget_annual: Number(formData.budget_annual),
        insurance_type: formData.insurance_type,
        coverage_priority: formData.coverage_priority
      };

      const result = await getRecommendations(payload);
      setRecommendationsData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ombre-page-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Results View */}
        {recommendationsData ? (
          <div className="space-y-8 animate-fade-in">
            
            {/* Results Header */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-800 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Analysis Complete</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Top 5 Ranked Policy Recommendations
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Multi-criteria scored across coverage match, affordability, claim settlement ratio, and waiting period fitness.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setRecommendationsData(null);
                      setStep(1);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Modify Profile</span>
                  </button>

                  {compareList.length >= 2 && (
                    <button
                      onClick={() => setActiveTab('compare')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Compare ({compareList.length}) Selected</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Summary Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-4 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Evaluated Profile:</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Age: {formData.age} yrs</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">City: {formData.city}</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Category: {formData.insurance_type.toUpperCase()}</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Budget: ₹{formData.budget_annual.toLocaleString()}/yr</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Smoker: {formData.smoker ? 'Yes' : 'No'}</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Priority: {formData.coverage_priority}</span>
              </div>
            </div>

            {/* List of Recommendation Cards */}
            <div className="space-y-6">
              {recommendationsData.recommendations.map((rec) => (
                <PolicyCard
                  key={rec.policy.id}
                  rec={rec}
                  isCompared={compareList.includes(rec.policy.id)}
                  onToggleCompare={onToggleCompare}
                  onAskAI={onAskAI}
                />
              ))}
            </div>

            {/* Disclaimer footer */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Regulatory Disclaimer: </strong>
                {recommendationsData.disclaimer || "Informational only, not financial advice. Rates and terms subject to insurer underwriting."}
              </span>
            </div>

          </div>
        ) : (
          /* Multi-Step Profile Form */
          <div className="bg-white rounded-3xl border border-sky-300 shadow-sm overflow-hidden animate-fade-in">
            
            {/* Form Header (Light Blue Ombre) */}
            <div className="bg-gradient-to-r from-sky-100/90 via-blue-50/80 to-sky-100/90 border-b border-sky-200 p-6 sm:p-8 text-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold">
                      Recommendation Engine
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Step {step} of 3</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Personalized Insurance Matchmaker
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Fill out your profile to discover policies ranked by content match, affordability, and claim ratios.
                  </p>
                </div>

                {/* Quick Demo Pre-fill buttons (Light theme) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">1-Click Demo:</span>
                  <button
                    type="button"
                    onClick={() => loadDemoProfile('health_family')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors"
                  >
                    Family Health (34y)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemoProfile('senior_cardiac')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors"
                  >
                    Senior Cardiac (62y)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemoProfile('term_pure')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors"
                  >
                    Term Life (29y)
                  </button>
                </div>
              </div>

              {/* Step Progress Bar (Light theme) */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                {[
                  { s: 1, title: 'Demographics' },
                  { s: 2, title: 'Health & Lifestyle' },
                  { s: 3, title: 'Goals & Budget' }
                ].map((item) => (
                  <div key={item.s} className="flex flex-col gap-1.5">
                    <div className={`h-2 rounded-full transition-all ${
                      step >= item.s ? 'bg-teal-500' : 'bg-slate-200'
                    }`} />
                    <span className={`text-[11px] font-bold ${
                      step >= item.s ? 'text-teal-700' : 'text-slate-400'
                    }`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="m-6 mb-0 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Body */}
            <div className="p-6 sm:p-8">
              
              {/* STEP 1: Personal & Demographics */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">Age of Insured (Years)</label>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Must be between 18 and 100</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['male', 'female', 'other'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: g })}
                            className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                              formData.gender === g
                                ? 'bg-sky-100/90 border-sky-400 text-sky-800 font-bold shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">Residential City / Region</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Tier-1 Metros have dedicated room rent schedules</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">Number of Financial Dependents</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={formData.dependents}
                        onChange={(e) => setFormData({ ...formData, dependents: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Spouse, children, or elderly parents</span>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 2: Health, Lifestyle & Income */}
              {step === 2 && (
                <div className="space-y-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">Annual Household Income (INR)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        step={50000}
                        min={100000}
                        value={formData.annual_income}
                        onChange={(e) => setFormData({ ...formData, annual_income: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Used to assess recommended sum insured safety margins</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">Tobacco / Nicotine Usage</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, smoker: false })}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                          !formData.smoker
                            ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-slate-900">Non-Smoker</div>
                        <div className="text-[10px] text-slate-500 font-normal">Eligible for up to 35% lower term/health premiums</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, smoker: true })}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                          formData.smoker
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-slate-900">Smoker / Tobacco User</div>
                        <div className="text-[10px] text-slate-500 font-normal">Standard actuarial risk loading applied</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Pre-Existing Medical Conditions (Multi-select)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRE_EXISTING_OPTIONS.map((cond) => {
                        const isSelected = formData.pre_existing_conditions.includes(cond);
                        return (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => handleConditionToggle(cond)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-sky-100/90 border-sky-400 text-sky-800 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{cond}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      Selecting conditions activates intelligent waiting-period matching.
                    </span>
                  </div>

                </div>
              )}

              {/* STEP 3: Goals & Budget */}
              {step === 3 && (
                <div className="space-y-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">Insurance Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'health', label: 'Health' },
                        { id: 'term', label: 'Term Life' },
                        { id: 'life', label: 'Savings/Life' },
                        { id: 'motor', label: 'Motor Auto' },
                        { id: 'travel', label: 'Travel' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, insurance_type: item.id })}
                          className={`py-3 rounded-xl text-xs font-bold border transition-all text-center ${
                            formData.insurance_type === item.id
                              ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">Target Annual Budget (INR)</label>
                      <span className="text-sm font-extrabold text-sky-700">₹{formData.budget_annual.toLocaleString()}/yr</span>
                    </div>
                    <input
                      type="range"
                      min={2000}
                      max={75000}
                      step={1000}
                      value={formData.budget_annual}
                      onChange={(e) => setFormData({ ...formData, budget_annual: Number(e.target.value) })}
                      className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>₹2,000 (Low Cost)</span>
                      <span>₹25,000 (Standard)</span>
                      <span>₹75,000+ (High Cover)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">Coverage Priority Focus</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'balanced', label: 'Balanced Fit', desc: 'Even multi-attribute balance' },
                        { id: 'budget', label: 'Lowest Cost', desc: 'Affordability & high value' },
                        { id: 'claim_settlement', label: 'Highest Claim Ratio', desc: 'Focus on 98%+ settlement' },
                        { id: 'maximum_coverage', label: 'Maximum Protection', desc: 'Restoration, 2X, zero deductibles' },
                        { id: 'critical_illness', label: 'Chronic & Critical Care', desc: 'Cardiac, cancer, low PED wait' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, coverage_priority: p.id })}
                          className={`p-3 rounded-2xl text-xs border text-left transition-all ${
                            formData.coverage_priority === p.id
                              ? 'bg-sky-100/90 border-sky-400 text-sky-800 font-bold shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-extrabold text-slate-900">{p.label}</div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5">{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setStep(step - 1);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                  >
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating 44+ Policies...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Top 5 Recommendations</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
