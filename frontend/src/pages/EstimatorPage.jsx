import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Heart, 
  Clock, 
  Car, 
  Plane, 
  PiggyBank, 
  CheckCircle2, 
  TrendingUp, 
  Info,
  Sliders,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { getPremiumEstimate } from '../api/client';

const CONDITIONS = [
  'Diabetes',
  'Hypertension / High BP',
  'Asthma',
  'Cardiac history'
];

export default function EstimatorPage({ setActiveTab }) {
  const [category, setCategory] = useState('health');
  const [age, setAge] = useState(30);
  const [sumInsured, setSumInsured] = useState(1000000); // 10 Lakhs
  const [smoker, setSmoker] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [cityTier, setCityTier] = useState('Tier 1');

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounced live calculation whenever inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateEstimate();
    }, 150);
    return () => clearTimeout(timer);
  }, [category, age, sumInsured, smoker, selectedConditions, cityTier]);

  const calculateEstimate = async () => {
    setLoading(true);
    try {
      const res = await getPremiumEstimate({
        category,
        age: Number(age),
        sum_insured: Number(sumInsured),
        smoker,
        pre_existing_conditions: selectedConditions,
        city_tier: cityTier
      });
      setEstimate(res);
    } catch (err) {
      console.error('Estimate failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = (c) => {
    if (selectedConditions.includes(c)) {
      setSelectedConditions(selectedConditions.filter(item => item !== c));
    } else {
      setSelectedConditions([...selectedConditions, c]);
    }
  };

  const formatSumInsured = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Crore`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)} Lakhs`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen ombre-page-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border border-sky-300 p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-800 text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5 text-sky-600" />
            <span>Actuarial Premium Estimator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Insurance Cost Calculator
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Test how age, tobacco status, sum insured non-linear scaling, and pre-existing medical conditions directly impact your annual and monthly insurance premium outlays.
          </p>
        </div>

        {/* Main 2-Column Calculator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Insurance Category</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'health', label: 'Health' },
                  { id: 'term', label: 'Term' },
                  { id: 'life', label: 'Life' },
                  { id: 'motor', label: 'Motor' },
                  { id: 'travel', label: 'Travel' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      category === item.id
                        ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Live Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">Age of Applicant</label>
                <span className="text-sm font-extrabold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-lg border border-sky-300">
                  {age} Years Old
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={75}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>18 (Young Adult)</span>
                <span>45 (Mid-Career)</span>
                <span>75 (Senior Citizen)</span>
              </div>
            </div>

            {/* Sum Insured Live Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">Sum Insured (Coverage Amount)</label>
                <span className="text-sm font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {formatSumInsured(sumInsured)}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={20000000}
                step={100000}
                value={sumInsured}
                onChange={(e) => setSumInsured(Number(e.target.value))}
                className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹1 Lakh</span>
                <span>₹50 Lakhs</span>
                <span>₹2 Crores</span>
              </div>
            </div>

            {/* Smoker Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Tobacco / Nicotine Usage</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSmoker(false)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                    !smoker
                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-slate-900">Non-Smoker</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Preferred base underwriting tier</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSmoker(true)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                    smoker
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-slate-900">Smoker</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">+25% to +45% mortality loading</div>
                </button>
              </div>
            </div>

            {/* Conditions Chips */}
            {category === 'health' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Pre-Existing Conditions Disclosed</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => {
                    const active = selectedConditions.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCondition(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          active
                            ? 'bg-sky-100 border-sky-400 text-sky-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {c} {active ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* City Tier */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">City Healthcare Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {['Tier 1', 'Tier 2', 'Tier 3'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setCityTier(tier)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      cityTier === tier
                        ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tier} {tier === 'Tier 1' ? '(Metro)' : ''}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Real-time Calculation Result Column (5 Cols - Light Blue Ombre) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-sky-100/90 via-blue-50/80 to-sky-100/90 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-sky-300 relative overflow-hidden">
              
              <div className="relative z-10">
                <span className="text-[11px] font-black text-sky-800 uppercase tracking-widest block mb-1">
                  Live Actuarial Estimate
                </span>

                <div className="mt-3">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    ₹{estimate ? estimate.annual_estimate.toLocaleString() : '---'}
                    <span className="text-sm font-semibold text-slate-500">/year</span>
                  </div>
                  <div className="text-sm text-sky-700 font-bold mt-1">
                    ~₹{estimate ? estimate.monthly_estimate.toLocaleString() : '---'}/month outlay
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-2xl bg-white/90 border border-slate-200/90 text-xs text-slate-600 flex items-center justify-between shadow-2xs">
                  <span>Market Variance Band:</span>
                  <span className="font-extrabold text-slate-900">
                    ₹{estimate ? estimate.range_min.toLocaleString() : '--'} - ₹{estimate ? estimate.range_max.toLocaleString() : '--'}
                  </span>
                </div>

                {/* Risk Factors Breakdown */}
                <div className="mt-6 pt-5 border-t border-slate-200/90 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Category Benchmark:</span>
                    <span className="text-slate-900 font-bold">₹{estimate?.base_rate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Age Loading Factor:</span>
                    <span className="text-slate-900 font-bold">{estimate?.age_loading_factor}x</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tobacco Multiplier:</span>
                    <span className="text-slate-900 font-bold">{estimate?.smoker_loading_factor}x</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pre-Existing Condition Loading:</span>
                    <span className="text-slate-900 font-bold">{estimate?.health_risk_loading_factor}x</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>City Healthcare Index:</span>
                    <span className="text-slate-900 font-bold">{estimate?.city_factor}x</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('recommender')}
                  className="w-full mt-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Find Plans Matching This Budget</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Actuarial Notes Card */}
            {estimate?.breakdown_notes && estimate.breakdown_notes.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-xs text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  <span>Actuarial Calculation Explanations</span>
                </h4>
                {estimate.breakdown_notes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
