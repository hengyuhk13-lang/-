import React, { useState } from "react";
import { Award, ShoppingBag, Landmark, Sparkles, Check, ArrowDownCircle, Ticket, ExternalLink } from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";

interface RewardsTabProps {
  language: AppLanguage;
  points: number;
  onSpendPoints: (amount: number) => void;
}

export default function RewardsTab({ language, points, onSpendPoints }: RewardsTabProps) {
  const t = TRANSLATIONS[language];
  
  // Track claimed reward codes
  const [claimedCodes, setClaimedCodes] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  const items = [
    {
      id: "bigcity_parking",
      name: t.bigCityDiscount || "Big City 巨城購物中心 - 當日停車折抵 1 小時",
      pointsRequired: 100,
      image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80",
      description: "兌換成功後，至巨城 1F 服務台或手機 App 登錄，折抵 1 小時汽車停車費。點選造訪查看最新巨城優惠。",
      officialUrl: "https://www.febigcity.com/bigcity"
    },
    {
      id: "pudding_cake",
      name: t.cakeDiscount || "春上布丁蛋糕 - 任選蛋糕 9 折",
      pointsRequired: 350,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
      description: "新竹最火紅排隊布丁蛋糕！出示條碼或序號結帳即享 9 折。限新竹站前/竹北店使用及網購預購。",
      officialUrl: "https://www.chunsun-cake.com/?srsltid=AfmBOorYnEDd27a6eovk8HJ_BDx5MqBq-m2hZbzr-0SY1BNWDZ7a3yfJ"
    },
    {
      id: "hairei_balls",
      name: language === "en" ? "Hairei Meatballs - 15% discount for combo" : language === "ja" ? "海瑞ビーフンと肉団子 - 15%割引" : language === "ko" ? "하어레이 미트볼 - 15% 단독 할인" : "海瑞貢丸 - 經典雙享餐自取享 85 折起",
      pointsRequired: 200,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
      description: "新竹傳承一甲子手工摃丸！憑此券至新竹海瑞貢丸總店消費即享 15% 折抵優惠，純肉Q彈香醇！",
      officialUrl: "https://www.hairei.com.tw/zh-TW"
    }
  ];

  const handleClaim = (itemId: string, cost: number) => {
    if (points < cost) {
      setErrorMsg("您的點數不足兑換此商品喔！多做低碳捷運或掃碼通勤累積 50 Pts 吧！");
      setTimeout(() => setErrorMsg(""), 3500);
      return;
    }

    onSpendPoints(cost);
    
    // Generate simulated tracking code
    const secureCode = `WS-${Math.floor(100000 + Math.random() * 900000)}`;
    setClaimedCodes((prev) => ({
      ...prev,
      [itemId]: secureCode
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Point Balance Statement Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-20px] text-white opacity-10">
          <Award className="w-40 h-40" />
        </div>
        <div className="relative z-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-200">綠色通勤積點帳戶 (Green Points)</span>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse fill-yellow-300" />
          </div>
          <p className="text-3xl font-black font-mono flex items-baseline gap-1">
            {points.toLocaleString()}
            <span className="text-sm font-bold text-blue-100"> Pts</span>
          </p>
          <div className="flex gap-2 text-[11px] text-blue-200 pt-1 font-medium">
            <span>• 每日通勤安全簽到或挑戰 Traffic Quiz 可續杯點數！</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-2xl text-center shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* Item Shelf list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-extrabold text-slate-800 text-base">{t.pointsExchange}</h3>
          <span className="text-xs text-slate-400 font-bold font-mono">3 Active Deals</span>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const isClaimed = !!claimedCodes[item.id];
            
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-28 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                    <h4 className="text-white font-extrabold text-sm text-left line-clamp-1">{item.name}</h4>
                  </div>
                </div>

                <div className="p-4 space-y-3 bg-white text-left">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  <div className="pt-1 select-none">
                    <a
                      href={item.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors"
                    >
                      造訪官方網站 Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-extrabold block">兌換點數</span>
                      <span className="text-lg font-black text-red-600 font-mono">{item.pointsRequired} Pts</span>
                    </div>

                    {isClaimed ? (
                      <div className="text-right">
                        <span className="text-[10px] bg-green-150 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1.5 border border-green-250">
                          <Check className="w-3.5 h-3.5 text-green-700" />
                          已兌換 {claimedCodes[item.id]}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClaim(item.id, item.pointsRequired)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                          points >= item.pointsRequired
                            ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {t.claimReward}
                      </button>
                    )}
                  </div>
                </div>

                {isClaimed && (
                  <div className="bg-slate-50 p-4 border-t border-dashed border-slate-200 text-center space-y-2">
                    <div className="flex justify-center text-blue-600">
                      <Ticket className="w-8 h-8 rotate-12" />
                    </div>
                    <p className="text-xs font-black text-slate-700">優惠登錄券序號: <span className="text-blue-700 font-mono font-extrabold">{claimedCodes[item.id]}</span></p>
                    <p className="text-[10px] text-slate-400">請出示或複製此條碼，於結帳或繳費機中直接輸入核銷。</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
