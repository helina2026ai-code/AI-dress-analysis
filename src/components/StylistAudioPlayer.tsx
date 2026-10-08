import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Mic, Loader2 } from 'lucide-react';
import { StylistAudioController } from '../utils/audio';
import { IS_STATIC_DEMO, getApiUrl } from '../config';

interface StylistAudioPlayerProps {
  spokenCritique: string;
  stylistName?: string;
  autoPlay?: boolean;
}

export const StylistAudioPlayer: React.FC<StylistAudioPlayerProps> = ({
  spokenCritique,
  stylistName = '巴黎造型總監 (Vogue Senior Stylist)',
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Zephyr' | 'Fenrir'>('Kore');
  const [audioCachedUrl, setAudioCachedUrl] = useState<string | null>(null);
  const useBrowserTTS = IS_STATIC_DEMO;

  const audioControllerRef = useRef<StylistAudioController | null>(null);

  // Initialize Audio Controller
  useEffect(() => {
    audioControllerRef.current = new StylistAudioController((speaking) => {
      setIsPlaying(speaking);
    });

    return () => {
      audioControllerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    audioControllerRef.current?.stop();
    setAudioCachedUrl(null);
  }, [spokenCritique]);

  // Fetch Gemini TTS Audio
  const fetchTtsAudio = async (text: string, voice: string): Promise<string | null> => {
    try {
      setIsLoadingAudio(true);
      const res = await fetch(getApiUrl('/api/stylist/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: voice }),
      });

      if (!res.ok) {
        throw new Error('TTS service returned non-200');
      }

      const data = await res.json();
      if (data.audioData) {
        return data.audioData;
      }
      return null;
    } catch (err) {
      console.warn('Gemini TTS fetch failed, will fallback to browser speech:', err);
      return null;
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Play audio critique
  const handlePlay = async () => {
    if (!spokenCritique) return;

    if (isPlaying) {
      audioControllerRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    if (useBrowserTTS) {
      // Browser Web Speech
      audioControllerRef.current?.speakWithWebSpeech(spokenCritique, 'zh-TW');
      return;
    }

    // Try Gemini TTS first
    let audioUrl = audioCachedUrl;
    if (!audioUrl) {
      audioUrl = await fetchTtsAudio(spokenCritique, selectedVoice);
      if (audioUrl) {
        setAudioCachedUrl(audioUrl);
      }
    }

    if (audioUrl) {
      try {
        await audioControllerRef.current?.playAudioData(audioUrl);
      } catch (e) {
        console.warn('Audio element failed, falling back to Web Speech API:', e);
        audioControllerRef.current?.speakWithWebSpeech(spokenCritique, 'zh-TW');
      }
    } else {
      // Graceful fallback to browser speech synthesis
      audioControllerRef.current?.speakWithWebSpeech(spokenCritique, 'zh-TW');
    }
  };

  const handleStop = () => {
    audioControllerRef.current?.stop();
    setIsPlaying(false);
  };

  const handleVoiceChange = (voice: 'Kore' | 'Zephyr' | 'Fenrir') => {
    setSelectedVoice(voice);
    setAudioCachedUrl(null); // Clear cache so new voice is generated
    if (isPlaying) {
      handleStop();
    }
  };

  // Autoplay trigger on load if desired
  useEffect(() => {
    if (autoPlay && spokenCritique) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [spokenCritique, autoPlay]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-amber-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Speaker Identity & Spoken Text */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Mic className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif text-sm font-bold text-amber-300 tracking-wide">
              {stylistName}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
              {IS_STATIC_DEMO ? '瀏覽器朗讀' : 'AI 語音講評'}
            </span>
          </div>

          {/* Spoken Quote Box */}
          <div className="relative pl-3.5 border-l-2 border-amber-500/60 py-1">
            <p className="text-sm sm:text-base font-medium text-stone-100 leading-relaxed tracking-wide">
              {spokenCritique || '請上傳或拍攝穿搭照片，專屬造型總監將為您即時語音點評。'}
            </p>
          </div>
        </div>

        {/* Right: Controls & Dynamic Equalizer Waves */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Animated Audio Equalizer Waveform */}
          <div className="flex items-center gap-1 h-8 px-2.5 py-1 rounded-xl bg-stone-950/70 border border-stone-800/80">
            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((height, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlaying
                    ? 'bg-amber-400'
                    : 'bg-stone-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (height * (0.4 + (i % 3) * 0.3)))}%` : '20%',
                  animation: isPlaying ? `pulse 0.7s infinite alternate ease-in-out ${i * 0.08}s` : 'none',
                }}
              />
            ))}
          </div>

          {/* Voice Persona Selector */}
          {!IS_STATIC_DEMO && (
          <div className="flex items-center bg-stone-950/80 rounded-xl p-1 border border-stone-800 text-xs">
            <button
              onClick={() => handleVoiceChange('Kore')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                selectedVoice === 'Kore'
                  ? 'bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="法式高雅女聲"
            >
              法式優雅 (Kore)
            </button>
            <button
              onClick={() => handleVoiceChange('Zephyr')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                selectedVoice === 'Zephyr'
                  ? 'bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="倫敦前衛中性聲"
            >
              倫敦前衛 (Zephyr)
            </button>
            <button
              onClick={() => handleVoiceChange('Fenrir')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                selectedVoice === 'Fenrir'
                  ? 'bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="深沉權威顧問聲"
            >
              沉穩權威 (Fenrir)
            </button>
          </div>
          )}

          {/* Action Button: Play / Pause */}
          <button
            onClick={handlePlay}
            disabled={isLoadingAudio || !spokenCritique}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>生成語音中...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>暫停朗讀</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>語音講評</span>
              </>
            )}
          </button>

          {/* Replay Button */}
          {isPlaying && (
            <button
              onClick={handleStop}
              className="p-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition"
              title="停止朗讀"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
