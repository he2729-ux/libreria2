import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, FastForward, Star, Settings2, X } from 'lucide-react';
import { TTSSettings } from '../types/reader';

interface TTSPlayerBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  voices: SpeechSynthesisVoice[];
  settings: TTSSettings;
  onUpdateRate: (rate: number) => void;
  onSelectVoice: (voiceUri: string) => void;
  onToggleFavoriteVoice: (voiceUri: string) => void;
  onUpdateSettings: (s: Partial<TTSSettings>) => void;
}

export function TTSPlayerBar({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  voices,
  settings,
  onUpdateRate,
  onSelectVoice,
  onToggleFavoriteVoice,
  onUpdateSettings,
}: TTSPlayerBarProps) {
  const [showConfig, setShowConfig] = useState(false);

  if (!isPlaying && !isPaused) return null;

  return (
    <div className="fixed bottom-12 inset-x-2 sm:inset-x-auto sm:right-6 sm:w-96 z-50 bg-[#062029]/95 backdrop-blur-md border border-teal-500/40 rounded-2xl shadow-2xl p-3 text-slate-100 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Play / Pause button */}
        <div className="flex items-center gap-2">
          {isPlaying && !isPaused ? (
            <button
              onClick={onPause}
              className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center hover:bg-teal-400 active:scale-95 shadow-md"
              title="Pausar lectura"
            >
              <Pause className="w-5 h-5 fill-slate-950" />
            </button>
          ) : (
            <button
              onClick={onResume}
              className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center hover:bg-teal-400 active:scale-95 shadow-md"
              title="Continuar lectura"
            >
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            </button>
          )}

          <button
            onClick={onStop}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center active:scale-95"
            title="Detener lectura"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Speed indicator & presets */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs">
            <Volume2 className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span className="font-semibold text-teal-300 font-mono">{settings.rate}x</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[0.8, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => onUpdateRate(rate)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  settings.rate === rate
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Config and Close */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowConfig((p) => !p)}
            className="p-2 text-slate-400 hover:text-white rounded-lg active:bg-white/10"
            title="Ajustes de Voz TTS"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={onStop}
            className="p-2 text-slate-400 hover:text-white rounded-lg active:bg-white/10"
            title="Cerrar reproductor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded TTS Configuration Modal */}
      {showConfig && (
        <div className="mt-3 pt-3 border-t border-[#0f3847] space-y-3 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 font-semibold">Velocidad Extendida (0.1x a 4.0x):</span>
              <span className="font-mono text-teal-300 font-bold">{settings.rate}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.05"
              value={settings.rate}
              onChange={(e) => onUpdateRate(Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-[#0d3b4b] rounded-lg"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Voz de Síntesis del Sistema:
            </label>
            <div className="max-h-28 overflow-y-auto space-y-1 bg-[#041a22] p-1.5 rounded-lg border border-[#0f3847]">
              {voices.map((v) => {
                const isFav = settings.favoriteVoices.includes(v.voiceURI);
                const isSelected = settings.voiceUri === v.voiceURI;
                return (
                  <div
                    key={v.voiceURI}
                    onClick={() => onSelectVoice(v.voiceURI)}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer ${
                      isSelected ? 'bg-teal-500/20 text-teal-300 font-bold' : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="truncate text-[11px]">
                      {v.name} ({v.lang})
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavoriteVoice(v.voiceURI);
                      }}
                      className="p-1 hover:text-amber-400"
                    >
                      <Star className={`w-3 h-3 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300 text-[11px]">Omitir encabezados y números de página</span>
            <input
              type="checkbox"
              checked={settings.skipHeadersFooters}
              onChange={(e) => onUpdateSettings({ skipHeadersFooters: e.target.checked })}
              className="accent-teal-400 w-3.5 h-3.5"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-[11px]">Leer notas al pie</span>
            <input
              type="checkbox"
              checked={settings.readFootnotes}
              onChange={(e) => onUpdateSettings({ readFootnotes: e.target.checked })}
              className="accent-teal-400 w-3.5 h-3.5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
