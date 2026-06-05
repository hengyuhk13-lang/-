import React, { useState, useEffect } from "react";
import { 
  Home, 
  Shuffle, 
  Gift, 
  Users, 
  Settings, 
  QrCode, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Bot, 
  Sparkles, 
  X,
  Navigation,
  ExternalLink
} from "lucide-react";

// Modular sub-components
import { AppLanguage, TRANSLATIONS } from "./types";
import HomeTab from "./components/HomeTab";
import TransferTab from "./components/TransferTab";
import RewardsTab from "./components/RewardsTab";
import SocialTab from "./components/SocialTab";
import SettingsTab from "./components/SettingsTab";

// Modals
import AiAssistant from "./components/AiAssistant";
import MapsModal from "./components/MapsModal";
import ScannerModal from "./components/ScannerModal";
import LeaderboardModal from "./components/LeaderboardModal";
import ProfileModal from "./components/ProfileModal";

export default function App() {
  // Offline-fallback persistent parameters
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("windy_lang");
    return (saved as AppLanguage) || "zh";
  });

  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem("windy_points");
    return saved ? parseInt(saved) : 1240;
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem("windy_font_size");
    return saved ? parseInt(saved) : 14;
  });

  // User Profile Customization states
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("windy_user_name") || "王小明 (Wang)";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("windy_user_email") || "hengyu.hk13@nycu.edu.tw";
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem("windy_user_avatar") || "https://lh3.googleusercontent.com/aida/AP1WRLusNKp1tK-zkIPtJzCCfrHOKOCHqKkMs4dgFos7rSKCa7jM4CJyfpcuwAIuo9uOxDBnRiV8diG-v1v_RKJ7MXLOutBe8Z3BpzsyfPo8A8WPryOGaTeLPNtRv9F3YZu-lsdc76C2zWRJwM5XGjKlIc1hhQ42APeqJ7R0bE4m0dlzvz5HFGu76Idtir-dcMFy7Cu8LISnIBPbPDTpDd-x28GnvU_sY4Tw1msaE8hdkFCYYa3QfOdBy_E4LSk";
  });
  const [userLevel, setUserLevel] = useState<string>(() => {
    return localStorage.getItem("windy_user_level") || "大學生 • 風城等級 12";
  });

  const [activeTab, setActiveTab] = useState<"home" | "transfer" | "rewards" | "social" | "settings">("home");

  // Dialog triggers
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Attraction detail trigger
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);

  // Synced savings
  useEffect(() => {
    localStorage.setItem("windy_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("windy_points", points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem("windy_font_size", fontSize.toString());
  }, [fontSize]);

  // Sync profile edits
  useEffect(() => {
    localStorage.setItem("windy_user_name", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("windy_user_email", userEmail);
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem("windy_user_avatar", userAvatar);
  }, [userAvatar]);

  useEffect(() => {
    localStorage.setItem("windy_user_level", userLevel);
  }, [userLevel]);

  const t = TRANSLATIONS[language];

  // Point triggers
  const handleSpendPoints = (amount: number) => {
    setPoints((prev) => Math.max(0, prev - amount));
  };

  const handleAddPoints = (amount: number) => {
    setPoints((prev) => prev + amount);
  };

  const currentEmail = userEmail;

  return (
    <div 
      className="min-h-screen flex flex-col bg-slate-50 relative pb-28 text-slate-900"
      style={{ fontSize: `${fontSize}px` }}
    >
      
      {/* Top Navigation Bar Header */}
      <header className="bg-white/90 backdrop-blur-md flex justify-between items-center px-4 h-16 w-full z-40 sticky top-0 border-b border-slate-200/50 shadow-sm shrink-0">
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 text-left hover:opacity-85 active:scale-98 transition-all cursor-pointer border-none bg-transparent p-0 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm shrink-0">
            <img 
              alt={`${userName} profile`} 
              className="w-full h-full object-cover" 
              src={userAvatar}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-xs text-slate-800 leading-tight flex items-center gap-1.5">
              {userName}
              <span className="text-[8px] font-normal text-blue-500 bg-blue-50 px-1 py-0.5 rounded-sm shrink-0">點此編輯</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">{userLevel}</span>
          </div>
        </button>

        {/* Climate Details Right widget */}
        <a 
          href="https://www.cwa.gov.tw/V8/C/W/County/County.html?CountyID=10018" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-end hover:opacity-85 transition-opacity"
        >
          <div className="flex items-center gap-1.5 text-blue-600 font-extrabold text-xs">
            <div className="flex items-center gap-0.5">
              <Thermometer className="w-4 h-4 text-blue-600" />
              <span>24°C</span>
            </div>
            <div className="flex items-center gap-0.5">
              <CloudRain className="w-4 h-4 text-slate-400" />
              <span>30%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-red-600 animate-pulse mt-0.5">
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black">{t.windAlert}</span>
          </div>
        </a>
      </header>

      {/* Main Tab Screen workspace with margins */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 shrink-0 overflow-x-hidden">
        {activeTab === "home" && (
          <HomeTab 
            language={language} 
            onOpenMap={() => setIsMapOpen(true)}
            onOpenAi={() => setIsAiOpen(true)}
            onOpenAttraction={(type) => setSelectedAttraction(type)}
          />
        )}

        {activeTab === "transfer" && (
          <TransferTab 
            language={language}
          />
        )}

        {activeTab === "rewards" && (
          <RewardsTab 
            language={language}
            points={points}
            onSpendPoints={handleSpendPoints}
          />
        )}

        {activeTab === "social" && (
          <SocialTab 
            language={language}
            points={points}
            onAddPoints={handleAddPoints}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            userEmail={userEmail}
            userName={userName}
            userAvatar={userAvatar}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab 
            language={language}
            onLanguageChange={setLanguage}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            onOpenProfile={() => setIsProfileOpen(true)}
            points={points}
            onRestoreData={(restored) => {
              if (restored.userName) setUserName(restored.userName);
              if (restored.userEmail) setUserEmail(restored.userEmail);
              if (restored.points !== undefined) setPoints(restored.points);
            }}
          />
        )}
      </main>

      {/* Floating Action Button for QR Scanner */}
      <button 
        id="trigger-fab-scanner-btn"
        onClick={() => setIsScannerOpen(true)}
        className="fixed right-6 bottom-24 w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-700 text-white rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-30 ring-4 ring-white/80"
        title={t.scanTitle}
      >
        <QrCode className="w-7 h-7" />
      </button>

      {/* Floating Bot help badge above the FAB for extra guidance */}
      <button
        id="trigger-floating-gpt-btn"
        onClick={() => setIsAiOpen(true)}
        className="fixed right-6 bottom-40 w-10 h-10 bg-indigo-650 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30 border border-indigo-500 animate-bounce"
        title={t.helperTitle}
      >
        <Bot className="w-5 h-5" />
      </button>

      {/* Bottom Navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-20 bg-white/95 backdrop-blur-md border-t border-slate-200/50 px-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="w-full max-w-md mx-auto flex">
          
          {/* Home */}
          <button 
            id="nav-home-tab-btn"
            onClick={() => setActiveTab("home")}
            className={`flex-1 flex flex-col items-center justify-center h-16 rounded-xl transition-all ${
              activeTab === "home" ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-500"
            }`}
          >
            <Home className="w-5.5 h-5.5" />
            <span className="text-[10px] sm:text-[11px] mt-1">{t.bottomHome}</span>
          </button>

          {/* Transfer */}
          <button 
            id="nav-transfer-tab-btn"
            onClick={() => setActiveTab("transfer")}
            className={`flex-1 flex flex-col items-center justify-center h-16 rounded-xl transition-all ${
              activeTab === "transfer" ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-500"
            }`}
          >
            <Shuffle className="w-5.5 h-5.5" />
            <span className="text-[10px] sm:text-[11px] mt-1">{t.bottomTransfer}</span>
          </button>

          {/* Rewards */}
          <button 
            id="nav-rewards-tab-btn"
            onClick={() => setActiveTab("rewards")}
            className={`flex-1 flex flex-col items-center justify-center h-16 rounded-xl transition-all ${
              activeTab === "rewards" ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-500"
            }`}
          >
            <Gift className="w-5.5 h-5.5" />
            <span className="text-[10px] sm:text-[11px] mt-1">{t.bottomRewards}</span>
          </button>

          {/* Social */}
          <button 
            id="nav-social-tab-btn"
            onClick={() => setActiveTab("social")}
            className={`flex-1 flex flex-col items-center justify-center h-16 rounded-xl transition-all ${
              activeTab === "social" ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-500"
            }`}
          >
            <Users className="w-5.5 h-5.5" />
            <span className="text-[10px] sm:text-[11px] mt-1">{t.bottomSocial}</span>
          </button>

          {/* Settings */}
          <button 
            id="nav-settings-tab-btn"
            onClick={() => setActiveTab("settings")}
            className={`flex-1 flex flex-col items-center justify-center h-16 rounded-xl transition-all ${
              activeTab === "settings" ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-500"
            }`}
          >
            <Settings className="w-5.5 h-5.5" />
            <span className="text-[10px] sm:text-[11px] mt-1">{t.bottomSettings}</span>
          </button>

        </div>
      </nav>

      {/* --- MODALS OVERLAY DIALOG CONTROLLER --- */}

      {/* Map modal tracker */}
      {isMapOpen && (
        <MapsModal 
          language={language}
          onClose={() => setIsMapOpen(false)}
        />
      )}

      {/* Simulated Scanner camera overlay */}
      {isScannerOpen && (
        <ScannerModal 
          language={language}
          onClose={() => setIsScannerOpen(false)}
          onReward={handleAddPoints}
        />
      )}

      {/* Conversational Gemini helper helper */}
      {isAiOpen && (
        <AiAssistant 
          language={language}
          onClose={() => setIsAiOpen(false)}
        />
      )}

      {/* Weekly Commuter Leaderboards popup */}
      {isLeaderboardOpen && (
        <LeaderboardModal 
          language={language}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* Profile Editing Modal popup */}
      {isProfileOpen && (
        <ProfileModal
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          userLevel={userLevel}
          onSave={(name, email, avatar, level) => {
            setUserName(name);
            setUserEmail(email);
            setUserAvatar(avatar);
            setUserLevel(level);
            setIsProfileOpen(false);
          }}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Attractions selection Modal trigger popup */}
      {selectedAttraction && (() => {
        const ATTRACTION_DATA: Record<string, { title: string; img: string; desc: React.ReactNode }> = {
          temple: {
            title: t.attractionTemple || "新竹都城隍廟",
            img: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=500&q=80",
            desc: (
              <>
                <p>新竹都城隍廟創建於清乾隆十三年（1748年），是全台官位最高的城隍廟，也是極具指標意義的市定古蹟。</p>
                <p>廟口周圍更有全台知名的美食攤位群（城隍廟小吃），包含熱騰騰的<b>新竹貢丸湯、特製紅糟肉圓、米粉、潤餅與冬瓜茶</b>，不容錯過！</p>
              </>
            )
          },
          harbor: {
            title: t.attractionHarbor || "南寮漁港 (17km)",
            img: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=500&q=80",
            desc: (
              <>
                <p>南寮漁港原名新竹漁港，近年來結合地中海藍白希臘風情造景、著名的<b>十七公里海岸線自行車道</b>與大草原，轉型為超人氣踏青景點。</p>
                <p>您可以於此處放風箏、租借鐵馬、觀賞絢麗的「海岸線絕美夕陽」、探索熱門的<b>魚鱗天梯鐘樓</b>。回程亦可去海產中心大啖肥美秋蟹與海鮮！</p>
              </>
            )
          },
          zoo: {
            title: "新竹市立動物園 (Hsinchu Zoo)",
            img: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=500&q=80",
            desc: (
              <>
                <p>新竹市立動物園創立於1936年，是全台灣現存最老的動物園。經過「再生計畫」改造，打破水泥鐵籠藩籬，打造類自然棲地環境。</p>
                <p>非常適合合家觀賞可愛的河馬樂樂、孟加拉虎、北美浣熊與長臂猿。周邊緊鄰新竹公園與週末假日花市，搭乘新竹市區公車即可直達！</p>
              </>
            )
          },
          water: {
            title: "青草湖生態風景區 (Green Grass Lake)",
            img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80",
            desc: (
              <>
                <p>青草湖曾為新竹八景之一，四周林木茂密，湖畔環境清幽。引進了全新<b>立式划槳 (SUP)、天鵝船與環湖生態步道</b>，重現浪漫水岸風華。</p>
                <p>橫跨湖心的映月橋直通于飛島，是情侶散步、賞鳥的絕佳約會勝地。交通推薦搭乘 71 路公車於清幽中享受山水綠意。</p>
              </>
            )
          },
          bigcity: {
            title: "Big City 巨城購物中心",
            img: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80",
            desc: (
              <>
                <p>巨城購物中心為北台灣最大的超大型百貨商場，融合零售、影城、溜冰場、保齡球館與熱門美食街，是新竹市民最愛的萬能娛樂中心！</p>
                <p>商場內提供便捷的<b>免費接駁公車</b>直達新竹火車站，低碳又省時。搭乘綠線、5608班車亦可輕鬆往返。</p>
              </>
            )
          },
          museum: {
            title: "玻璃工藝博物館與麗池公園",
            img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80",
            desc: (
              <>
                <p>新竹素有「台灣玻璃之鄉」美譽。玻璃工藝博物館結合了日本昭和皇族行館與現代美學，展示精緻璀璨的吹玻璃大師藝術品。</p>
                <p>漫步於外圍的麗池日式九曲橋木棧道，落櫻繽紛時期美不勝收。搭乘 182路、2路、藍線皆可一網打盡！</p>
              </>
            )
          }
        };

        const activeAttraction = ATTRACTION_DATA[selectedAttraction] || ATTRACTION_DATA.temple;

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
              
              <div className="h-48 relative shrink-0">
                <img 
                  src={activeAttraction.img} 
                  alt={activeAttraction.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedAttraction(null)} 
                  className="absolute top-4.5 right-4.5 bg-black/40 hover:bg-black/60 rounded-full p-1.5 text-white shadow-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 text-left space-y-4">
                <h3 className="text-sm font-black text-blue-700">
                  {activeAttraction.title}
                </h3>
                
                <div className="text-[11px] text-slate-500 leading-relaxed font-semibold space-y-2">
                  {activeAttraction.desc}
                </div>

                {/* Guidance shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedAttraction(null);
                      setIsMapOpen(true);
                    }}
                    className="py-2 px-3 bg-blue-105 hover:bg-blue-200 text-blue-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4 text-blue-600" />
                    引導去這裡
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAttraction(null);
                      setIsAiOpen(true);
                    }}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Bot className="w-4 h-4" />
                    問問 AI 助理
                  </button>
                </div>

                <button
                  onClick={() => setSelectedAttraction(null)}
                  className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl text-center active:scale-95 transition-transform"
                >
                  關閉 (Close)
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
