import React, { useState, useEffect, useRef } from "react";
import { Bus, MapPin, Users, Sparkles, Navigation, RefreshCw, Wind, Volume2, Flame } from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";

interface HsinchuMiniMapProps {
  language: AppLanguage;
  onOpenMap: () => void;
}

export default function HsinchuMiniMap({ language, onOpenMap }: HsinchuMiniMapProps) {
  const t = TRANSLATIONS[language];
  const [activeStop, setActiveStop] = useState<string>("清華大學");
  const [busPosition, setBusPosition] = useState<number>(38); // percentage along the route (0 - 100)
  const [busSpeed, setBusSpeed] = useState<number>(1); // 1 = normal, 2 = fast, 3 = super fast
  const [honkBubble, setHonkBubble] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [windActive, setWindActive] = useState(false);
  
  // Simulated dynamic ETA values for stops
  const [etas, setEtas] = useState<Record<string, number>>({
    "新竹火車站": 12,
    "東門市場": 9,
    "清華大學": 3,
    "交通大學": 6,
    "新莊車站": 14,
    "高鐵新竹站": 22
  });

  const STATIONS = ["新竹火車站", "東門市場", "清華大學", "交通大學", "新莊車站", "高鐵新竹站"];
  
  const STATION_MAPPINGS: Record<string, { desc: string; ubike: number; food: string }> = {
    "新竹火車站": { desc: "百年巴洛克古蹟車站，轉乘台鐵及站前商圈", ubike: 15, food: "阿忠冰店、粉澌肉圓" },
    "東門市場": { desc: "文青夜市基地，雲集各國創意美食與音樂餐酒館", ubike: 8, food: "享平方、網美拉麵、烤生蠔" },
    "清華大學": { desc: "大客流文教樞紐，光復路美食與清大夜市核心", ubike: 22, food: "小籠包、立晉豆花、蔥大爺餅" },
    "交通大學": { desc: "科技人才搖籃，直通新竹科學園區 (HSP)", ubike: 12, food: "交大鬆餅屋、小木屋鬆餅" },
    "新莊車站": { desc: "關埔重劃區核心，直捷新莊車站台鐵轉乘", ubike: 6, food: "關新路網美咖啡、星巴克" },
    "高鐵新竹站": { desc: "六家雙鐵共構，往返南北與園區接駁核心", ubike: 29, food: "高鐵便當、一風堂拉麵" }
  };

  // Infinitely drive the bus and update ETAs automatically
  useEffect(() => {
    const timer = setInterval(() => {
      // Update bus progress along route
      setBusPosition((prev) => {
        const next = prev + 0.8 * busSpeed;
        return next > 98 ? 2 : next;
      });

      // Fluctuate ETAs randomly to feel alive
      setEtas((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          next[key] = Math.max(1, next[key] + change);
        });
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [busSpeed]);

  // Occasional random Hsinchu wind gusts blowing by
  useEffect(() => {
    const windTimer = setInterval(() => {
      setWindActive(true);
      setTimeout(() => setWindActive(false), 3000);
    }, 8500);
    return () => clearInterval(windTimer);
  }, []);

  const handleHonk = () => {
    const sounds = ["叭叭！比比！", "HORN!! BB-BA!", "BEEP BEEP!", "九降風警告叭叭！", "公車進站囉！"];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    setHonkBubble(randomSound);
    setTimeout(() => setHonkBubble(null), 1800);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Recalculate ETAs instantly
      setEtas({
        "新竹火車站": Math.floor(Math.random() * 5) + 8,
        "東門市場": Math.floor(Math.random() * 5) + 5,
        "清華大學": Math.floor(Math.random() * 4) + 1,
        "交通大學": Math.floor(Math.random() * 5) + 3,
        "新莊車站": Math.floor(Math.random() * 6) + 11,
        "高鐵新竹站": Math.floor(Math.random() * 8) + 18
      });
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-4">
      
      {/* Header Panel */}
      <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span className="text-xs font-extrabold text-blue-900 tracking-wide uppercase">
            {language === "zh" ? "即時新竹公車動態地圖" : "Hsinchu Live Bus Micro-Map"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 select-none text-xs font-bold text-slate-400">
          <button
            onClick={handleRefresh}
            className="p-1 px-2 rounded-lg bg-white border border-slate-200 flex items-center gap-1 hover:text-blue-600 active:scale-95 transition-all"
            title="Refresh Route GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span className="text-[10px] font-bold">GPS</span>
          </button>
        </div>
      </div>

      {/* INFINITE DRIVING BUS PARALLAX CONTAINER (動畫巴士行駛) */}
      <div className="relative h-32 bg-sky-100/70 border-y border-slate-100 overflow-hidden select-none">
        
        {/* Hsinchu Wind Gust Overlay Lines */}
        {windActive && (
          <div className="absolute inset-x-0 top-6 bottom-6 flex flex-col justify-around pointer-events-none z-10">
            <div className={`w-32 h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded animate-wind-line-1`} style={{ animation: "windMove 1.5s infinite linear" }} />
            <div className={`w-40 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent rounded animate-wind-line-2 ml-10`} style={{ animation: "windMove 1.2s infinite linear" }} />
            <div className={`w-28 h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded animate-wind-line-3 ml-24`} style={{ animation: "windMove 1.8s infinite linear" }} />
          </div>
        )}

        {/* Clouds drift back layer */}
        <div className="absolute top-3 left-6 text-slate-250 animate-bounce duration-1000 opacity-60">
          <div className="w-12 h-4 bg-white rounded-full relative" />
        </div>
        <div className="absolute top-2 right-12 text-slate-200 opacity-50">
          <div className="w-16 h-5 bg-white rounded-full" />
        </div>

        {/* Hsinchu Giant Windmills & Hills (Nanliao Vibe) */}
        <div className="absolute bottom-6 right-8 flex flex-col items-center">
          {/* Symmetrical Windmill blades */}
          <div 
            className="w-10 h-10 border-2 border-slate-300 rounded-full flex items-center justify-center relative origin-center"
            style={{ 
              animation: `spin ${6 / busSpeed}s infinite linear`,
            }}
          >
            <div className="absolute w-full h-[1px] bg-slate-300" />
            <div className="absolute w-[1px] h-full bg-slate-300" />
          </div>
          {/* Windmill tower */}
          <div className="w-1 bg-slate-300 h-9 rounded-t" />
        </div>

        {/* Mini NTHU Gate landmark */}
        <div className="absolute bottom-6 left-12 flex flex-col items-center opacity-70">
          <div className="w-10 h-4 bg-slate-300 rounded-t-md text-[6px] text-center font-bold text-slate-600 border border-slate-400">NTHU</div>
          <div className="w-12 h-1 bg-slate-400" />
        </div>

        {/* Ground and Road */}
        <div className="absolute bottom-0 inset-x-0 h-7 bg-slate-700 border-t border-slate-800 flex items-center">
          <div className="w-full border-t border-dashed border-white/40 h-0" />
        </div>

        {/* Moving Lane Markers/Streetlights details */}
        <div className="absolute bottom-7 left-1/4 w-3 h-0.5 bg-yellow-400 opacity-30" />
        <div className="absolute bottom-7 left-3/4 w-3 h-0.5 bg-yellow-400 opacity-30" />

        {/* Wind status banner */}
        {windActive && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-600/80 backdrop-blur-xs text-[9px] text-white px-2 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1 z-10 shadow">
            <Wind className="w-3 h-3 text-white" />
            <span>九降風瞬間陣風起！GUST VIBRATION!</span>
          </div>
        )}

        {/* HONK Speech bubble */}
        {honkBubble && (
          <div 
            className="absolute bottom-16 left-[28%] bg-yellow-350 border-2 border-yellow-500 text-slate-900 font-extrabold text-[10px] px-3 py-1.5 rounded-2xl shadow-md z-15 animate-in zoom-in-75 duration-100 after:content-[''] after:absolute after:bottom-[-6px] after:left-4 after:border-t-2 after:border-r-2 after:border-yellow-500 after:bg-yellow-350 after:w-2.5 after:h-2.5 after:rotate-45"
          >
            {honkBubble}
          </div>
        )}

        {/* DRIVING BUS SPRITE (動畫巴士本體) */}
        <div 
          className="absolute z-10 bottom-4 left-[20%] flex flex-col items-center transition-transform duration-300"
          style={{
            transform: `translateY(${windActive ? (Math.random() > 0.5 ? "1.5px" : "-1.5px") : "0px"})`,
            animation: `driveBounce ${0.4 / busSpeed}s infinite alternate ease-in-out`
          }}
        >
          {/* Bus Box container */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 border-2 border-slate-800 rounded-xl w-24 h-12 relative flex items-center justify-between px-2 text-white shadow-md">
            {/* Passenger silhouettes inside windows */}
            <div className="absolute top-1 inset-x-2 flex justify-between gap-1 h-3">
              <div className="bg-slate-800 rounded-xs w-4 h-full flex items-center justify-center opacity-80">
                <span className="text-[5px] text-yellow-300">👤</span>
              </div>
              <div className="bg-slate-800 rounded-xs w-4 h-full flex items-center justify-center opacity-80">
                <span className="text-[5px] text-green-300">👤</span>
              </div>
              <div className="bg-slate-850 rounded-xs w-4 h-full flex items-center justify-center opacity-80">
                <span className="text-[5px] text-white">👤</span>
              </div>
              <div className="bg-slate-800 rounded-xs w-3 h-full overflow-hidden opacity-90">
                <div className="text-[4px] bg-blue-600 text-center font-bold text-white scale-75">182</div>
              </div>
            </div>

            {/* Front windshield & driver */}
            <div className="bg-slate-800 w-3 h-6 rounded-tr-md self-start mt-1 absolute right-1.5 flex items-center justify-center">
              <span className="text-[6px] animate-pulse">🕶️</span>
            </div>

            {/* Side Branding label */}
            <div className="absolute bottom-2 left-2 flex flex-col text-[7px] font-black leading-none opacity-90">
              <span className="text-white">WINDY 182-A</span>
              <span className="text-[5px] text-yellow-200">客滿 (Plentiful)</span>
            </div>

            {/* Bus Lights */}
            <div className="absolute right-0.5 bottom-3.5 w-1.5 h-1.5 bg-yellow-300 rounded-r-xs animate-pulse" />
            <div className="absolute left-0.5 bottom-3.5 w-1 h-1.5 bg-red-500 rounded-l-xs" />
          </div>

          {/* Active rolling wheels */}
          <div className="flex justify-around w-18 -mt-1.5">
            <div 
              className="w-3.5 h-3.5 bg-slate-800 rounded-full border border-white border-t-2 items-center justify-center"
              style={{ animation: `spin ${0.5 / busSpeed}s infinite linear` }}
            />
            <div 
              className="w-3.5 h-3.5 bg-slate-800 rounded-full border border-white border-t-2 items-center justify-center"
              style={{ animation: `spin ${0.5 / busSpeed}s infinite linear` }}
            />
          </div>
        </div>

        {/* Dynamic Bus Interactive Cockpit Controls */}
        <div className="absolute bottom-2 right-2 flex gap-1 z-20">
          <button
            onClick={handleHonk}
            className="p-1 px-1.5 bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-slate-900 rounded-lg text-[9px] font-black flex items-center gap-0.5 active:scale-95 transition-all shadow cursor-pointer"
            title="Press Horn"
          >
            <Volume2 className="w-3 h-3" />
            <span>喇叭 Honk</span>
          </button>
          
          <button
            onClick={() => setBusSpeed((prev) => (prev % 3) + 1)}
            className={`p-1 px-1.5 text-white rounded-lg text-[9px] font-black flex items-center gap-0.5 active:scale-95 transition-all shadow cursor-pointer ${
              busSpeed === 3 
                ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                : busSpeed === 2 
                  ? "bg-orange-500 hover:bg-orange-600" 
                  : "bg-blue-600 hover:bg-blue-700"
            }`}
            title="Cyclical speed toggle"
          >
            <Flame className={`w-3 h-3 ${busSpeed > 1 ? "text-yellow-250 animate-bounce" : ""}`} />
            <span>
              {busSpeed === 3 ? "極速 EX!" : busSpeed === 2 ? "加速 High" : "常速 Norm"}
            </span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL ROUTE PATHWAY BUS MAP (即時新竹公車站點地圖) */}
      <div className="p-4 space-y-3">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
          點選以下公車站點可查詢當站詳情，公車圖示代表目前行動定位：
        </span>

        {/* Symmetrical Horizontal Train/Bus Path Line */}
        <div className="relative py-4 px-1.5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
          {/* Main Line Spine */}
          <div className="absolute left-6 right-6 top-[25px] h-1.5 bg-slate-200 rounded-full" />
          <div 
            className="absolute left-6 top-[25px] h-1.5 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(10, busPosition - 4)}%` }}
          />

          {/* Rolling Bus on the GPS Path */}
          <div 
            className="absolute top-[8px] -ml-3.5 transition-all duration-1000 select-none pointer-events-none"
            style={{ left: `${busPosition}%` }}
          >
            <div className="bg-blue-600 text-white rounded-lg p-1 shadow-md border border-white animate-bounce flex items-center justify-center">
              <Bus className="w-3 h-3" />
            </div>
          </div>

          {/* Stations bubble dots */}
          <div className="flex justify-between items-center relative z-5">
            {STATIONS.map((st, idx) => {
              const isSelected = activeStop === st;
              const isPassed = (idx / (STATIONS.length - 1)) * 100 < busPosition;
              
              return (
                <button
                  key={st}
                  onClick={() => setActiveStop(st)}
                  className="flex flex-col items-center group relative cursor-pointer"
                  style={{ width: `${100 / STATIONS.length}%` }}
                >
                  {/* Circle Dot */}
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? "bg-blue-600 border-white ring-4 ring-blue-105 scale-110 shadow-md" 
                        : isPassed 
                          ? "bg-blue-500 border-white text-white"
                          : "bg-white border-slate-300 hover:border-blue-400 text-slate-400"
                    }`}
                  >
                    <span className="text-[8px] font-mono font-black">{idx + 1}</span>
                  </div>

                  {/* Station text shortened */}
                  <span 
                    className={`text-[9px] mt-1.5 font-bold tracking-tighter truncate w-full text-center block ${
                      isSelected ? "text-blue-700 font-extrabold font-mono" : "text-slate-500 group-hover:text-blue-500"
                    }`}
                  >
                    {st.length > 3 ? st.substring(0, 3) + ".." : st}
                  </span>

                  {/* Dynamic Time Countdown Box above target */}
                  <div className="absolute top-[-15px] scale-90 opacity-85">
                    <span className="bg-slate-800 text-white font-mono font-bold text-[8px] px-1 py-0.25 rounded">
                      {etas[st]}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Station Live Detail Sheet Panel */}
        {activeStop && STATION_MAPPINGS[activeStop] && (
          <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1 text-left flex-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-extrabold text-slate-800 text-sm">{activeStop}</span>
                <span className="text-[10px] bg-blue-100 text-blue-750 font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
                  即將抵達: {etas[activeStop]} 分鐘
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                {STATION_MAPPINGS[activeStop].desc}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-extrabold text-[10px]">
                <span className="text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
                  🚴 uBike 空位: {STATION_MAPPINGS[activeStop].ubike} 輛
                </span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                  🍔 熱門美食: {STATION_MAPPINGS[activeStop].food}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenMap}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 font-extrabold text-white text-[11px] rounded-lg shadow-sm text-center active:scale-95 transition-transform flex items-center gap-1 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>乘車精準導航</span>
            </button>
          </div>
        )}
      </div>

      {/* Styled inline custom CSS keyframes */}
      <style>{`
        @keyframes driveBounce {
          from { transform: translateY(0); }
          to { transform: translateY(-3px); }
        }
        @keyframes windMove {
          0% { transform: translateX(-150px) scaleX(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateX(330px) scaleX(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
