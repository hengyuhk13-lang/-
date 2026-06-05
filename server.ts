import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set in the environment variables.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Memory stores for dynamic state
let socialPosts = [
  {
    id: 1,
    author: "Kevin Ho",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    time: "15 分鐘前",
    route: "182 路公車",
    content: "今天的九降風真的很大，下公車的時候差點被吹走！大家騎 uBike 也要注意握好龍頭，保暖防風喔～🫨",
    likes: 24,
    likedBy: [] as string[],
    comments: [
      { id: 1, author: "Lisa", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", content: "真的！我剛在清大站也差點被吹歪..." }
    ]
  },
  {
    id: 2,
    author: "李大華",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    time: "45 分鐘前",
    route: "uBike 2.0",
    content: "剛剛在新竹火車站想找車位還，市府站和火車站都好多人。多虧 Windy App 查看即時車位，改去東門城附近的站點順利還車了！",
    likes: 12,
    likedBy: [] as string[],
    comments: [] as any[]
  },
  {
    id: 3,
    author: "陳美美",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    time: "2 小時前",
    route: "台鐵新竹站",
    content: "巨城購物中心今天人好多，接駁公車稍微擠了一點，但班次依然很密集，讚讚！",
    likes: 18,
    likedBy: [] as string[],
    comments: [] as any[]
  }
];

// Seed 5 high-quality Hsinchu-themed transportation and safety questions for the quiz
const quizQuestions = [
  {
    id: 1,
    question: "新竹市著名的『九降風』通常發生在哪個季節，騎乘單車或 uBike 應注意什麼？",
    options: [
      "春季；注意暴雨積水",
      "夏季；防範高溫中暑",
      "秋冬兩季；容易遇上瞬間 7-8 級強陣風，建議雙手握穩龍頭，並適度減速",
      "整年皆無風；新竹只是浪得虛名"
    ],
    answerIndex: 2,
    explanation: "新竹九降風在秋冬兩季因東北季風受到地形壓縮而特別強勁（瞬間陣風可達7至8級以上）。騎乘 uBike 或機車時因迎風阻力大，務必雙手緊握把手、放慢速度，以確保行車安全！"
  },
  {
    id: 2,
    question: "搭乘 Hsinchu 182 路公車（新竹火車站 - 高鐵新竹站），請問主要行經哪一條重要幹道？",
    options: [
      "公道五路",
      "光復路及東科路（連接園區與新竹、竹北高鐵站）",
      "經國路",
      "中華路"
    ],
    answerIndex: 1,
    explanation: "182路公車是目前新竹雙城（新竹市區與竹北高鐵特區）通勤的主要骨幹，主要行經繁忙的光復路，提供工研院、清華大學、交通大學學生與竹科通勤族便捷的水陸及鐵路轉乘路網。"
  },
  {
    id: 3,
    question: "關於新竹市 YouBike 2.0 的計費方式，下列哪一項敘述是正確的？",
    options: [
      "全天候免費騎乘",
      "前 30 分鐘可享有市府補助優惠（實際需依市府公告），之後每 30 分鐘累進計費",
      "按騎乘的總距離（里程數）收費",
      "只能使用現金付款"
    ],
    answerIndex: 1,
    explanation: "YouBike 2.0 主要是以前 30 分鐘享有市府補貼優惠為基礎，提供民眾綠色運輸的最後一哩路。超過 30 分鐘後則按每 30 分鐘累進計費，可使用悠遊卡、一卡通或掃碼付費。"
  },
  {
    id: 4,
    question: "搭乘公共運輸節能減碳，風城通 App 提供的『點數獎勵（Pts）』可以兌換以下哪種好康？",
    options: [
      "巨城購物中心當日折抵停車、春上布丁蛋糕折價券等在地商家優惠",
      "直接兌換現金台幣",
      "免費領取一台 YouBike 單車回家",
      "抵免個人所得稅"
    ],
    answerIndex: 0,
    explanation: "風城通特別與新竹在地指標性商家（如 Big City 巨城購物中心、春上布丁蛋糕等）合作。透過綠色通勤、挑戰交通 quiz 或每日簽到掃碼，累積點數就能兌換豐富的實用折價好康！"
  },
  {
    id: 5,
    question: "當路口紅綠燈故障且無警察指揮時，以下哪一種車輛擁有優先路權？",
    options: [
      "大喇叭按最響的車",
      "支線道車應暫停讓幹線道車先行；少線道車讓多線道車先行",
      "速度最快的跑車優先",
      "左轉彎車優先於直行車"
    ],
    answerIndex: 1,
    explanation: "依交通安法，無號誌路口路權判斷是『支線道讓幹線道』、『少線道讓多線道』、『轉彎車讓直行車』。遵守路權規定，停讓守序，安全更有保障！"
  }
];

// Live Simulated Bus position
interface BusLocation {
  id: string;
  route: string;
  direction: string;
  lat: number; // custom normalized coordinates between 0 (Station) and 100 (HSR)
  speed: number;
  stops: string[];
  currentStopIndex: number;
  passengers: number;
  capacity: number;
  minutesToArrive: number;
}

let simulatedBuses: BusLocation[] = [
  {
    id: "B182_UP",
    route: "182",
    direction: "往 高鐵新竹站",
    lat: 15,
    speed: 1.2,
    stops: ["新竹火車站", "東門市場", "清華大學", "交通大學", "新莊車站", "高鐵新竹站"],
    currentStopIndex: 1,
    passengers: 18,
    capacity: 45,
    minutesToArrive: 3
  },
  {
    id: "B182_DOWN",
    route: "182",
    direction: "往 新竹火車站",
    lat: 80,
    speed: -1.0,
    stops: ["高鐵新竹站", "新莊車站", "交通大學", "清華大學", "東門市場", "新竹火車站"],
    currentStopIndex: 1,
    passengers: 32,
    capacity: 45,
    minutesToArrive: 8
  },
  {
    id: "B81_SHUTTLE",
    route: "綠線",
    direction: "往 巨城購物中心",
    lat: 40,
    speed: 0.8,
    stops: ["巨城購物中心", "新竹市政府", "城隍廟", "新竹火車站"],
    currentStopIndex: 1,
    passengers: 12,
    capacity: 30,
    minutesToArrive: 4
  }
];

// Tick simulation every 5 seconds to animate public transit dynamically
setInterval(() => {
  simulatedBuses = simulatedBuses.map((bus) => {
    let nextLat = bus.lat + bus.speed;
    if (nextLat > 100) {
      nextLat = 0; // wrap around
    } else if (nextLat < 0) {
      nextLat = 100;
    }
    
    // Calculate current stop based on progress
    const segmentSize = 100 / (bus.stops.length - 1);
    const stopIndex = Math.min(
      Math.floor(nextLat / segmentSize),
      bus.stops.length - 1
    );
    
    // Dynamic countdown calculation
    const distanceToNextStop = (segmentSize * (stopIndex + 1)) - nextLat;
    const minutesToArrive = Math.max(1, Math.round(distanceToNextStop * 0.4));

    return {
      ...bus,
      lat: Number(nextLat.toFixed(2)),
      currentStopIndex: stopIndex,
      minutesToArrive: minutesToArrive
    };
  });
}, 5000);

// --- API ENDPOINTS ---

// AI Guide chat advisor endpoint using Gemini 3.5 Flash
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    // Construct custom prompt grounding Hsinchu Travel & Windy Transit facts
    const systemPrompt = `你是一位專業親切的『風城通 (Windy City Transit helper)』智慧交通與新竹旅遊AI助理。
    你必須遵守以下規則：
    1. 針對新竹九降風（尤其秋冬季強風，達到7-8級甚至更高）提供實用的 uBike 騎乘或行車安全建議（例如：手握緊把手、避開高架或大樓風切點、適度步行停讓等）。
    2. 提供新竹 local 在地交通資訊：像是熱門公車「182路」往返高鐵與火車站的情形，YouBike 的租借規則，台鐵新竹站與高鐵六家支線等。
    3. 推薦新竹熱門景點與在地隱藏美味：例如「新竹城隍廟」周邊必吃（摃丸湯、新竹米粉、潤餅、郭家肉圓、紅糟肉圓等）、「南寮漁港十七公里海岸線」鐵馬行、「巨城購物中心」接駁車、豆腐岩、十八尖山等知名地標。
    4. 語氣溫和、專業，混合繁體中文與適量英文，呈現親切活潑的大學生及日常通勤便民語氣，字數控制在150-250字內，版面要用 Markdown 列表清晰易讀。`;

    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      reply: "不好意思，風城伺服器目前被風吹風了～請稍候再試： " + (error.message || "未知錯誤"),
    });
  }
});

// Social Feed APIs
app.get("/api/posts", (req, res) => {
  res.json(socialPosts);
});

app.post("/api/posts", (req, res) => {
  const { author, content, route } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: "Author and content are required." });
  }

  const newPost = {
    id: socialPosts.length + 1,
    author: author,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", // user generic profile
    time: "剛剛",
    route: route || "風城通勤族",
    content: content,
    likes: 0,
    likedBy: [] as string[],
    comments: [] as any[]
  };

  socialPosts.unshift(newPost);
  res.status(201).json(newPost);
});

// Like a post
app.post("/api/posts/:id/like", (req, res) => {
  const postId = parseInt(req.params.id);
  const { userEmail } = req.body;
  const post = socialPosts.find((p) => p.id === postId);
  
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const key = userEmail || "anonymous_user";
  const likedIndex = post.likedBy.indexOf(key);

  if (likedIndex > -1) {
    // Unlike
    post.likedBy.splice(likedIndex, 1);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Like
    post.likedBy.push(key);
    post.likes += 1;
  }

  res.json({ likes: post.likes, likedBy: post.likedBy });
});

// Comment on a post
app.post("/api/posts/:id/comment", (req, res) => {
  const postId = parseInt(req.params.id);
  const { author, content } = req.body;
  const post = socialPosts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const newComment = {
    id: post.comments.length + 1,
    author: author || "風城通勤客",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    content: content
  };

  post.comments.push(newComment);
  res.status(201).json(post);
});

// Quiz API
app.get("/api/quiz", (req, res) => {
  res.json(quizQuestions);
});

// Bus simulated locations
app.get("/api/bus-status", (req, res) => {
  res.json(simulatedBuses);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
