import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Compass, Map, User, Sparkles } from 'lucide-react';

export const BottomNav = () => {
  const { userTab, setUserTab, setIsAIGeneratorOpen } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/90 md:hidden pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.06)] select-none">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        
        {/* 1. Trang chủ */}
        <button
          onClick={() => setUserTab('home')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors cursor-pointer ${
            userTab === 'home' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${userTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] font-bold tracking-tight">Trang chủ</span>
        </button>

        {/* 2. Khám phá */}
        <button
          onClick={() => setUserTab('explore')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors cursor-pointer ${
            userTab === 'explore' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Compass className={`w-5 h-5 ${userTab === 'explore' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] font-bold tracking-tight">Khám phá</span>
        </button>

        {/* 3. AI Planner (Stitch Orange Icon Pod) */}
        <button
          onClick={() => {
            setUserTab('ai-planner');
            setIsAIGeneratorOpen(true);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-center shadow-md shadow-orange-600/30 group-active:scale-95 transition-transform">
            <Sparkles className="w-6 h-6 fill-white text-white" />
          </div>
          <span className="text-[11px] font-extrabold text-orange-600 tracking-tight">
            AI Planner
          </span>
        </button>

        {/* 4. Lịch trình */}
        <button
          onClick={() => setUserTab('itineraries')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors cursor-pointer ${
            userTab === 'itineraries' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Map className={`w-5 h-5 ${userTab === 'itineraries' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] font-bold tracking-tight">Lịch trình</span>
        </button>

        {/* 5. Cá nhân */}
        <button
          onClick={() => setUserTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors cursor-pointer ${
            userTab === 'profile' ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <User className={`w-5 h-5 ${userTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] font-bold tracking-tight">Cá nhân</span>
        </button>

      </div>
    </nav>
  );
};
