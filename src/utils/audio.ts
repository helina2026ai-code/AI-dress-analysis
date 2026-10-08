// Audio utility for Stylist Voice Critique

export class StylistAudioController {
  private audio: HTMLAudioElement | null = null;
  private isSpeaking = false;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  constructor(onStateChange?: (speaking: boolean) => void) {
    this.onStateChange = onStateChange || null;
  }

  // Play audio from Gemini TTS base64 or URL
  async playAudioData(audioSrc: string): Promise<void> {
    this.stop();
    return new Promise((resolve, reject) => {
      this.audio = new Audio(audioSrc);
      this.isSpeaking = true;
      this.onStateChange?.(true);

      this.audio.onended = () => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        resolve();
      };

      this.audio.onerror = (e) => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        reject(e);
      };

      this.audio.play().catch((err) => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        reject(err);
      });
    });
  }

  // Web Speech API fallback if Gemini TTS fails or offline
  speakWithWebSpeech(text: string, lang = 'zh-TW', rate = 1.0, pitch = 1.0): Promise<void> {
    this.stop();
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in browser');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.lang.includes('zh') || v.lang.includes('cmn')) && !v.name.includes('Google')
      ) || voices.find((v) => v.lang.includes('zh'));
      if (preferred) utterance.voice = preferred;

      this.isSpeaking = true;
      this.onStateChange?.(true);

      utterance.onend = () => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  getSpeaking(): boolean {
    return this.isSpeaking;
  }
}
