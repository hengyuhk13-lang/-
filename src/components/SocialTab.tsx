import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, Share2, HelpCircle, Trophy, Users, Send, CheckCircle2, XCircle, ChevronRight, PenTool } from "lucide-react";
import { AppLanguage, TRANSLATIONS, Post, QuizQuestion } from "../types";
import BusCatchGame from "./BusCatchGame";
import FriendsMapModal from "./FriendsMapModal";

interface SocialTabProps {
  language: AppLanguage;
  points: number;
  onAddPoints: (amount: number) => void;
  onOpenLeaderboard: () => void;
  userEmail: string;
  userName: string;
  userAvatar: string;
}

export default function SocialTab({ 
  language, 
  points, 
  onAddPoints, 
  onOpenLeaderboard, 
  userEmail,
  userName,
  userAvatar
}: SocialTabProps) {
  const t = TRANSLATIONS[language];
  
  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasClaimedPoints, setHasClaimedPoints] = useState(false);
  const [isFriendsMapOpen, setIsFriendsMapOpen] = useState(false);

  // New post modal / input state
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostRoute, setNewPostRoute] = useState("182 路公車");
  const [isPosting, setIsPosting] = useState(false);

  // Active comments area triggers
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Load posts and quizzes initially
  const loadPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const loadQuizzes = async () => {
    try {
      const response = await fetch("/api/quiz");
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    }
  };

  useEffect(() => {
    loadPosts();
    loadQuizzes();
  }, []);

  // Handle Liking a Post
  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                likes: data.likes,
                likedBy: data.likedBy,
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  // Handle Commenting on a Post
  const handleCommentSubmit = async (postId: number) => {
    if (!newCommentText.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: userName,
          content: newCommentText,
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
        setNewCommentText("");
        setCommentingPostId(null);
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  // Handle Submitting dynamic post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: userName,
          content: newPostContent,
          route: newPostRoute,
        }),
      });

      if (response.ok) {
        setNewPostContent("");
        setNewPostRoute("182 路公車");
        setIsPosting(false);
        loadPosts(); // refresh feed
      }
    } catch (err) {
      console.error("Failed to submit post:", err);
    }
  };

  // Handle Quizzing selections
  const handleQuizSubmit = () => {
    if (selectedOption === null || isAnswered || quizzes.length === 0) return;

    const correctIndex = quizzes[quizIndex].answerIndex;
    const correct = selectedOption === correctIndex;
    
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct && !hasClaimedPoints) {
      onAddPoints(100);
      setHasClaimedPoints(true);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setHasClaimedPoints(false);
    setQuizIndex((prev) => (prev + 1) % quizzes.length);
  };

  const currentQuiz = quizzes[quizIndex];

  return (
    <div className="space-y-6">
      
      {/* Quiz Section (交通益智王 - Trivia Challenge) */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 p-5 rounded-3xl relative overflow-hidden text-left shadow-sm">
        <div className="flex justify-between items-start mb-3.5">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-700 animate-spin" />
            <h3 className="font-extrabold text-indigo-950 text-sm tracking-wide">{t.quizTitle}</h3>
          </div>
          <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-black uppercase">
            Q{quizIndex + 1}/{quizzes.length}
          </span>
        </div>

        {currentQuiz ? (
          <div className="space-y-3.5">
            <p className="text-xs font-bold text-indigo-900 leading-relaxed">
              {currentQuiz.question}
            </p>

            {/* Answer select options */}
            <div className="space-y-2">
              {currentQuiz.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectIndex = idx === currentQuiz.answerIndex;
                
                let optionStyle = "border-slate-200 bg-white hover:bg-slate-50";
                
                if (isSelected) {
                  optionStyle = "border-indigo-500 bg-indigo-50/50";
                }
                if (isAnswered) {
                  if (isCorrectIndex) {
                    optionStyle = "border-green-500 bg-green-50 text-green-900";
                  } else if (isSelected) {
                    optionStyle = "border-red-500 bg-red-50 text-red-900";
                  } else {
                    optionStyle = "opacity-50 border-slate-200 bg-white";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-3 border rounded-xl text-xs font-bold text-left transition-all leading-relaxed flex items-start gap-2 ${optionStyle}`}
                  >
                    <span className="bg-slate-100 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanations warning and next triggers */}
            {isAnswered ? (
              <div className="space-y-3 bg-white p-3 rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-150">
                <div className="flex items-center gap-1.5 text-xs">
                  {isCorrect ? (
                    <span className="text-green-700 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                      回答正確！獲得 +100 Pts
                    </span>
                  ) : (
                    <span className="text-red-700 font-extrabold flex items-center gap-1">
                      <XCircle className="w-4.5 h-4.5 text-red-600" />
                      答錯了，再接再厲！
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {currentQuiz.explanation}
                </p>

                <button
                  type="button"
                  id="quiz-next-btn"
                  onClick={handleNextQuiz}
                  className="w-full mt-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  下一問 (Next Quiz)
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="quiz-submit-btn"
                disabled={selectedOption === null}
                onClick={handleQuizSubmit}
                className="w-full py-2.5 bg-indigo-650 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                遞交答案 (Submit Choice)
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">正在下載風城交通題庫...</p>
        )}
      </div>

      {/* Playable Interactive Mini Game */}
      <BusCatchGame points={points} onAddPoints={onAddPoints} />

      {/* Grid Quick action buttons: Leaderboard, Friends */}
      <div className="grid grid-cols-2 gap-3 shrink-0 text-left">
        {/* Weekly Leaderboards */}
        <div
          onClick={onOpenLeaderboard}
          className="bg-green-700 hover:bg-green-800 p-4 rounded-2xl text-white shadow-sm cursor-pointer transition-colors active:scale-95 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center">
            <Trophy className="w-6 h-6 animate-pulse" />
            <ChevronRight className="w-4 h-4 text-white opacity-80" />
          </div>
          <div className="mt-4">
            <h5 className="font-extrabold text-sm">{t.leaderboardTitle}</h5>
            <p className="text-[11px] text-green-150 font-bold mt-0.5">王小明: No. 3 (14.5h)</p>
          </div>
        </div>

        {/* Friend Map Info */}
        <div 
          onClick={() => setIsFriendsMapOpen(true)}
          className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-blue-750 shadow-sm flex flex-col justify-between hover:bg-slate-150 cursor-pointer transition-all active:scale-95"
        >
          <div className="bg-slate-200 p-2 rounded-xl text-blue-700 w-fit">
            <Users className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h5 className="font-extrabold text-sm text-slate-800">{t.friendsMap}</h5>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full mt-1 inline-block">
              {t.friendsOnline}
            </span>
          </div>
        </div>
      </div>

      {/* Social gossiping posts feed */}
      <div className="space-y-4">
        
        <div className="flex justify-between items-center px-1">
          <h3 className="font-extrabold text-slate-800 text-base">風城即時通勤情報</h3>
          
          {/* Post button */}
          <button 
            id="trigger-new-post-btn"
            onClick={() => setIsPosting(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm shadow-blue-500/10 hover:bg-blue-700 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            發布新動態
          </button>
        </div>

        {/* Dynamic New Posting Container inside sheet */}
        {isPosting && (
          <div className="bg-white p-4 rounded-3xl border-2 border-blue-400 text-left space-y-3 shadow-md animate-in slide-in-from-top duration-200">
            <div className="flex justify-between items-center pb-1">
              <span className="text-xs font-bold text-slate-700">寫點你在新竹的通勤現況：</span>
              <button 
                onClick={() => setIsPosting(false)} 
                className="text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-50 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="今天的風大不大？公車誤點了嗎？uBike 有沒有位置還？"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
            />

            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>位置綁定:</span>
                <select
                  value={newPostRoute}
                  onChange={(e) => setNewPostRoute(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 border-none font-bold text-slate-700 py-1 px-2 rounded-lg text-[10px]"
                >
                  <option value="182 路公車">182 路公車</option>
                  <option value="uBike 2.0 市府站">uBike 2.0 市府站</option>
                  <option value="新竹火車站">新竹火車站</option>
                  <option value="高鐵六家站">高鐵六家站</option>
                </select>
              </div>

              <button
                id="submit-new-post-btn"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="bg-blue-600 disabled:bg-slate-300 text-white font-extrabold text-xs px-4 py-2 rounded-xl active:scale-95 transition-transform"
              >
                發布 情報 (Publish)
              </button>
            </div>
          </div>
        )}

        {/* Dynamic posts loop */}
        <div className="space-y-4">
          {posts.map((post) => {
            const hasLiked = post.likedBy.includes(userEmail);

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left"
              >
                <div className="p-4.5">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden shrink-0 border border-slate-200">
                        <img 
                          src={post.avatar} 
                          alt={post.author} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">{post.author}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {post.time} • <span className="text-blue-600 font-mono">{post.route}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Add Friends Mock button */}
                    {post.author !== "王小明" && post.author !== "王小明 (Wang)" && (
                      <button
                        onClick={() => alert(`已向 ${post.author} 送出好友請求！`)}
                        className="text-blue-600 hover:text-blue-700 text-[10px] font-black border border-blue-200 hover:bg-blue-50 px-3 py-1 rounded-full active:scale-95 transition-all text-center"
                      >
                        {t.addFriend}
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Like / Comment / Share count toggles */}
                <div className="flex border-t border-slate-100 px-4 py-2.5 bg-slate-50/50">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors py-1 ${
                      hasLiked ? "text-red-600" : "text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-600 animate-bounce" : ""}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-slate-400 hover:text-blue-600 text-xs font-bold transition-colors py-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length}</span>
                  </button>

                  <button
                    onClick={() => alert("動態連結已成功複製至剪貼簿！可直接分享給班上通勤同學！")}
                    className="flex-1 flex items-center justify-center gap-1.5 text-slate-400 hover:text-blue-600 text-xs font-bold transition-colors py-1"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub comment loop */}
                {(commentingPostId === post.id || post.comments.length > 0) && (
                  <div className="px-4.5 pb-4 bg-slate-50/20 border-t border-slate-100 space-y-3.5 pt-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5 text-xs text-left select-text">
                        <div className="w-6 h-6 rounded-full bg-slate-250 overflow-hidden shrink-0 border border-slate-100">
                          <img 
                            src={comment.avatar} 
                            alt={comment.author} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 bg-slate-100/75 rounded-2xl p-2.5 text-slate-700">
                          <span className="font-extrabold mr-1 text-slate-800">{comment.author}:</span>
                          <span className="font-medium">{comment.content}</span>
                        </div>
                      </div>
                    ))}

                    {/* Active commenter writing line */}
                    {commentingPostId === post.id && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="寫點針對通勤情報的留言..."
                          className="flex-1 h-9 rounded-full bg-slate-100 border-none text-xs px-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-slate-100 shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {isFriendsMapOpen && (
        <FriendsMapModal onClose={() => setIsFriendsMapOpen(false)} />
      )}

    </div>
  );
}
