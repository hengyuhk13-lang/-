import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, MessageSquare, AlertCircle, X, Compass } from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiAssistantProps {
  language: AppLanguage;
  onClose: () => void;
}

export default function AiAssistant({ language, onClose }: AiAssistantProps) {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: t.helperTitle + " " + t.appSubtitle + "！👋\n我懂新竹九降風的安全指南、YouBike 計費、182 路通勤密技，也知道哪裡有最好吃的摃丸與粉澌喔！有什麼我可以幫忙的呢？",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: "城隍廟美食 🥟", text: "推薦新竹城隍廟周邊必吃的三種在地美食和小吃，並說明原因。" },
    { label: "強風 YouBike 騎乘 🚲", text: "新竹九降風超大，騎 YouBike 或機車通勤要注意哪些安全防範？" },
    { label: "182路公車攻略 🚌", text: "請簡介 Hsinchu 182 路公車的起訖點、主要重要幹道，與熱門通勤時段建議。" },
    { label: "點數可以做什麼 🎁", text: "風城通累積的點數 (Pts) 可以在哪裡兌換什麼商家優惠？" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(1), // omit the generic greeting to save tokens
        }),
      });

      if (!response.ok) throw new Error("HTTP Failed");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "我沒有收到任何回覆，要不我換個角度回答？" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ **伺服器風力過強連線失敗**。目前風速極高，請稍候重試或檢查您的 API Key 設定喔！不過請放心，九降風來襲時保持穩定前行是第一要務！",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Bot className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                {t.helperTitle}
                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </h3>
              <p className="text-xs text-blue-100 opacity-90 font-mono">Model: gemini-3.5-flash</p>
            </div>
          </div>
          <button 
            id="close-helper-btn"
            onClick={onClose} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info notice about Gemini API Key */}
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-[11px] text-blue-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-500" />
          <span>此助理由 Gemini 3.5 智慧引擎驅動。可於側邊 <b>Settings &gt; Secrets</b> 調整金鑰。</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-slate-50">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                m.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-100 border border-neutral-200 text-blue-700"
              }`}>
                {m.role === "user" ? <Compass className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                }`}>
                  <div className="whitespace-pre-line prose max-w-none text-left">
                    {m.content}
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block px-1">
                  {m.role === "user" ? "You" : "風城通 AI"}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white p-3 rounded-2xl text-sm text-slate-500 border border-slate-200 rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-xs">{t.chatting}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Presets and entry */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="shrink-0 scale-95 hover:scale-100 transition-all text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-full border border-slate-200 font-medium"
                onClick={() => handleSend(preset.text)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} 
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.helperPlaceholder}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              id="send-helper-msg-btn"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 disabled:bg-slate-300 text-white rounded-xl px-4 flex items-center justify-center transition-colors hover:bg-blue-700 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
