import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Calculator, 
  MessageSquare, 
  History, 
  User, 
  LogOut,
  Compass
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  compareList = [], 
  currentUser, 
  onOpenAuth, 
  onLogout 
}) {
  const navItems = [
    { id: 'landing', label: 'Explore', icon: Compass },
    { id: 'recommender', label: 'Recommendations', icon: Sparkles, badge: 'AI' },
    { id: 'compare', label: 'Compare', icon: Scale, count: compareList.length },
    { id: 'estimator', label: 'Premium Estimator', icon: Calculator },
    { id: 'chat', label: 'AI Advisor', icon: MessageSquare },
    { id: 'dashboard', label: 'Dashboard', icon: History }
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-100/95 via-blue-50/90 to-sky-100/95 backdrop-blur-md border-b-2 border-sky-500 text-slate-800 shadow-md shadow-sky-400/20 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* FAR LEFT CORNER: PolicyPilot AI Brand Logo */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            title="PolicyPilot Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-base tracking-tight leading-none text-slate-900">
                <span className="group-hover:text-sky-600 transition-colors">PolicyPilot</span>
                <span className="bg-sky-50 text-sky-700 border border-sky-200 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
                Intelligent Insurance Matcher
              </p>
            </div>
          </div>

          {/* CENTER: Navigation Menu Tabs (Light theme pills) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-sky-100/90 text-sky-800 border border-sky-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap tracking-tight">{item.label}</span>
                  {item.badge && (
                    <span className="bg-sky-200/90 text-sky-900 border border-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-sky-200/90 text-sky-900 border border-sky-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* FAR RIGHT CORNER: User Auth / Sign In Section (Light theme) */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-white/90 border border-sky-200 rounded-2xl px-3 py-1.5 shadow-xs hover:border-sky-400 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs">
                  {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left max-w-[130px] sm:max-w-[170px]">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight tracking-tight">
                    {currentUser.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile / Tablet scrollable nav bar (Light theme) */}
      <div className="lg:hidden flex items-center gap-1.5 border-t border-sky-300 py-2 px-3 bg-gradient-to-r from-sky-50 via-blue-50 to-sky-100 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-sky-100/90 text-sky-800 border border-sky-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 bg-white/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="bg-sky-200 text-sky-900 border border-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
