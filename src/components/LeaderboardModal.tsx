import React from "react";
import { Trophy, X } from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";

interface LeaderboardModalProps {
  language: AppLanguage;
  onClose: () => void;
}

export default function LeaderboardModal({ language, onClose }: LeaderboardModalProps) {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h3 className="font-bold text-slate-800 text-lg">{t.leaderboardWeekly}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Leaderboard content */}
        <div className="space-y-3">
          
          {/* Rank 1 */}
          <div className="flex items-center gap-4 p-3 bg-green-50 rounded-2xl border border-green-200 shadow-sm">
            <span className="font-bold text-green-700 w-6 text-center text-lg">1</span>
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
                alt="李大華" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="flex-1 font-bold text-slate-800">李大華 (Hsinchu commuter)</span>
            <span className="font-bold text-green-700 font-mono">22.4h</span>
          </div>

          {/* Rank 2 */}
          <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span className="font-bold text-slate-500 w-6 text-center text-lg">2</span>
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" 
                alt="陳美美" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="flex-1 text-slate-700 font-medium">陳美美</span>
            <span className="text-slate-600 font-mono">18.1h</span>
          </div>

          {/* Rank 3 - Currently user (王小明) */}
          <div className="flex items-center gap-4 p-3 bg-blue-50 border-2 border-blue-500 rounded-2xl shadow-sm">
            <span className="font-bold text-blue-700 w-6 text-center text-lg">3</span>
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden shrink-0 shadow-inner">
              <img 
                src="https://lh3.googleusercontent.com/aida/AP1WRLusNKp1tK-zkIPtJzCCfrHOKOCHqKkMs4dgFos7rSKCa7jM4CJyfpcuwAIuo9uOxDBnRiV8diG-v1v_RKJ7MXLOutBe8Z3BpzsyfPo8A8WPryOGaTeLPNtRv9F3YZu-lsdc76C2zWRJwM5XGjKlIc1hhQ42APeqJ7R0bE4m0dlzvz5HFGu76Idtir-dcMFy7Cu8LISnIBPbPDTpDd-x28GnvU_sY4Tw1msaE8hdkFCYYa3QfOdBy_E4LSk" 
                alt="王小明" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="flex-1 font-bold text-blue-900">王小明 (Wang) <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-light">您</span></span>
            <span className="font-bold text-blue-700 font-mono">14.5h</span>
          </div>

        </div>

        {/* Banner guidance code */}
        <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-400 text-center leading-relaxed">
          每當使用風城通規劃路線、租借 YouBike、搭乘公車時，手機背景會記錄綠色運輸通勤時數。加油！本週通勤再 3.6 小時奪回第二名！
        </div>

        {/* Footer close button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
        >
          關閉
        </button>

      </div>
    </div>
  );
}
