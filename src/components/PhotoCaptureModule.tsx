import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  X,
  FlipHorizontal,
  Clock,
} from 'lucide-react';
import { PRESET_OUTFITS } from '../data/presets';
import { StylistPreset } from '../types/stylist';

interface PhotoCaptureModuleProps {
  onPhotoSelected: (
    photoBase64: string,
    preferences: { occasion: string; goal: string; genderVibe: string }
  ) => void;
  isLoading: boolean;
}

export const PhotoCaptureModule: React.FC<PhotoCaptureModuleProps> = ({
  onPhotoSelected,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'presets'>('presets');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // User Styling Preferences
  const [occasion, setOccasion] = useState('職場通勤 / 商務聚會');
  const [goal, setGoal] = useState('顯瘦修身、提升整體質感氣場');
  const [genderVibe, setGenderVibe] = useState('時髦俐落 (Modern Tailored)');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  // Start Camera
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('無法存取相機，請檢查瀏覽器相機權限或使用相片上傳功能。');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, cameraFacing]);

  // Take Snapshot
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual flash
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPreviewImage(dataUrl);
    stopCamera();
  };

  // Countdown timer snapshot
  const triggerCountdownSnapshot = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Select Preset Outfit
  const handleSelectPreset = (preset: StylistPreset) => {
    setPreviewImage(preset.thumbnail);
    setOccasion(preset.occasion);
    setGoal(preset.description);
  };

  // Submit for AI Analysis
  const handleAnalyze = () => {
    if (!previewImage) return;
    onPhotoSelected(previewImage, {
      occasion,
      goal,
      genderVibe,
    });
  };

  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Tab Navigation */}
      <div className="flex border-b border-stone-800 bg-stone-950/70">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-3.5 px-4 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'presets'
              ? 'text-amber-300 border-b-2 border-amber-500 bg-amber-500/10 font-bold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>時髦樣例 (推薦即時體驗)</span>
        </button>

        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-3.5 px-4 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'camera'
              ? 'text-amber-300 border-b-2 border-amber-500 bg-amber-500/10 font-bold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>開啟相機拍照</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3.5 px-4 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'upload'
              ? 'text-amber-300 border-b-2 border-amber-500 bg-amber-500/10 font-bold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <Upload className="w-4 h-4 text-amber-400" />
          <span>上傳穿搭照片</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* TAB 1: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                點選下方精選秀場與街拍示範，即可一鍵診斷：
              </span>
              <span className="text-xs text-stone-400">點擊卡片選取</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {PRESET_OUTFITS.map((preset) => {
                const isSelected = previewImage === preset.thumbnail;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.02] shadow-lg'
                        : 'border-stone-800 hover:border-amber-500/50 bg-stone-950'
                    }`}
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-stone-950">
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-stone-950 p-1 rounded-full shadow">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <div className="p-2.5 bg-stone-950/90 border-t border-stone-800/80">
                      <h4 className="font-bold text-xs text-stone-200 truncate">{preset.name}</h4>
                      <p className="text-[11px] text-amber-400/90 truncate">{preset.style}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CAMERA */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm text-center">
                {cameraError}
              </div>
            ) : (
              <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-inner flex items-center justify-center">
                {/* Video Element */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Silhouette Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-30">
                  <div className="w-48 h-80 border-2 border-dashed border-amber-300/80 rounded-[40px] flex items-center justify-center">
                    <span className="text-xs text-amber-300 font-mono tracking-widest bg-stone-950/70 px-2 py-0.5 rounded">
                      人體全身/半身引導線
                    </span>
                  </div>
                </div>

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center z-20">
                    <span className="text-7xl font-bold font-serif text-amber-300 animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Flash Effect */}
                {flash && <div className="absolute inset-0 bg-white z-30 transition-opacity" />}

                {/* Camera In-Screen Controls */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-10">
                  {/* Flip Camera */}
                  <button
                    onClick={() =>
                      setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'))
                    }
                    className="p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700 transition"
                    title="切換前後鏡頭"
                  >
                    <FlipHorizontal className="w-5 h-5" />
                  </button>

                  {/* Main Shutter Button */}
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 p-1 shadow-2xl active:scale-95 transition flex items-center justify-center border-4 border-stone-950"
                    title="立即拍照"
                  >
                    <div className="w-full h-full rounded-full border-2 border-stone-950 bg-amber-400" />
                  </button>

                  {/* 3s Countdown Timer */}
                  <button
                    onClick={triggerCountdownSnapshot}
                    className="p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700 transition"
                    title="3 秒定時自拍"
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FILE UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-stone-700 hover:border-amber-500/60 rounded-2xl cursor-pointer bg-stone-950/60 hover:bg-stone-900/50 transition p-6 text-center group">
              <Upload className="w-10 h-10 text-stone-400 group-hover:text-amber-400 transition mb-3" />
              <span className="text-sm font-semibold text-stone-200 group-hover:text-amber-200">
                點擊上傳或拖放穿搭相片
              </span>
              <span className="text-xs text-stone-500 mt-1">
                支援 JPG、PNG、WEBP 格式高解析度全身或半身照
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Selected Image Preview & Styling Preferences Form */}
        {previewImage && (
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Thumbnail */}
              <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-amber-500/50 shadow-md flex-shrink-0">
                <img
                  src={previewImage}
                  alt="預覽穿搭"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-stone-950/80 text-stone-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preferences Configuration */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {/* Occasion */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    穿搭場合 (Occasion)
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full rounded-lg bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="職場通勤 / 商務展覽">職場通勤 / 商務展覽</option>
                    <option value="週末日常 / 咖啡休閒">週末日常 / 咖啡休閒</option>
                    <option value="浪漫約會 / 晚宴聚餐">浪漫約會 / 晚宴聚餐</option>
                    <option value="時裝展覽 / 潮流派對">時裝展覽 / 潮流派對</option>
                    <option value="機場穿搭 / 度假旅行">機場穿搭 / 度假旅行</option>
                  </select>
                </div>

                {/* Styling Goal */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    剪裁美學目標 (Goal)
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-lg bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="顯瘦修身、拉長身形黃金比例">顯瘦修身、拉長黃金比例</option>
                    <option value="低調奢華、展現老錢高質感">低調奢華、展現老錢質感</option>
                    <option value="摩登俐落、氣場全開大女主/男主">摩登俐落、大女主/大男主氣場</option>
                    <option value="鬆弛自然、法式漫不經心時髦">鬆弛自然、法式漫不經心</option>
                    <option value="突破常規、大膽撞色與潮流層次">大膽撞色與先鋒層次</option>
                  </select>
                </div>

                {/* Vibe */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    偏好氣質 (Vibe)
                  </label>
                  <select
                    value={genderVibe}
                    onChange={(e) => setGenderVibe(e.target.value)}
                    className="w-full rounded-lg bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="時髦俐落 (Modern Tailored)">時髦俐落 (Modern Tailored)</option>
                    <option value="極簡優雅 (Clean & Quiet)">極簡優雅 (Clean & Quiet)</option>
                    <option value="街頭率性 (Street & Cool)">街頭率性 (Street & Cool)</option>
                    <option value="文藝復古 (Retro Academic)">文藝復古 (Retro Academic)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Analyze Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>時裝總監 AI 深度評分中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-stone-950" />
                    <span>即刻生成 造型評分與 Canvas 儀表板</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
