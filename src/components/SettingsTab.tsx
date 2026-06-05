import React, { useState } from "react";
import { AppLanguage, TRANSLATIONS } from "../types";
import { Bell, KeyRound, Type, Languages, CircleCheck, HelpCircle } from "lucide-react";
import GoogleDriveBackup from "./GoogleDriveBackup";

interface SettingsTabProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  userName: string;
  userEmail: string;
  userAvatar: string;
  onOpenProfile: () => void;
  points: number;
  onRestoreData: (restored: {
    userName?: string;
    userEmail?: string;
    points?: number;
    favorites?: string[];
  }) => void;
}

export default function SettingsTab({
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  userName,
  userEmail,
  userAvatar,
  onOpenProfile,
  points,
  onRestoreData,
}: SettingsTabProps) {
  const t = TRANSLATIONS[language];
  const [pushEnabled, setPushEnabled] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const langs: { key: AppLanguage; Name: string }[] = [
    { key: "zh", Name: "繁中" },
    { key: "en", Name: "EN" },
    { key: "th", Name: "ไทย" },
    { key: "vi", Name: "Việt" },
    { key: "hakka", Name: "客語" },
    { key: "ja", Name: "日本語" },
    { key: "ko", Name: "한국어" },
  ];

  const handleLangSelect = (key: AppLanguage) => {
    onLanguageChange(key);
    
    const langNames: Record<AppLanguage, string> = {
      zh: "繁體中文",
      en: "English",
      th: "ภาษาไทย",
      vi: "Tiếng Việt",
      hakka: "客家語 (Kiá-kâ-ngî)",
      ja: "日本語 (Japanese)",
      ko: "한국어 (Korean)"
    };

    setSuccessMsg(`語言已成功切換為 ${langNames[key]}！`);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleTogglePush = () => {
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    setSuccessMsg(`智慧大風 & 交通調度推播已${nextState ? "開啟 (Alerts On)" : "關閉 (Alerts Off)"}`);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  return (
    <div className="space-y-6">
      
      {successMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm animate-in zoom-in-95 duration-150">
          <CircleCheck className="w-4.5 h-4.5 text-blue-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dynamic Profile Management Panel */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/65 rounded-3xl p-4.5 shadow-sm text-left flex gap-4 items-center justify-between animate-in fade-in duration-200">
        <div className="flex gap-3.5 items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm shrink-0">
            <img 
              alt={userName} 
              className="w-full h-full object-cover" 
              src={userAvatar}
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-850 text-sm tracking-normal">{userName}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{userEmail}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenProfile}
          className="px-3.5 py-1.5 bg-blue-605 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-extrabold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          ✏️ 編輯 (Edit)
        </button>
      </div>

      {/* Language Selection */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 text-left">
        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600" />
          {t.langSettings}
        </h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {langs.map((l) => {
            const isSelected = language === l.key;
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => handleLangSelect(l.key)}
                className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm ${
                  isSelected
                    ? "bg-blue-600 text-white border border-blue-600 font-extrabold"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {l.Name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font scale adjustment */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 text-left">
        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <Type className="w-5 h-5 text-blue-600" />
          {t.fontSizeSettings}
        </h4>

        <div className="flex items-center gap-4 py-2">
          <span className="text-[11px] font-bold text-slate-400">A</span>
          <input
            type="range"
            min="12"
            max="22"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            className="flex-1 accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer hover:accent-blue-700 focus:outline-none"
          />
          <span className="text-xl font-bold text-slate-755">A</span>
        </div>

        {/* Real-time scale preview */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-center">
          <p 
            id="fontSize-preview-paragraph"
            className="text-slate-600 font-semibold leading-relaxed transition-all"
            style={{ fontSize: `${fontSize}px` }}
          >
            {t.previewText} (Scale: {fontSize}px)
          </p>
        </div>
      </div>

      {/* Push notifications toggle option */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm text-left">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl transition-colors ${pushEnabled ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-800 text-sm">{t.pushSettings}</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.pushDesc}</p>
            </div>
          </div>

          {/* Toggle switcher styling */}
          <button
            type="button"
            id="push-alerts-toggle-btn"
            onClick={handleTogglePush}
            className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-all duration-300 relative ${
              pushEnabled ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <div 
              className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                pushEnabled ? "translate-x-5.5" : "translate-x-0"
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Secrets Help explanation */}
      <div className="bg-blue-50/50 border border-blue-200/50 p-4 rounded-2xl text-left space-y-1.5 flex items-start gap-2.5">
        <KeyRound className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-800">智慧 GPT 金鑰密碼管理</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            風城通 AI 助理調用 Google AI Studio 自有金鑰資源。如遇到 AI 分析中斷，請於 <b>Settings &gt; Secrets</b> 新增/變更 <code>GEMINI_API_KEY</code> 來重新上網解鎖！
          </p>
        </div>
      </div>

      {/* Google Drive Cloud backup Integration */}
      <GoogleDriveBackup
        language={language}
        userName={userName}
        userEmail={userEmail}
        points={points}
        onRestoreData={onRestoreData}
      />

    </div>
  );
}
