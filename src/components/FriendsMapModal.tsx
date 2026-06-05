import React, { useState } from "react";
import { X, MapPin, Search, Users, ShieldAlert, Heart, UserPlus, Compass } from "lucide-react";

interface Friend {
  id: number;
  name: string;
  avatar: string;
  locationName: string;
  x: number; // percentage coordinate x (10 - 90)
  y: number; // percentage coordinate y (10 - 90)
  status: string;
  online: boolean;
  pinged?: boolean;
}

interface FriendsMapModalProps {
  onClose: () => void;
}

export default function FriendsMapModal({ onClose }: FriendsMapModalProps) {
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: 1,
      name: "阿強 (A-Qiang)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      locationName: "清華大學 NTHU",
      x: 35,
      y: 45,
      status: "📚 正在圖書館K書，準備搭 182 到火車站聚餐！",
      online: true
    },
    {
      id: 2,
      name: "小華 (Xiao-Hua)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      locationName: "巨城購物中心 Big City",
      x: 65,
      y: 25,
      status: "🛍️ 巨城週年慶中！車位超滿，建議搭接駁公車過來！",
      online: true
    },
    {
      id: 3,
      name: "林學長 (Senior Lin)",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      locationName: "新竹火車站 Hsinchu Station",
      x: 48,
      y: 75,
      status: "🚂 台鐵剛剛準點抵達！火車站周邊風超級無敵大！",
      online: true
    },
    {
      id: 4,
      name: "美玲 (Mei-Ling)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      locationName: "南寮漁港 (17km)",
      x: 15,
      y: 20,
      status: "🚴 17公里海岸線騎單車吹風中！",
      online: false
    }
  ]);

  const [activeFriendId, setActiveFriendId] = useState<number>(1);
  const [addName, setAddName] = useState("");
  const [addLocation, setAddLocation] = useState("交通大學 NYCU");
  const [successInfo, setSuccessInfo] = useState("");

  const activeFriend = friends.find((f) => f.id === activeFriendId) || friends[0];

  const handlePing = (id: number) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pinged: true, status: "🔋 已向他發起「揪乘車」叮咚提醒！" } : f))
    );
    setTimeout(() => {
      setFriends((prev) =>
        prev.map((f) => (f.id === id ? { ...f, pinged: false } : f))
      );
    }, 4000);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    const coordsArray = [
      { x: 55, y: 55 },
      { x: 75, y: 70 },
      { x: 25, y: 65 }
    ];
    const coords = coordsArray[Math.floor(Math.random() * coordsArray.length)];

    const newFriend: Friend = {
      id: Date.now(),
      name: addName,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      locationName: addLocation,
      x: coords.x,
      y: coords.y,
      status: "✨ 新好友已成功定加入，正在新竹探索低碳通勤！",
      online: true
    };

    setFriends((prev) => [...prev, newFriend]);
    setActiveFriendId(newFriend.id);
    setAddName("");
    setSuccessInfo(`成功加 ${newFriend.name} 為好友並同步其風城雷達！`);
    setTimeout(() => setSuccessInfo(""), 2505);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col text-left max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header Map */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-yellow-305 animate-spin" style={{ animationDuration: "8s" }} />
            <div>
              <span className="font-extrabold text-sm block tracking-wide">風城即時好友雷達 Map</span>
              <span className="text-[9px] text-blue-100">3位好友在線 • 藍芽 GPS 探測已同步</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successInfo && (
          <div className="m-3 p-2 bg-green-50 border border-green-200 text-green-800 text-[11px] font-bold rounded-xl text-center animate-pulse">
            {successInfo}
          </div>
        )}

        {/* MAP CONTAINER CANVAS (TOPOGRAPHY) */}
        <div className="relative h-64 bg-slate-900 border-b border-slate-200/50 overflow-hidden select-none shrink-0 border-y">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          {/* Symmetrical Landmark zones on map backdrop */}
          <div className="absolute top-[25%] left-[20%] text-[8px] text-slate-500 font-extrabold uppercase">南寮碼頭</div>
          <div className="absolute top-[20%] right-[25%] text-[8px] text-slate-500 font-extrabold uppercase">巨城</div>
          <div className="absolute top-[45%] left-[30%] text-[8px] text-slate-500 font-extrabold uppercase font-mono">NTHU</div>
          <div className="absolute top-[60%] left-[60%] text-[8px] text-slate-500 font-extrabold uppercase font-mono">NYCU 交大</div>
          <div className="absolute bottom-[20%] left-[40%] text-[8px] text-slate-500 font-extrabold uppercase">新竹車站</div>

          {/* Connective light trail pathways */}
          <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none">
            {/* Symmetrical path curve loops */}
            <path d="M 15 20 Q 35 45 48 75" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 2" />
            <path d="M 35 45 Q 65 25 48 75" fill="none" stroke="#10b981" strokeWidth="1.5" />
          </svg>

          {/* Active friend pin markers */}
          {friends.map((friend) => {
            const isSelected = friend.id === activeFriendId;
            return (
              <button
                key={friend.id}
                onClick={() => setActiveFriendId(friend.id)}
                className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                  isSelected ? "z-25 scale-110" : "z-15 hover:scale-105"
                }`}
                style={{ left: `${friend.x}%`, top: `${friend.y}%` }}
              >
                <div className="relative flex flex-col items-center">
                  
                  {/* Speech bubble avatar indicator */}
                  <div 
                    className={`relative w-8 h-8 rounded-full border-2 overflow-hidden shadow-md ${
                      isSelected 
                        ? "border-blue-500 ring-4 ring-blue-500/20 shadow-blue-500/30" 
                        : friend.online 
                          ? "border-emerald-500" 
                          : "border-slate-500 grayscale opacity-70"
                    }`}
                  >
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  {/* Pulsing state ring */}
                  {friend.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
                  )}

                  {/* Tiny Name badge beneath */}
                  <div className="mt-1 bg-slate-950/80 backdrop-blur-xs text-[7px] text-white font-extrabold px-1 rounded-sm select-none">
                    {friend.name.split(" ")[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE FRIEND CARD DETAIL PANEL */}
        <div className="p-4 border-b border-slate-150 bg-slate-50/60 shrink-0 select-none">
          <div className="flex gap-3 items-start justify-between">
            <div className="flex gap-2.5 items-center">
              <img 
                src={activeFriend.avatar} 
                alt={activeFriend.name} 
                className={`w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 ${!activeFriend.online ? "grayscale" : ""}`}
                referrerPolicy="no-referrer"
              />
              <div className="text-left shrink-0">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-slate-800 text-xs">{activeFriend.name}</span>
                  <span className={`text-[8px] font-bold px-1 rounded-xs ${activeFriend.online ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                    {activeFriend.online ? "在線 Online" : "離線"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-700 font-bold mt-1">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>位置: {activeFriend.locationName}</span>
                </div>
              </div>
            </div>

            {/* Direct Interaction - Ping sound */}
            {activeFriend.online && (
              <button
                onClick={() => handlePing(activeFriend.id)}
                disabled={activeFriend.pinged}
                className={`p-1.5 px-2.5 text-[10px] font-black rounded-lg shadow-sm border select-none transition-all cursor-pointer ${
                  activeFriend.pinged 
                    ? "bg-slate-200 text-slate-400 border-slate-350"
                    : "bg-gradient-to-tr from-blue-600 to-indigo-650 hover:opacity-90 active:scale-95 text-white border-blue-500"
                }`}
              >
                {activeFriend.pinged ? "已叮咚" : "⚡ 叮咚揪坐車"}
              </button>
            )}
          </div>

          <div className="mt-3 bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 italic">
            {activeFriend.status}
          </div>
        </div>

        {/* PLUS FRIENDS INPUT FORM */}
        <form onSubmit={handleAddFriend} className="p-4 bg-white shrink-0 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">加好友 (藍牙/手機搜尋)</span>
          <div className="flex gap-2.5">
            <input
              type="text"
              required
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="輸入風城通好友 ID/姓名..."
              className="flex-1 text-[11px] p-2 bg-slate-100 border border-slate-200 rounded-lg focus:bg-white"
            />
            <select
              value={addLocation}
              onChange={(e) => setAddLocation(e.target.value)}
              className="text-[11px] bg-slate-100 border border-slate-205 p-2 rounded-lg font-bold text-slate-700"
            >
              <option value="交通大學 NYCU">NYCU 交大</option>
              <option value="清華大學 NTHU">NTHU 清大</option>
              <option value="巨城購物中心 BigCity">巨城 BigCity</option>
              <option value="城隍廟 God Temple">城隍廟</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3 py-2 rounded-lg"
            >
              + 加
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
