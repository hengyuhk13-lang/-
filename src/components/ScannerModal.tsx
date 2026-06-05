import React, { useState } from "react";
import { QrCode, X, Flashlight, AlertCircle, CircleCheck } from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";

interface ScannerModalProps {
  language: AppLanguage;
  onClose: () => void;
  onReward: (points: number) => void;
}

export default function ScannerModal({ language, onClose, onReward }: ScannerModalProps) {
  const t = TRANSLATIONS[language];
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [success, setSuccess] = useState(false);

  const triggerMockScan = () => {
    onReward(50);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col">
      {/* Top action bar */}
      <div className="flex justify-between items-center p-6 text-white bg-black/60 backdrop-blur-md">
        <button 
          id="close-scanner-btn"
          onClick={onClose} 
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-bold text-center flex-1">{t.scanTitle}</span>
        <button 
          onClick={() => setFlashlightOn(!flashlightOn)} 
          className={`p-1.5 rounded-full transition-colors ${
            flashlightOn ? "bg-yellow-500 text-black" : "hover:bg-white/10 text-white"
          }`}
        >
          <Flashlight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center bg-slate-950 p-6">
        
        {success ? (
          <div className="bg-slate-900 border border-green-500/50 p-8 rounded-3xl max-w-sm text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              <CircleCheck className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="font-bold text-green-400 text-lg">掃描完成！</h4>
            <p className="text-sm text-slate-300">{t.successMsg}</p>
            <p className="text-xs text-slate-500">已成功與風城通勤大系統同步 (Hsinchu Smart Bus Synchronized)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8 max-w-sm text-center">
            
            {/* Visual Box Brackets and Red/Green scanning laser line */}
            <div className="w-64 h-64 border border-white/20 rounded-3xl relative overflow-hidden bg-slate-900 shadow-[0_0_50px_rgba(30,144,255,0.1)]">
              {/* Animated scanning bar */}
              <div className="absolute w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 scanner-line shadow-lg" />
              
              {/* Outer four brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <QrCode className="w-32 h-32 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-white/80 text-sm font-medium">{t.scanPrompt}</p>
              
              <button
                id="simulate-scan-action-btn"
                onClick={triggerMockScan}
                className="w-full py-3.5 px-6 bg-blue-600 text-white font-bold rounded-2xl active:scale-95 transition-transform shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                模擬掃描 (Simulate Scan)
              </button>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-[11px] text-slate-400 flex gap-2 items-center text-left">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>模擬情境：乘車或租借 uBike 時掃描條碼，直接獲取 50 Pts 風城獎勵點數。</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
