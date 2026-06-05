import React, { useState, useEffect } from "react";
import { Bus, MapPin, X, Navigation, Users, RefreshCw } from "lucide-react";
import { BusLocation, AppLanguage, TRANSLATIONS } from "../types";

const OCCUPANCY_TRANSLATIONS: Record<AppLanguage, {
  high: string;
  medium: string;
  low: string;
  waiting: string;
  people: string;
  toggleLabel: string;
  toggleDesc: string;
}> = {
  zh: {
    high: "擁擠",
    medium: "普通",
    low: "舒適",
    waiting: "等候人數",
    people: "人",
    toggleLabel: "顯示即時站牌與擁擠度",
    toggleDesc: "偵測各站點等候乘客數，自動計算候車舒適度"
  },
  en: {
    high: "Crowded",
    medium: "Moderate",
    low: "Clear",
    waiting: "Waiting",
    people: "people",
    toggleLabel: "Show Live Stops & Occupancy",
    toggleDesc: "Track waiting passengers to calculate wait-time comfort"
  },
  th: {
    high: "หนาแน่น",
    medium: "ปานกลาง",
    low: "โล่ง",
    waiting: "คนรอ",
    people: "คน",
    toggleLabel: "แสดงป้ายรถและระดับความหนาแน่น",
    toggleDesc: "ติดตามผู้โดยสารที่รอเพื่อคำนวณความสบายในการคอยรถ"
  },
  vi: {
    high: "Đông đúc",
    medium: "Vừa phải",
    low: "Thông thoáng",
    waiting: "Đang đợi",
    people: "người",
    toggleLabel: "Hiện điểm dừng & Độ ùn tắc",
    toggleDesc: "Theo dõi lượng hành khách chờ để tính độ thoải mái"
  },
  hakka: {
    high: "當擁擠",
    medium: "普通",
    low: "足舒適",
    waiting: "等候人數",
    people: "人",
    toggleLabel: "顯現即時站牌同擁擠度",
    toggleDesc: "偵測各站點等候人客仔，自動算計等車舒適度"
  },
  ja: {
    high: "大変混雑",
    medium: "普通",
    low: "快適",
    waiting: "待ち人数",
    people: "人",
    toggleLabel: "リアルタイム停留所と混雑度を表示",
    toggleDesc: "各停留所の乗客数を検出し、自動的に待ち時間の快適度を計算します"
  },
  ko: {
    high: "매우 혼잡",
    medium: "보통",
    low: "쾌적",
    waiting: "대기 인원",
    people: "명",
    toggleLabel: "실시간 노선 정류장 및 혼잡도 검색",
    toggleDesc: "각 정류장별 대기 인원을 센서링하여 탑승 쾌적도를 자동으로 산출합니다"
  }
};

interface MapsModalProps {
  language: AppLanguage;
  onClose: () => void;
}

export default function MapsModal({ language, onClose }: MapsModalProps) {
  const t = TRANSLATIONS[language];
  const ot = OCCUPANCY_TRANSLATIONS[language] || OCCUPANCY_TRANSLATIONS.zh;
  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("清華大學");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBusStops, setShowBusStops] = useState(true);
  const [stopOccupancies, setStopOccupancies] = useState<Record<string, number>>({
    "新竹火車站": 18,
    "東門市場": 7,
    "清華大學": 22,
    "交通大學": 12,
    "新莊車站": 4,
    "高鐵新竹站": 29
  });

  const stations = ["新竹火車站", "東門市場", "清華大學", "交通大學", "新莊車站", "高鐵新竹站"];

  const fetchBusStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/bus-status");
      if (response.ok) {
        const data = await response.json();
        setBuses(data);
      }
      
      // Update each station's waiting crowd counts with slight updates over time to look extremely "live"
      setStopOccupancies((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          next[key] = Math.max(1, next[key] + change);
        });
        return next;
      });
    } catch (err) {
      console.error("Failed to load map bus coordinates:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusStatus();
    const interval = setInterval(fetchBusStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getOccupancyInfo = (stationName: string) => {
    const count = stopOccupancies[stationName] || 0;
    let level: "low" | "medium" | "high" = "low";
    let color = "bg-green-500 text-green-700 border-green-200 ring-green-100";
    let textColor = "text-green-700";
    let bgClass = "bg-green-50";
    
    if (count >= 20) {
      level = "high";
      color = "bg-red-500 text-red-700 border-red-200 ring-red-100";
      textColor = "text-red-700";
      bgClass = "bg-red-50";
    } else if (count >= 8) {
      level = "medium";
      color = "bg-amber-500 text-amber-700 border-amber-200 ring-amber-100";
      textColor = "text-amber-700";
      bgClass = "bg-amber-50";
    }
    
    return { count, level, color, textColor, bgClass };
  };

  // Compute mock ETA based on current bus position (lat is 0-100)
  const getEtaForStation = (stationName: string, busRoute: string, dir: string) => {
    const stationIndex = stations.indexOf(stationName);
    if (stationIndex === -1) return "5";

    // Approximate target position (e.g. Tsing Hua is near 33%)
    const targetPercentage = (stationIndex / (stations.length - 1)) * 100;

    // Find nearest bus heading that direction
    const matchingBuses = buses.filter((b) => b.direction.includes(dir));
    if (matchingBuses.length === 0) return "8";

    // Find the one closest but before the stop
    let minDiff = 999;
    let bestEta = 5;

    matchingBuses.forEach((b) => {
      // If heading UP (towards HSR), bus lat increases. It is "before" the stop if b.lat < targetPercentage
      // If heading DOWN (towards station), bus lat decreases. It is "before" if b.lat > targetPercentage
      if (dir === "往 高鐵新竹站") {
        if (b.lat <= targetPercentage) {
          const diff = targetPercentage - b.lat;
          if (diff < minDiff) {
            minDiff = diff;
            bestEta = Math.max(1, Math.round(diff * 0.3));
          }
        } else {
          // Wrapped around or passed, next bus coming
          const diff = 100 - b.lat + targetPercentage;
          if (diff < minDiff) {
            minDiff = diff;
            bestEta = Math.max(1, Math.round(diff * 0.3));
          }
        }
      } else {
        // DOWN direction
        if (b.lat >= targetPercentage) {
          const diff = b.lat - targetPercentage;
          if (diff < minDiff) {
            minDiff = diff;
            bestEta = Math.max(1, Math.round(diff * 0.3));
          }
        } else {
          const diff = b.lat + (100 - targetPercentage);
          if (diff < minDiff) {
            minDiff = diff;
            bestEta = Math.max(1, Math.round(diff * 0.3));
          }
        }
      }
    });

    return bestEta;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-255">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 animate-bounce" />
            <span className="font-bold text-lg">{t.viewMap} (182 Corridor)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBusStatus}
              className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${isRefreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 text-yellow-800 text-xs text-center border-b border-yellow-100 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span><b>即時行車監控：</b>公車座標每 5 秒隨機模擬移動，點選路線圓圈可看預估到站！</span>
        </div>

        {/* Map Stage Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 min-h-[300px]">
          
          {/* Toggle Control Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center gap-3">
              <div className="text-left">
                <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-blue-600 animate-pulse" />
                  {ot.toggleLabel}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                  {ot.toggleDesc}
                </span>
              </div>
              
              {/* Switch Style Toggle */}
              <button
                type="button"
                id="toggle-live-stops-occupancy"
                onClick={() => setShowBusStops(!showBusStops)}
                className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 shrink-0 relative ${
                  showBusStops ? "bg-blue-600" : "bg-slate-350"
                }`}
              >
                <div 
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    showBusStops ? "translate-x-5" : "translate-x-0"
                  }`} 
                />
              </button>
            </div>

            {/* Occupancy Legend Panel */}
            {showBusStops && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold gap-2">
                <span className="text-slate-400 shrink-0">擁擠度:</span>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    {ot.low} (&lt;8{ot.people})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {ot.medium} (8-19{ot.people})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    {ot.high} (&gt;=20{ot.people})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Symmetrical Visual Train Path */}
          <div className="relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest mb-4">路線行經地圖及即時站距點</h4>
            
            <div className="relative pl-6 py-1">
              {/* Core Vertical Railway Spine */}
              <div className="absolute left-[40px] top-6 bottom-6 w-1 bg-blue-100 rounded-full" />
              <div className="absolute left-[40px] top-6 bottom-6 w-1 bg-gradient-to-b from-blue-700 via-blue-400 to-indigo-800 rounded-full transition-all" />
 
              {/* Station Dot Nodes */}
              <div className="space-y-8">
                {stations.map((st, i) => {
                  const percent = (i / (stations.length - 1)) * 100;
                  const isSelected = selectedStation === st;
                  
                  // Find buses close to this target index
                  const busesNearby = buses.filter((b) => {
                    const stopIndex = b.currentStopIndex;
                    return stopIndex === i;
                  });

                  return (
                    <div 
                      key={st}
                      onClick={() => setSelectedStation(st)}
                      className={`flex items-start gap-4 cursor-pointer group select-none relative ${isSelected ? "opacity-100" : "opacity-85 hover:opacity-100"}`}
                    >
                      {/* Left Node */}
                      <div className="relative shrink-0 w-[32px] flex items-center justify-center">
                        {showBusStops ? (
                          <div 
                            className={`w-7 h-7 rounded-xl flex items-center justify-center z-10 relative transition-all duration-300 border shadow-sm ${
                              isSelected 
                                ? "bg-blue-600 border-white text-white scale-110 shadow-md ring-4 ring-blue-200" 
                                : `bg-white ${getOccupancyInfo(st).color.split(" ")[2]} text-blue-650 border-2`
                            }`}
                            title={`${st}: ${getOccupancyInfo(st).count} ${ot.people}`}
                          >
                            <Bus className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-blue-600"}`} />
                            
                            {/* Tiny real-time occupant status status lights inside the stop node! */}
                            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm ${
                              getOccupancyInfo(st).level === "high" ? "bg-red-500 animate-pulse" : getOccupancyInfo(st).level === "medium" ? "bg-amber-500" : "bg-green-500"
                            }`} />
                          </div>
                        ) : (
                          <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center z-10 relative transition-all duration-300 ${
                            isSelected ? "bg-blue-600 border-white scale-110 shadow-md ring-4 ring-blue-200" : "bg-white border-blue-400 group-hover:border-blue-600"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-blue-350"}`} />
                          </div>
                        )}
                      </div>
 
                      {/* Station Info Text */}
                      <div className="flex-1 -mt-0.5 text-left">
                        <div className="flex justify-between items-center flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-bold transition-colors ${isSelected ? "text-blue-700" : "text-slate-700 group-hover:text-blue-500"}`}>
                              {st}
                            </span>
                            
                            {/* Live Bus Stop Occupancy Status Indicator Tag */}
                            {showBusStops && (() => {
                              const occ = getOccupancyInfo(st);
                              return (
                                <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${occ.bgClass} ${occ.textColor} border-slate-200/60`}>
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{occ.count}{ot.people} ({ot[occ.level]})</span>
                                </span>
                              );
                            })()}
                          </div>
                          
                          {/* Buses in this station stop block */}
                          <div className="flex gap-1">
                            {busesNearby.map((bus) => (
                              <span 
                                key={bus.id} 
                                className={`text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold animate-pulse flex items-center gap-0.5 ${
                                  bus.id.includes("UP") ? "bg-blue-600" : "bg-indigo-600"
                                }`}
                              >
                                <Bus className="w-2.5 h-2.5" />
                                182 ({bus.id.includes("UP") ? "上行" : "下行"})
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-[11px] text-slate-400">
                          {i === 0 ? "起點站 • 新竹轉運接駁" : i === stations.length - 1 ? "終點站 • 高鐵竹北站轉乘" : `第 ${i+1} 站`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
 
          {/* Time Predictor for Selected Station */}
          {selectedStation && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-center w-full gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500 animate-bounce" />
                  <span className="font-bold text-slate-800 text-base">{selectedStation} 預估即時公車到站</span>
                </div>
                {showBusStops && (() => {
                  const occ = getOccupancyInfo(selectedStation);
                  return (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border ${occ.bgClass} ${occ.textColor} border-slate-200 shrink-0`}>
                      <Users className="w-3 h-3" />
                      <span>{occ.count}{ot.people} • {ot[occ.level]}</span>
                    </span>
                  );
                })()}
              </div>
 
              <div className="grid grid-cols-2 gap-3 text-left">
                {/* UP direction 182 */}
                <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-1 right-2 opacity-10">
                    <Bus className="w-12 h-12 text-blue-800" />
                  </div>
                  <span className="text-[11px] bg-blue-600 text-white rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">往 高鐵</span>
                  <div className="mt-2.5">
                    <span className="text-2xl font-black text-blue-700 font-mono">
                      {getEtaForStation(selectedStation, "182", "往 高鐵新竹站")}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold ml-1">{t.minLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>座位充裕 (Plentiful)</span>
                  </div>
                </div>
 
                {/* DOWN direction 182 */}
                <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-1 right-2 opacity-10">
                    <Bus className="w-12 h-12 text-indigo-800" />
                  </div>
                  <span className="text-[11px] bg-indigo-600 text-white rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">往 火車站</span>
                  <div className="mt-2.5">
                    <span className="text-2xl font-black text-indigo-700 font-mono">
                      {getEtaForStation(selectedStation, "182", "往 新竹火車站")}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold ml-1">{t.minLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-indigo-700">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>位置一般 (Fair)</span>
                  </div>
                </div>
              </div>
 
              <div className="text-center">
                <button
                  onClick={() => setSelectedStation("")}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  清除選定，返回總覽
                </button>
              </div>
            </div>
          )}
 
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 text-center shrink-0 border-t border-slate-200">
          <p className="text-xs text-slate-400">目前實時在線 2 輛 182 路公車與 1 輛環狀綠線接駁車</p>
        </div>

      </div>
    </div>
  );
}
