import { useState, useEffect, useRef, useCallback } from 'react';
import { TTSSettings } from '../types/reader';

export function useTTS(initialSettings?: Partial<TTSSettings>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [settings, setSettings] = useState<TTSSettings>({
    rate: 1.0,
    pitch: 1.0,
    voiceUri: '',
    favoriteVoices: [],
    skipHeadersFooters: true,
    readFootnotes: true,
    activeLanguage: 'es',
    ...initialSettings,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail.length > 0) {
        setVoices(avail);
        // Default to a Spanish voice if available and voiceUri not set
        if (!settings.voiceUri) {
          const esVoice = avail.find(v => v.lang.startsWith('es')) || avail[0];
          if (esVoice) {
            setSettings(prev => ({ ...prev, voiceUri: esVoice.voiceURI }));
          }
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Clean text according to settings (e.g., skip headers / markdown hash marks)
    let processed = textToSpeak;
    if (settings.skipHeadersFooters) {
      // Remove lines starting with # or page numbers
      processed = processed
        .split('\n')
        .filter(line => !line.trim().startsWith('#') && !/^\s*p[aá]g(ina)?\s*\d+\s*$/i.test(line))
        .join('\n');
    }

    // Strip markdown formatting symbols for speech
    processed = processed
      .replace(/[*_#`~>]/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    if (!processed) {
      processed = textToSpeak; // fallback if stripped too much
    }

    const utterance = new SpeechSynthesisUtterance(processed);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    if (settings.voiceUri) {
      const selected = voices.find(v => v.voiceURI === settings.voiceUri);
      if (selected) {
        utterance.voice = selected;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentText(processed);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [settings, voices]);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const updateRate = useCallback((newRate: number) => {
    const clamped = Math.max(0.1, Math.min(4.0, Number(newRate.toFixed(2))));
    setSettings(prev => ({ ...prev, rate: clamped }));
    // If speaking, restart with new rate
    if (isPlaying && !isPaused && utteranceRef.current) {
      speak(currentText);
    }
  }, [isPlaying, isPaused, currentText, speak]);

  const toggleFavoriteVoice = useCallback((uri: string) => {
    setSettings(prev => {
      const exists = prev.favoriteVoices.includes(uri);
      const updated = exists 
        ? prev.favoriteVoices.filter(v => v !== uri)
        : [...prev.favoriteVoices, uri];
      return { ...prev, favoriteVoices: updated };
    });
  }, []);

  return {
    isPlaying,
    isPaused,
    voices,
    settings,
    setSettings,
    speak,
    pause,
    resume,
    stop,
    updateRate,
    toggleFavoriteVoice,
  };
}
