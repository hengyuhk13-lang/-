import React from "react";
import { Bike, Train, ArrowUpRight, CheckCircle, ExternalLink, Activity, Info } from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";

interface TransferTabProps {
  language: AppLanguage;
}

export default function TransferTab({ language }: TransferTabProps) {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6">
      
      {/* YouBike Status */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-green-100 p-2 rounded-xl text-green-700">
              <Bike className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-slate-800 text-sm">{t.ubikeStation}</h3>
              <p className="text-[10px] text-slate-400">目前鄰近市府廣場左側 (Next to plaza)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-750 rounded-lg text-[10px] font-black uppercase tracking-wide">
            {t.liveSlots}
          </span>
        </div>

        {/* Dynamic counters */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-dashed border-slate-200">
          <div className="text-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-2xl font-black text-blue-700 font-mono">14</span>
            <span className="text-[11px] text-slate-500 font-bold">
              {t.canBorrow}
            </span>
          </div>
          <div className="text-center p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-2xl font-black text-slate-700 font-mono">22</span>
            <span className="text-[11px] text-slate-500 font-bold">
              {t.canReturn}
            </span>
          </div>
        </div>

        <a 
          href="https://www.youbike.com.tw/region/main/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center text-blue-600 hover:text-blue-700 text-xs font-bold gap-1 py-1"
        >
          {t.openOfficial}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* TRA and HSR Status Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-500 tracking-wider uppercase pl-1 text-left">雙鐵轉乘即時車次</h3>
        
        <div className="grid grid-cols-2 gap-3">
          
          {/* TRA Card */}
          <a
            href="https://www.railway.gov.tw/tra-tip-web/tip"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all text-left relative group"
          >
            <div className="absolute top-3 right-3 text-slate-300 group-hover:text-blue-500 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <div className="bg-slate-100 text-blue-600 p-2 rounded-xl w-fit mb-3">
                <Train className="w-4.5 h-4.5" />
              </div>
              <h5 className="font-extrabold text-slate-800 text-sm">{t.traHsinchu}</h5>
              <p className="text-[10px] text-green-600 font-black flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5 fill-green-100" />
                {t.traStatus}
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-blue-600 hover:underline">
              {t.viewSchedule}
            </span>
          </a>

          {/* HSR Card */}
          <a
            href="https://www.thsrc.com.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-red-400 transition-all text-left relative group"
          >
            <div className="absolute top-3 right-3 text-slate-300 group-hover:text-red-500 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <div className="bg-slate-100 text-red-600 p-2 rounded-xl w-fit mb-3">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <h5 className="font-extrabold text-slate-800 text-sm">{t.hsrLiujia}</h5>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                {t.hsrStatus}
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-red-600 hover:underline">
              {t.bookTicket}
            </span>
          </a>

        </div>
      </div>

      {/* Live Transit Advisories */}
      <div className="bg-blue-50/50 border border-blue-200/50 p-4.5 rounded-2xl text-left space-y-2">
        <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          雙鐵通勤指南 Info
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          台鐵新竹站往返高鐵六家站，可搭乘<b>六家線支線火車</b>（每 30 分鐘一班，車程約 20 分鐘），或搭乘<b>182 路快捷公車</b>（光復路走廊骨幹，往高鐵最便捷）。
        </p>
      </div>

    </div>
  );
}
