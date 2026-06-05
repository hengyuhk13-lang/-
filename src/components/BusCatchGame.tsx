import React, { useState, useEffect, useRef } from "react";
import { Gamepad2, Play, RotateCcw, Award, Users, Trash, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

interface BusCatchGameProps {
  points: number;
  onAddPoints: (amount: number) => void;
}

interface FallingItem {
  id: number;
  x: number; // 0 to 100 percentage
  y: number; // px from top
  type: "passenger" | "leaf" | "wind" | "barrier";
}

export default function BusCatchGame({ points, onAddPoints }: BusCatchGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [busX, setBusX] = useState(50); // 0 to 100 percentage
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [highscore, setHighscore] = useState(() => {
    return parseInt(localStorage.getItem("bus_game_highscore") || "0");
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasClaimedThisGame, setHasClaimedThisGame] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Keyboard listeners for desktop players
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      if (e.key === "ArrowLeft") {
        setBusX((prev) => Math.max(5, prev - 8));
      } else if (e.key === "ArrowRight") {
        setBusX((prev) => Math.min(95, prev + 8));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, gameOver]);

  // Start the physical game loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    let spawnTimer = 0;
    let itemId = 0;

    const gameTick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Move falling items down
      setFallingItems((prevItems) => {
        const moved = prevItems.map((item) => ({
          ...item,
          y: item.y + 4.5
        }));

        // Collision detection with the bus (bus is positioned at the bottom around y=180-220px)
        const updated = moved.filter((item) => {
          const isAtCollisionY = item.y >= 180 && item.y <= 210;
          if (isAtCollisionY) {
            const distance = Math.abs(item.x - busX);
            const isHit = distance <= 15; // collision width padding

            if (isHit) {
              if (item.type === "passenger") {
                setScore((s) => s + 10);
                triggerPopup("👥 接到通勤市民! +10");
              } else if (item.type === "leaf") {
                setScore((s) => s + 15);
                triggerPopup("🌿 收集碳減排綠葉! +15");
              } else if (item.type === "wind") {
                setLives((l) => {
                  const nextL = l - 1;
                  if (nextL <= 0) {
                    setGameOver(true);
                    setIsPlaying(false);
                  }
                  return nextL;
                });
                triggerPopup("🌪️ 九降風侵擾! 扣 1 生命");
              } else if (item.type === "barrier") {
                setLives((l) => {
                  const nextL = l - 1;
                  if (nextL <= 0) {
                    setGameOver(true);
                    setIsPlaying(false);
                  }
                  return nextL;
                });
                triggerPopup("🚧 路上阻礙! 扣 1 生命");
              }
              return false; // remove from screen
            }
          }

          // Filter out items that have fallen past the bottom boundary
          return item.y < 235;
        });

        return updated;
      });

      // Spawn new items of random variants
      spawnTimer += delta;
      if (spawnTimer >= 1000) {
        spawnTimer = 0;
        const types: Array<"passenger" | "leaf" | "wind" | "barrier"> = [
          "passenger",
          "leaf",
          "passenger",
          "leaf",
          "wind",
          "barrier"
        ];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const newItem: FallingItem = {
          id: itemId++,
          x: Math.floor(Math.random() * 80) + 10,
          y: 0,
          type: randomType
        };
        setFallingItems((prev) => [...prev, newItem]);
      }

      gameLoopRef.current = requestAnimationFrame(gameTick);
    };

    gameLoopRef.current = requestAnimationFrame(gameTick);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, busX]);

  const triggerPopup = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 1200);
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLives(3);
    setFallingItems([]);
    setGameOver(false);
    setHasClaimedThisGame(false);
  };

  const handleClaimPoints = () => {
    if (score < 100) return;
    if (hasClaimedThisGame) {
      triggerPopup("⚠️ 本局小遊戲點數已領取過囉！");
      return;
    }
    onAddPoints(150);
    setHasClaimedThisGame(true);
    triggerPopup("🎉 恭喜！成功兌換 150 Pts 風城點數！");
    
    // Save highscore
    if (score > highscore) {
      setHighscore(score);
      localStorage.setItem("bus_game_highscore", score.toString());
    }
  };

  // Render falling emoji elements nicely
  const getFallingEmoji = (type: string) => {
    switch (type) {
      case "passenger": return "👤";
      case "leaf": return "🌿";
      case "wind": return "🌪️";
      case "barrier": return "🚧";
      default: return "🌿";
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-inner border border-indigo-950 text-left space-y-4">
      
      {/* Game Title with Controller indicator */}
      <div className="flex justify-between items-center bg-indigo-950/50 p-2.5 rounded-2xl border border-indigo-805">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5.5 h-5.5 text-yellow-400 animate-bounce" />
          <div>
            <h3 className="font-extrabold text-sm text-yellow-300">風城巴士接接樂小遊戲</h3>
            <p className="text-[10px] text-slate-350">接市民、吃綠葉，增加大眾運輸低碳載客量！</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">最高紀錄 HighScore</span>
          <span className="text-sm font-black text-white font-mono">{highscore} Pts</span>
        </div>
      </div>

      {/* Static instructions */}
      {!isPlaying && !gameOver && (
        <div className="bg-slate-850/60 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5 leading-relaxed text-slate-200">
          <h4 className="font-bold text-yellow-400">🎮 遊戲玩法指南 (How to Play):</h4>
          <ul className="space-y-1 text-[11px] list-disc list-inside">
            <li>點選下方左右按鈕（或鍵盤左右鍵）來移動底部的橘色小巴士。</li>
            <li>接住從天而降的 <b className="text-white">👤 通勤市民</b> 與 <b className="text-green-400">🌿 碳減排綠葉</b> 賺累積積分！</li>
            <li>小心閃躲 <b className="text-red-400">🌪️ 八級九降風</b> 或是 <b className="text-orange-500">🚧 道路阻礙障礙物</b>。</li>
            <li>每局 3 個乘客生命，看你的最高駕駛記錄！</li>
            <li className="text-yellow-300 font-bold">🎯 達到 100 分以上即可點擊兌換實體 system 綠能點數 +150 Pts！</li>
          </ul>
          
          <button
            onClick={handleStartGame}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-black rounded-xl text-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play className="w-4 h-4 fill-indigo-950" />
            <span>開始駕駛新竹巴士 Start Game</span>
          </button>
        </div>
      )}

      {/* GAME WORKSPACE SCREEN */}
      {(isPlaying || gameOver) && (
        <div className="space-y-3 select-none">
          
          {/* Top scoreboard dashboard */}
          <div className="flex justify-between items-center text-xs px-1">
            <div className="flex gap-4">
              <div>
                <span className="text-slate-400 text-[10px] block font-bold font-mono">SCORE</span>
                <span className="text-lg font-black text-yellow-400 font-mono">{score}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-bold font-mono">LIVES 生命</span>
                <span className="text-lg flex gap-1 font-bold text-red-500">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={i < lives ? "opacity-100" : "opacity-20"}>❤️</span>
                  ))}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleStartGame}
              className="p-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新開始</span>
            </button>
          </div>

          {/* Fall Canvas box */}
          <div 
            ref={containerRef}
            className="relative h-60 bg-indigo-950 border-2 border-indigo-805 rounded-2xl overflow-hidden shadow-inner flex items-end"
          >
            {/* Background elements inside game screen */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900 to-indigo-950 opacity-90 pointer-events-none" />
            <div className="absolute bottom-1 w-full border-t border-dashed border-indigo-700/40 pointer-events-none" />

            {/* Float Feedback Speech toast bubble */}
            {toastMessage && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg z-20 animate-bounce">
                {toastMessage}
              </div>
            )}

            {/* Falling items elements loop */}
            {fallingItems.map((item) => (
              <div
                key={item.id}
                className="absolute text-xl transition-all duration-75 pointer-events-none transform -translate-x-1/2 select-none"
                style={{ 
                  left: `${item.x}%`, 
                  top: `${item.y}px` 
                }}
              >
                {getFallingEmoji(item.type)}
              </div>
            ))}

            {/* DRIVER PLAYER BUS (底部橘色巴士) */}
            {!gameOver && (
              <div 
                className="absolute bottom-2 h-7 bg-orange-500 border border-slate-900 rounded-lg flex items-center justify-center text-[10px] font-extrabold px-2 transition-all duration-75 text-white shadow shadow-yellow-500/10 shrink-0 transform -translate-x-1/2"
                style={{ left: `${busX}%` }}
              >
                🚌 182號
              </div>
            )}

            {/* GAME OVER CARD BLOCK */}
            {gameOver && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-center items-center p-6 text-center space-y-4 z-20">
                <div className="bg-red-900/30 p-3 rounded-full border border-red-500 text-red-500 animate-bounce">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-red-500">駕駛生命用盡 Game Over!</h4>
                  <p className="text-xs text-slate-350 mt-1">您本局累計大眾運輸低碳承載量: <b className="text-yellow-400 font-mono text-sm">{score}</b></p>
                </div>

                <div className="space-y-2 w-full pt-1">
                  {score >= 100 ? (
                    <button
                      onClick={handleClaimPoints}
                      disabled={hasClaimedThisGame}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all scale-100 flex items-center justify-center gap-1 shadow cursor-pointer ${
                        hasClaimedThisGame
                          ? "bg-slate-700 text-slate-400"
                          : "bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 hover:opacity-90 active:scale-95"
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span>{hasClaimedThisGame ? "已順利兌換本次 150 Pts" : "領取 150 Pts 風城獎勵點數!"}</span>
                    </button>
                  ) : (
                    <div className="bg-slate-900 p-2 border border-slate-800 rounded-xl text-[10px] text-slate-400">
                      💡 達 <b>100 分</b> 才能領取 150 Pts！離目標還差 <b>{100 - score} 分</b>，加油！
                    </div>
                  )}

                  <button
                    onClick={handleStartGame}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 font-black rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    再駕駛一次 (Drive Again)
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* MANUAL MOVEMENT CONTROLLERS FOR TOUCH SCREEN */}
          {!gameOver && isPlaying && (
            <div className="grid grid-cols-2 gap-4 pt-1 select-none">
              <button
                type="button"
                onClick={() => setBusX((prev) => Math.max(5, prev - 12))}
                className="py-4.5 bg-indigo-805 hover:bg-indigo-700 active:scale-95 text-white border border-indigo-700 font-black rounded-2xl text-base transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
              >
                <span>⬅️ 左移 Bus Left</span>
              </button>
              
              <button
                type="button"
                onClick={() => setBusX((prev) => Math.min(95, prev + 12))}
                className="py-4.5 bg-indigo-805 hover:bg-indigo-700 active:scale-95 text-white border border-indigo-700 font-black rounded-2xl text-base transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
              >
                <span>右移 Bus Right ➡️</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
