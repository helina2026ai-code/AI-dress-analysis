import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Camera,
  Shirt,
  Volume2,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  CheckCircle,
} from 'lucide-react';
import { StylistAnalysis } from './types/stylist';
import { INITIAL_SAMPLE_ANALYSIS } from './data/sampleAnalysis';
import { PRESET_OUTFITS } from './data/presets';
import { FashionCanvasDashboard } from './components/FashionCanvasDashboard';
import { StylistAudioPlayer } from './components/StylistAudioPlayer';
import { PhotoCaptureModule } from './components/PhotoCaptureModule';
import { DiagnosticTabs } from './components/DiagnosticTabs';
import { IS_STATIC_DEMO, getApiUrl } from './config';

export default function App() {
  const [currentImage, setCurrentImage] = useState<string>(PRESET_OUTFITS[0].thumbnail);
  const [analysis, setAnalysis] = useState<StylistAnalysis>(INITIAL_SAMPLE_ANALYSIS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [showPhotoSection, setShowPhotoSection] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // Trigger celebratory confetti for top scores
  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#eab308', '#fef08a', '#d97706', '#fafaf9'],
    });
  };

  // Handle Photo Analysis Submission
  const handlePhotoSelected = async (
    photoBase64: string,
    preferences: { occasion: string; goal: string; genderVibe: string }
  ) => {
    if (IS_STATIC_DEMO) {
      setErrorMessage('目前為展示模式，照片分析尚未啟用。');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(getApiUrl('/api/stylist/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoBase64,
          occasion: preferences.occasion,
          goal: preferences.goal,
          genderVibe: preferences.genderVibe,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '分析服務暫時無回應，請重試。');
      }

      const data: StylistAnalysis = await response.json();
      setAnalysis(data);
      setCurrentImage(data.processedImage || photoBase64);
      setShowPhotoSection(false); // Collapse photo picker so dashboard takes center stage
      setAutoPlayAudio(true);

      if (data.overallScore >= 85) {
        triggerConfetti();
      }
    } catch (err: any) {
      console.error('Stylist analysis error:', err);
      setErrorMessage(err.message || '分析失敗，請檢查照片或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Editorial Navigation */}
      <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-black">
              <Shirt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-black tracking-widest text-lg sm:text-xl text-stone-100">
                  VOGUE STYLIST
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  AI 造型總監
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                {IS_STATIC_DEMO
                  ? '穿搭診斷範例 • 圖文並茂 Canvas 儀表板 • 瀏覽器語音朗讀'
                  : '拍照即時評分 • 圖文並茂 Canvas 儀表板 • 秀場級語音講評'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowPhotoSection((prev) => !prev)}
              disabled={IS_STATIC_DEMO}
              title={IS_STATIC_DEMO ? '展示模式尚未啟用照片分析' : undefined}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                showPhotoSection
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                  : 'bg-stone-900 hover:bg-stone-850 text-amber-300 border-amber-500/40 hover:border-amber-400'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{IS_STATIC_DEMO ? 'AI 分析尚未啟用' : showPhotoSection ? '收起相機面板' : '拍攝 / 換穿搭'}</span>
              {showPhotoSection ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {IS_STATIC_DEMO && (
          <div role="status" className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-sm">
            展示模式：以下為預先提供的穿搭範例，可瀏覽診斷卡片、匯出圖片並以瀏覽器朗讀；照片分析尚未啟用。
          </div>
        )}
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs underline text-red-300 ml-4 hover:text-white"
            >
              關閉
            </button>
          </div>
        )}

        {/* Loading Overlay / Progress Notice */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 to-amber-950/40 border border-amber-500/40 text-center space-y-3 animate-pulse shadow-xl">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <h3 className="font-serif font-bold text-lg text-amber-200">
                高級時裝總監正在為您進行專業造型診斷...
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
              正在萃取衣服光影與微觀色票、計算六角美學雷達圖、檢視版型比例，並生成專屬語音講評腳本。
            </p>
          </div>
        )}

        {/* SECTION 1: PHOTO CAPTURE / UPLOAD MODULE (Collapsible or Initial) */}
        {showPhotoSection && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>請選擇拍照、上傳或點選時髦示範樣例：</span>
              </h2>
            </div>
            <PhotoCaptureModule
              onPhotoSelected={handlePhotoSelected}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* SECTION 2: AUDIO STYLIST CRITIQUE PLAYER */}
        <div className="w-full">
          <StylistAudioPlayer
            spokenCritique={analysis.spokenCritique}
            stylistName="巴黎高訂造型總監 (Senior Fashion Director)"
            autoPlay={autoPlayAudio}
          />
        </div>

        {/* SECTION 3: THE RICH DYNAMIC CANVAS DASHBOARD */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-100 tracking-wide">
                造型診斷雜誌卡片 (Canvas 視覺化儀表板)
              </h2>
            </div>
            <span className="text-xs text-amber-400/90 hidden sm:inline">
              ★ 支援高解析度 1200x1500 PNG 匯出下載
            </span>
          </div>

          <FashionCanvasDashboard
            imageSrc={currentImage}
            analysis={analysis}
            activeItemIndex={activeItemIndex}
            onSelectItem={(idx) => setActiveItemIndex(idx)}
          />
        </div>

        {/* SECTION 4: IN-DEPTH DIAGNOSTIC TABS */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif font-bold text-base text-stone-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>深度穿搭洞察與升級指南</span>
            </h3>
            <span className="text-xs text-stone-400">
              點擊單品可與上方 Canvas 連動
            </span>
          </div>

          <DiagnosticTabs
            analysis={analysis}
            onHighlightItem={(idx) => setActiveItemIndex(idx)}
            activeItemIndex={activeItemIndex}
          />
        </div>

        {/* SECTION 5: QUICK PRESET CAROUSEL FOOTER (for immediate switching anytime) */}
        {!showPhotoSection && !IS_STATIC_DEMO && (
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>快速切換秀場示範穿搭：</span>
              </span>
              <button
                onClick={() => setShowPhotoSection(true)}
                className="text-xs text-amber-400 hover:text-amber-300 hover:underline"
              >
                或拍照/上傳自己照片 →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {PRESET_OUTFITS.map((p) => {
                const isActive = currentImage === p.thumbnail;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      handlePhotoSelected(p.thumbnail, {
                        occasion: p.occasion,
                        goal: p.description,
                        genderVibe: p.style,
                      });
                    }}
                    disabled={isLoading}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/40 text-stone-100'
                        : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-10 h-12 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{p.style}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 px-4 py-6 text-center text-xs text-stone-500 space-y-2">
        <p className="font-serif tracking-widest text-stone-400 uppercase">
          Vogue AI Stylist Studio • Haute Couture Aesthetic Engine
        </p>
        <p>
          {IS_STATIC_DEMO
            ? '展示版提供穿搭診斷範例與瀏覽器語音朗讀 • AI 照片分析服務尚未啟用'
            : '結合 Gemini 3.8 Flash 多模態視覺分析與 Gemini TTS 語音朗讀 • 打造動態圖文並茂的 Canvas 造型評分體驗'}
        </p>
        <p className="text-stone-400">hollow world</p>
        <a
          href="https://huggingface.co/spaces/HelinaChang/AI_Dress_analysis"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-amber-400 hover:text-amber-300 hover:underline"
        >
          前往 Hugging Face：AI Dress Analysis
        </a>
      </footer>
    </div>
  );
}
