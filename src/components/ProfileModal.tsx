import React, { useState } from "react";
import { X, Check, Camera, User, Mail, Award, CheckCircle } from "lucide-react";

interface ProfileModalProps {
  userName: string;
  userEmail: string;
  userAvatar: string;
  userLevel: string;
  onSave: (name: string, email: string, avatar: string, level: string) => void;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", // Female tech avatar
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", // Male tech avatar
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", // Female commuter
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", // Male NTHU student
  "https://lh3.googleusercontent.com/aida/AP1WRLusNKp1tK-zkIPtJzCCfrHOKOCHqKkMs4dgFos7rSKCa7jM4CJyfpcuwAIuo9uOxDBnRiV8diG-v1v_RKJ7MXLOutBe8Z3BpzsyfPo8A8WPryOGaTeLPNtRv9F3YZu-lsdc76C2zWRJwM5XGjKlIc1hhQ42APeqJ7R0bE4m0dlzvz5HFGu76Idtir-dcMFy7Cu8LISnIBPbPDTpDd-x28GnvU_sY4Tw1msaE8hdkFCYYa3QfOdBy_E4LSk" // Applet Original
];

const STATUS_PRESETS = [
  "大學生 • 風城等級 12",
  "科管局工程師 • 風城等級 18",
  "綠能低碳先鋒 • 風城等級 25",
  "美食老饕騎士 • 風城等級 8",
  "永續公車達人 • 風城等級 15"
];

export default function ProfileModal({
  userName,
  userEmail,
  userAvatar,
  userLevel,
  onSave,
  onClose
}: ProfileModalProps) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [avatar, setAvatar] = useState(userAvatar);
  const [level, setLevel] = useState(userLevel);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, email, avatar, level);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col text-left max-h-[85vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-yellow-300" />
            <span className="font-extrabold text-sm tracking-wide">編輯個人檔案 Profile Setup</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toast */}
        {showToast && (
          <div className="m-3 p-2 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shrink-0 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>個人檔案修改已成功儲存！</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          
          {/* Avatar settings */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block">偏好大頭貼預設人像 Preset Avatars</label>
            <div className="flex flex-wrap gap-2.5 items-center justify-between py-1 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              {AVATAR_PRESETS.map((url, i) => {
                const isSelected = avatar === url;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected ? "border-blue-600 scale-105 ring-2 ring-blue-200" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Avatar Preset ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom File/URL input */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 block font-bold">或貼上自定義大頭貼連結圖片 URL:</span>
              <input
                type="url"
                value={customAvatarUrl}
                onChange={(e) => {
                  setCustomAvatarUrl(e.target.value);
                  if (e.target.value.startsWith("http")) {
                    setAvatar(e.target.value);
                  }
                }}
                className="w-full text-[11px] p-2 rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* User Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              使用者名稱 Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-bold text-slate-800"
              placeholder="輸入姓名..."
            />
          </div>

          {/* User Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              電子郵件聯絡簿 Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-mono font-bold text-slate-600"
              placeholder="yourname@gmail.com"
            />
          </div>

          {/* User Badge Status Level preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              交通身分與稱號 Level Category
            </label>
            <div className="relative">
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-bold text-slate-700 appearance-none cursor-pointer"
              >
                {STATUS_PRESETS.map((preset, i) => (
                  <option key={i} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
              {/* Dropdown chevron visual */}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Action Confirmation button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-transform active:scale-95 text-center cursor-pointer"
          >
            確定儲存並變更 Save Profile Changes
          </button>

        </form>
      </div>
    </div>
  );
}
