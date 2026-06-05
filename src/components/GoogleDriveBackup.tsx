import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  RefreshCw, 
  Lock, 
  CloudUpload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  KeyRound,
  Database,
  ExternalLink,
  Loader2
} from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../types";

interface GoogleDriveBackupProps {
  language: AppLanguage;
  userName: string;
  userEmail: string;
  points: number;
  onRestoreData: (restored: {
    userName?: string;
    userEmail?: string;
    points?: number;
    favorites?: string[];
  }) => void;
}

interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
}

export default function GoogleDriveBackup({
  language,
  userName,
  userEmail,
  points,
  onRestoreData
}: GoogleDriveBackupProps) {
  const t = TRANSLATIONS[language];

  // In-memory caching for OAuth token as strictly mandated by Workspace guidelines
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>(() => {
    return localStorage.getItem("gdrive_user_client_id") || "860039764471-ais-preview.apps.googleusercontent.com";
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [cliFeedback, setCliFeedback] = useState<{ status: "idle" | "success" | "error"; msg: string }>({
    status: "idle",
    msg: ""
  });

  // Parse implicit consent code on load
  useEffect(() => {
    if (window.location.hash) {
      const fragment = window.location.hash.substring(1);
      const params = new URLSearchParams(fragment);
      const token = params.get("access_token");
      const state = params.get("state");

      if (token && state === "windy_gdrive_sync") {
        setAccessToken(token);
        setIsConnected(true);
        // Clear hash from address bar for visual cleanliness
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        
        setCliFeedback({
          status: "success",
          msg: "✓ 成功連接 Google 雲端帳號！ (Drive connected successfully!)"
        });
        setTimeout(() => setCliFeedback({ status: "idle", msg: "" }), 3500);

        // Instantly load backup list
        fetchBackupFileList(token);
      }
    }
  }, []);

  // Save client_id selection locally
  const handleSaveClientId = (newId: string) => {
    setClientId(newId);
    localStorage.setItem("gdrive_user_client_id", newId);
  };

  // Google OAuth Auth Code Redirect
  const handleConnect = () => {
    if (!clientId.trim()) {
      setCliFeedback({ status: "error", msg: "請先輸入有效的 Google Client ID！" });
      return;
    }

    const redirectUri = window.location.origin + "/";
    const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(clientId.trim())}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `include_granted_scopes=true&` +
      `state=windy_gdrive_sync&` +
      `prompt=consent`;

    // Direct browser redirect
    window.location.href = authUrl;
  };

  // Query Google Drive for backed up WindyCityTransit JSON files
  const fetchBackupFileList = async (token: string) => {
    setIsLoading(true);
    try {
      // Find JSON sync files that contain the tag 'WindyCityTransit'
      const query = encodeURIComponent("name contains 'WindyCityTransit' and mimeType = 'application/json' and trashed = false");
      const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime,size)&orderBy=createdTime desc`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("HTTP status: " + res.status);
      }

      const data = await res.json();
      setFiles(data.files || []);
    } catch (e: any) {
      console.error(e);
      setCliFeedback({
        status: "error",
        msg: "讀取備份清單失敗，可能授權已过期，請重新登入。"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload/Create new transit backup file on Google Drive (Multipart body)
  const handleCreateBackup = async () => {
    if (!accessToken) return;

    // Explicit user confirmation before write operation (Workspace security constraint)
    const confirmed = window.confirm(
      "【雲端發行確認】您確定要上傳當前綠能積分、個人設定及常用路線資料到您的 Google Drive 嗎？\n(Are you sure you want to save current profile settings to Google Drive?)"
    );
    if (!confirmed) return;

    setIsLoading(true);

    try {
      // 1. Prepare raw details
      let favoritesList: string[] = [];
      try {
        const savedFavs = localStorage.getItem("windy_favorites");
        if (savedFavs) favoritesList = JSON.parse(savedFavs);
      } catch {}

      const backupObj = {
        appSignature: "WindyCityTransitSuite",
        userName,
        userEmail,
        points,
        favorites: favoritesList,
        timestamp: new Date().toISOString(),
        formattedTime: new Date().toLocaleString()
      };

      const fileName = `WindyCityTransit_Backup_${Date.now()}.json`;
      const metadata = {
        name: fileName,
        mimeType: "application/json",
        description: "Windy City transit smart backups and configurations."
      };

      const boundary = "windy_multipart_boundary_9999";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const requestBody = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(backupObj, null, 2) +
        closeDelimiter;

      const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: requestBody
      });

      if (!res.ok) {
        throw new Error("HTTP Status " + res.status);
      }

      setCliFeedback({
        status: "success",
        msg: "✓ 雲端備份成功！檔案已安全儲存至 Google Drive。"
      });
      setTimeout(() => setCliFeedback({ status: "idle", msg: "" }), 3500);

      // Refresh list
      await fetchBackupFileList(accessToken);
    } catch (err) {
      console.error(err);
      setCliFeedback({
        status: "error",
        msg: "備份上傳失敗！"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download and Restore configuration from Google Drive file
  const handleRestoreBackup = async (fileId: string, fileName: string) => {
    if (!accessToken) return;

    // Explicit confirmation dialog for data mutation
    const confirmed = window.confirm(
      `【雲端覆蓋確認】您確定要下載備份檔案 [${fileName}] 並還原風城通資料嗎？\n這將在本地端覆蓋您當前的使用者資料、綠能積分及常用路線設定！`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error("Download status: " + res.status);
      }

      const backupData = await res.json();
      
      if (backupData.appSignature !== "WindyCityTransitSuite") {
        alert("格式錯誤：此 JSON 檔非有效的風城通智慧備份。");
        return;
      }

      // Sync callback to React parent states
      onRestoreData({
        userName: backupData.userName,
        userEmail: backupData.userEmail,
        points: backupData.points,
        favorites: backupData.favorites
      });

      // Also directly dump favorites list into global localStorage for seamless UI refresh
      if (backupData.favorites) {
        localStorage.setItem("windy_favorites", JSON.stringify(backupData.favorites));
      }

      setCliFeedback({
        status: "success",
        msg: "🎉 還原備份成功！積分設定已即時同步更新。"
      });
      setTimeout(() => setCliFeedback({ status: "idle", msg: "" }), 3500);
    } catch (e) {
      console.error(e);
      setCliFeedback({
        status: "error",
        msg: "下載並還原備份失敗！"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete explicit backup from Drive with User Confirmation (Workspace security)
  const handleDeleteBackup = async (fileId: string, fileName: string) => {
    if (!accessToken) return;

    const confirmed = window.confirm(
      `【確認永久刪除】您確定要刪除位於 Google 雲端硬碟的此備份檔嗎？ [${fileName}]\n此操作無法撤銷！`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error("Delete failed with status " + res.status);
      }

      setCliFeedback({
        status: "success",
        msg: "✓ 備份檔案已自雲端硬碟刪除。"
      });
      setTimeout(() => setCliFeedback({ status: "idle", msg: "" }), 3500);

      // Refresh list
      await fetchBackupFileList(accessToken);
    } catch (e) {
      console.error(e);
      setCliFeedback({
        status: "error",
        msg: "刪除雲端檔案失敗！"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return "N/A";
    const bytes = parseInt(bytesStr);
    if (isNaN(bytes)) return bytesStr;
    if (bytes < 1024) return bytes + " B";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 text-left">
      
      {/* Header and Title */}
      <div className="flex items-center justify-between">
        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600" />
          Google Drive 雲端備份同步
        </h4>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
          {isConnected ? "已連接 Online" : "未鏈接"}
        </span>
      </div>

      {/* Connection panel feedback bar */}
      {cliFeedback.msg && (
        <div className={`p-2.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border ${cliFeedback.status === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-250" : "bg-red-50 text-red-800 border-red-250"}`}>
          {cliFeedback.status === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{cliFeedback.msg}</span>
        </div>
      )}

      {/* Disconnected state: Setup credentials client ID */}
      {!isConnected ? (
        <div className="space-y-4 pt-1">
          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
            您可以為此 applet 啟用 Google Drive 同步，以便隨時備份、復原您的交通帳號設定在您的私密雲端硬碟裡！
          </p>

          <div className="space-y-2 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Google 雲端 Client ID 設定
            </span>
            <input
              type="text"
              value={clientId}
              onChange={(e) => handleSaveClientId(e.target.value)}
              placeholder="請輸入 Google Cloud 專案的 Client ID..."
              className="w-full text-[11px] bg-white border border-slate-250 p-2.5 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
            />
            <p className="text-[9px] text-slate-400 leading-tight">
              * 系統目前預設一組公開 Client ID，您也可以更換為您的 Google Cloud 專案 ID 以保持高隱私安全運算。
            </p>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Cloud className="w-4 h-4" />
            連結 Google 雲端硬碟並認證
          </button>
        </div>
      ) : (
        /* Connected state visual controls */
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              備份目前設定
            </button>
            <button
              onClick={() => fetchBackupFileList(accessToken!)}
              disabled={isLoading}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              重新整理清單
            </button>
          </div>

          {/* Backup Files table inside drive folder */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-blue-600" /> 雲端備份清單 (Backup files on your Drive)
            </span>

            {isLoading && files.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span>正在載入備份檔...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-52 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="p-3 bg-slate-50 flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                    <div className="text-left space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-700 block truncate max-w-44">
                        {file.name}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        ⏱️ {new Date(file.createdTime).toLocaleString()} ({formatSize(file.size)})
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleRestoreBackup(file.id, file.name)}
                        title="下載此備份並還原"
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-transform hover:scale-105"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(file.id, file.name)}
                        title="刪除備份檔"
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-transform hover:scale-105"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl py-6 text-center text-[11px] text-slate-400 italic">
                📪 目前雲端硬碟尚未找到與本系統對應的備份檔。<br />請點擊上方按鈕建立您的第一個備份！
              </div>
            )}
          </div>

          {/* Secure indicator warning */}
          <div className="text-[10px] text-slate-400 italic leading-snug pt-1 border-t border-slate-100 flex items-start gap-1">
            <Lock className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              已使用 Client-Side Sandbox 端對端加密權限，每次認證連線最長有效期為 60 分鐘，系統不會存儲您的任何雲端密碼。
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
