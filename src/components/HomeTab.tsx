import React, { useState, useEffect } from "react";
import { 
  Search, 
  Map, 
  ArrowRight, 
  Sparkles, 
  Navigation, 
  Star, 
  Train, 
  Info, 
  Compass, 
  Heart,
  ChevronRight,
  MapPin,
  Clock
} from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";
import HsinchuMiniMap from "./HsinchuMiniMap";

interface HomeTabProps {
  language: AppLanguage;
  onOpenMap: () => void;
  onOpenAi: () => void;
  onOpenAttraction: (type: string) => void;
}

interface BusRoute {
  id: string;
  name: string;
  dest: string;
  eta: number; // in minutes
  seat: string;
  type: string;
}

export default function HomeTab({ 
  language, 
  onOpenMap, 
  onOpenAi, 
  onOpenAttraction 
}: HomeTabProps) {
  const t = TRANSLATIONS[language];

  // Simulated live Hsinchu bus routes dataset
  const ALL_MOCK_BUSES: BusRoute[] = [
    { id: "182", name: "182 路公車", dest: "往 高鐵新竹站 (HSR Station)", eta: 3, seat: "座位充裕", type: "city" },
    { id: "blue", name: "藍線快捷", dest: "往 新竹漁港 (南寮)", eta: 7, seat: "座位充裕", type: "metro" },
    { id: "2", name: "2 路公車", dest: "往 交通大學 (NYCU)", eta: 5, seat: "稍微擁擠", type: "city" },
    { id: "5608", name: "5608 班車", dest: "往 下公館 (客運總站)", eta: 12, seat: "座位充裕", type: "express" },
    { id: "71", name: "71 路公車", dest: "往 莊重路 (環狀線)", eta: 18, seat: "位置適中", type: "branch" },
    { id: "green", name: "綠線快捷", dest: "往 經國路口 (經巨城)", eta: 6, seat: "座位充裕", type: "metro" }
  ];

  // Bus Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("windy_favorites");
      return saved ? JSON.parse(saved) : ["182", "blue"];
    } catch {
      return ["182", "blue"];
    }
  });

  // Transit planner states
  const [plannerFrom, setPlannerFrom] = useState("清華大學 NTHU");
  const [plannerTo, setPlannerTo] = useState("巨城購物中心 Big City");
  const [planResult, setPlanResult] = useState<{
    busOption: string;
    duration: number;
    description: string;
    carbonSaved: number;
  } | null>(null);

  // Save favorites helper
  const toggleFavorite = (routeId: string) => {
    let updated: string[];
    if (favorites.includes(routeId)) {
      updated = favorites.filter((id) => id !== routeId);
    } else {
      updated = [...favorites, routeId];
    }
    setFavorites(updated);
    localStorage.setItem("windy_favorites", JSON.stringify(updated));
  };

  // Route Planning algorithm (From-To lookup)
  const handleCalculateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerFrom || !plannerTo) return;

    if (plannerFrom === plannerTo) {
      setPlanResult({
        busOption: "徒步健走 Eco-Walk",
        duration: 1,
        description: "出發地與目的地相同，散步一下就到囉！空氣品質良好、風力輕拂，建議步行前往。",
        carbonSaved: 0
      });
      return;
    }

    // Custom recommendations
    let busOption = "182 路公車";
    let duration = 15;
    let carbonSaved = 180;
    let description = "於近站牌搭乘市區巴士，班次密集。下車後步行 3 分鐘即可抵達目的！";

    if (plannerFrom.includes("火車站") && plannerTo.includes("高鐵")) {
      busOption = "台鐵六家線區間車 或 182路";
      duration = 20;
      carbonSaved = 250;
      description = "台鐵六家線直達高鐵站最準時，每 30 分鐘一班；也可在火車站前站搭乘 182 公車直達高鐵大廳。";
    } else if (plannerFrom.includes("清華") && plannerTo.includes("巨城")) {
      busOption = "綠線快捷 或 2路轉乘";
      duration = 12;
      carbonSaved = 150;
      description = "在清大門口站牌搭乘綠線，於巨城購物中心站下車即達。假日巨城周邊塞車，公車最聰明！";
    } else if (plannerFrom.includes("南寮") || plannerTo.includes("南寮")) {
      busOption = "藍線快捷市區公車";
      duration = 22;
      carbonSaved = 210;
      description = "往返南寮漁港的最優路線：轉乘藍線快捷公車直往南寮漁港大路。騎著 YouBike 吹風更環保！";
    } else if (plannerFrom.includes("城隍廟") || plannerTo.includes("城隍廟")) {
      busOption = "藍線 或 5608班車";
      duration = 10;
      carbonSaved = 110;
      description = "城隍廟周邊街道狹窄，建議搭乘藍線公車至中央路口，步行 2 分鐘，避免尋找汽車車位煩惱。";
    } else if (plannerFrom.includes("動物園") || plannerTo.includes("動物園")) {
      busOption = "2 路公車 或 71路";
      duration = 8;
      carbonSaved = 90;
      description = "在火車站後站搭乘 2 路公車，於新竹市立動物園站下車，十分方便；下公車可順道逛假日花市。";
    }

    setPlanResult({
      busOption,
      duration,
      description,
      carbonSaved
    });
  };

  // Filtered bus list based on search bar
  const searchedBuses = ALL_MOCK_BUSES.filter((bus) => {
    const q = searchQuery.toLowerCase();
    return (
      bus.id.toLowerCase().includes(q) ||
      bus.name.toLowerCase().includes(q) ||
      bus.dest.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Global AI GPT Assistant Link Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
        </div>
        <input
          onClick={onOpenAi}
          className="w-full h-13 pl-12 pr-12 rounded-2xl border-none bg-slate-100 hover:bg-slate-200 focus:bg-white text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-sm shadow-sm transition-all cursor-pointer"
          placeholder={t.searchPlaceholder || "輸入目的地、公車路線... (AI 智慧導航)"}
          readOnly
          type="text"
        />
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <span className="text-[10px] bg-blue-105 text-blue-700 px-2 py-0.5 rounded-lg font-bold font-mono animate-pulse">
            AI GPT
          </span>
        </div>
      </div>

      {/* Real-time Transit Center (即時通勤狀態) */}
      <div className="space-y-3">
        
        {/* Section Title */}
        <div className="flex justify-between items-end mb-1 px-1">
          <h2 className="text-lg font-extrabold text-blue-700 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-blue-700 rounded-full animate-bounce" />
            {t.commuteTitle}
          </h2>
          <span className="text-[10px] font-mono text-slate-400">
            {t.updateTime || "剛剛已更新 • 3s 前同步"}
          </span>
        </div>

        {/* NEW ADDITION: Bus Route Live Search Input Bar */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5 text-left">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 搜尋特定公車路線 (例如: 182, 藍, 綠, 2)..."
              className="w-full text-xs bg-slate-100 border border-slate-250 p-3 pl-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
          </div>

          {/* FAVOURITE BUS STATS (常用路線 checklist) */}
          {favorites.length > 0 && !searchQuery && (
            <div className="pt-1.5 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                ⭐ 您的常用路線 (My Favorite Routes)
              </span>
              <div className="space-y-2">
                {ALL_MOCK_BUSES.filter(b => favorites.includes(b.id)).map((favBus) => (
                  <div 
                    key={favBus.id}
                    className="flex justify-between items-center p-2.5 bg-yellow-50/50 border border-yellow-200/50 rounded-xl animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleFavorite(favBus.id)}
                        className="text-yellow-500 hover:text-slate-350 p-0.5 shrink-0"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-800">{favBus.name}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">{favBus.dest}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm font-semibold">{favBus.seat}</span>
                      <span className="text-xs font-black text-blue-700 font-mono">{favBus.eta} 分鐘</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH RESULTS CONTAINER */}
          {searchQuery && (
            <div className="pt-2 max-h-52 overflow-y-auto space-y-2">
              <span className="text-[10px] font-black text-blue-600 block">
                搜尋結果 (Found {searchedBuses.length} routes):
              </span>
              {searchedBuses.length > 0 ? (
                searchedBuses.map((bus) => {
                  const isFav = favorites.includes(bus.id);
                  return (
                    <div 
                      key={bus.id}
                      className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(bus.id)}
                          className="p-0.5 hover:scale-105 transition-transform"
                        >
                          <Star className={`w-4 h-4 ${isFav ? "text-yellow-500 fill-current" : "text-slate-300"}`} />
                        </button>
                        <div>
                          <span className="text-xs font-black text-slate-800 block">{bus.name}</span>
                          <span className="text-[10px] text-slate-500">{bus.dest}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-blue-700 block font-mono">{bus.eta} mins</span>
                        <span className="text-[9px] text-slate-400 font-bold">{bus.seat}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-slate-400 italic">無匹配的風城公車路線，可以詢問 AI 或換個關鍵字搜尋喔！</p>
              )}
            </div>
          )}
        </div>

        {/* DEFAULT COMMUTE CARD WITH MAP REDIRECT */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-blue-750 rounded-xl flex flex-col items-center justify-center text-white shadow-inner shrink-0">
                <span className="text-[9px] font-medium tracking-wider uppercase opacity-85">ROUTE</span>
                <span className="text-lg font-black leading-none">182</span>
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-800 text-sm leading-tight">往 高鐵新竹站 (HSR Station)</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-inner" />
                  <span className="text-[10px] text-green-600 font-bold">目前位置: 巨城購物中心站 (座位充裕)</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-blue-700 leading-none mr-0.5 font-mono">
                3
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                分鐘
              </span>
            </div>
          </div>

          <button
            id="open-map-commute-btn"
            onClick={onOpenMap}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-blue-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Map className="w-4 h-4" />
            開啟附近公車即時地圖 (Live Map)
          </button>
        </div>

        {/* Real-time Interactive Hsinchu Bus Map & Animated Bus */}
        <HsinchuMiniMap language={language} onOpenMap={onOpenMap} />
      </div>

      {/* NEW INTERACTIVE ROUTE SEARCH & PLANNING WIDGET (路線搜尋 到哪要搭啥公車) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-left space-y-4">
        
        <div>
          <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
            <Train className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            🚌 風城路線搜尋規劃 (Bus Route Advisor)
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">輸入起迄點，立即推薦零碳排放捷運巴士導航</p>
        </div>

        <form onSubmit={handleCalculateRoute} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500" /> 出發點 (From)
              </span>
              <select
                value={plannerFrom}
                onChange={(e) => setPlannerFrom(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="清華大學 NTHU">清華大學 NTHU</option>
                <option value="新竹火車站 Station">新竹火車站</option>
                <option value="高鐵新竹站 HSR">高鐵新竹站 HSR</option>
                <option value="南寮漁港 Harbor">南寮漁港 Harbor</option>
                <option value="新竹都城隍廟 Temple">新竹都城隍廟</option>
                <option value="新竹市立動物園 Zoo">新竹動物園</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" /> 目的地 (To)
              </span>
              <select
                value={plannerTo}
                onChange={(e) => setPlannerTo(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="巨城購物中心 Big City">巨城購物中心 Big City</option>
                <option value="高鐵新竹站 HSR">高鐵新竹站 HSR</option>
                <option value="新竹火車站 Station">新竹火車站</option>
                <option value="南寮漁港 Harbor">南寮漁港 Harbor</option>
                <option value="新竹都城隍廟 Temple">新竹都城隍廟</option>
                <option value="新竹市立動物園 Zoo">新竹動物園</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer text-center"
          >
            🔍 計算導航路線 (Search Transit Solution)
          </button>
        </form>

        {planResult && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border border-emerald-250 rounded-2xl space-y-2 animate-in slide-in-from-top duration-150">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1">
                ✨ 最佳推薦: {planResult.busOption}
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                立省 {planResult.carbonSaved}g CO₂
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>預估乘車時間: <b>{planResult.duration} 分鐘</b></span>
            </div>

            <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
              💡 {planResult.description}
            </p>
          </div>
        )}

      </div>

      {/* Travel Attractions Section (旅遊景點多一點 - 6 spots) */}
      <div className="space-y-4">
        
        <div className="flex justify-between items-end px-1 mb-1">
          <h2 className="text-lg font-extrabold text-blue-700 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-blue-700 rounded-full" />
            🌸 {t.travelTitle || "風城精選推薦旅遊"}
          </h2>
        </div>

        {/* 6 Beautiful Attractions Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Spot 1:城隍廟 */}
          <div 
            onClick={() => onOpenAttraction("temple")}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="h-36 relative overflow-hidden">
              <img
                alt="新竹都城隍廟"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=500&q=80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-blue-600 w-fit rounded-md mb-1 uppercase">
                  歷史市集
                </span>
                <h4 className="text-white font-extrabold text-sm">{t.attractionTemple || "新竹都城隍廟"}</h4>
              </div>
            </div>
            <div className="p-3 text-left">
              <p className="text-[11px] text-slate-500 line-clamp-1">百年香火鼎盛，廟口傳統米粉貢丸老字號</p>
            </div>
          </div>

          {/* Spot 2:南寮漁港 */}
          <div 
            onClick={() => onOpenAttraction("harbor")}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="h-36 relative overflow-hidden">
              <img
                alt="南寮漁港"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=500&q=80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-teal-600 w-fit rounded-md mb-1 uppercase">
                  鐵馬落日
                </span>
                <h4 className="text-white font-extrabold text-sm">{t.attractionHarbor || "南寮漁港十七公里"}</h4>
              </div>
            </div>
            <div className="p-3 text-left">
              <p className="text-[11px] text-slate-500 line-clamp-1">暢遊海天一線自行車道，魚鱗天梯拍照點</p>
            </div>
          </div>

          {/* Spot 3:新竹市立動物園 */}
          <div 
            onClick={() => onOpenAttraction("zoo")}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="h-36 relative overflow-hidden">
              <img
                alt="新竹動物園"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=500&q=80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-emerald-600 w-fit rounded-md mb-1">
                  最古老園區
                </span>
                <h4 className="text-white font-extrabold text-sm">新竹市立動物園</h4>
              </div>
            </div>
            <div className="p-3 text-left">
              <p className="text-[11px] text-slate-500 line-clamp-1">免水泥籠舍自然棲地，與超萌樂樂河馬見面</p>
            </div>
          </div>

          {/* Spot 4:青草湖風景區 */}
          <div 
            onClick={() => onOpenAttraction("water")}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="h-36 relative overflow-hidden">
              <img
                alt="青草湖"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-indigo-600 w-fit rounded-md mb-1">
                  SUP 立槳
                </span>
                <h4 className="text-white font-extrabold text-sm">青草湖生態風景區</h4>
              </div>
            </div>
            <div className="p-3 text-left">
              <p className="text-[11px] text-slate-500 line-clamp-1">新竹八景，情侶限定天鵝船湖心映月步道</p>
            </div>
          </div>

          {/* Spot 5:巨城購物中心 */}
          <div 
            onClick={() => onOpenAttraction("bigcity")}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="h-36 relative overflow-hidden">
              <img
                alt="巨城購物"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-rose-600 w-fit rounded-md mb-1">
                  美食地標
                </span>
                <h4 className="text-white font-extrabold text-sm">Big City 巨城購物中心</h4>
              </div>
            </div>
            <div className="p-3 text-left">
              <p className="text-[11px] text-slate-500 line-clamp-1">北台灣娛樂旗艦，多條免費低碳公車直達接駁</p>
            </div>
          </div>

          {/* Spot 6: 玻璃工藝博物館 */}
          <div 
            onClick={() => onOpenAttraction("museum")}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="h-36 relative overflow-hidden">
              <img
                alt="麗池玻璃工藝館"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-yellow-600 w-fit rounded-md mb-1">
                  人文美學
                </span>
                <h4 className="text-white font-extrabold text-sm">玻璃工藝館與麗池</h4>
              </div>
            </div>
            <div className="p-3 text-left">
              <p className="text-[11px] text-slate-500 line-clamp-1">欣賞藝術璀璨玻璃與落櫻紛飛的日式木棧步道</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
