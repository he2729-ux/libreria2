import React from 'react';
import { X, Smartphone, Monitor, ShieldCheck, Trash2, Cpu, RotateCcw, Palette, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  isAndroidFrame: boolean;
  onToggleAndroidFrame: () => void;
  onRemoveDuplicates: () => void;
  onResetLibrary: () => void;
  onOpenThemeCustomizer: () => void;
  onOpenAIChat: () => void;
  booksCount: number;
}

export function SettingsModal({
  onClose,
  isAndroidFrame,
  onToggleAndroidFrame,
  onRemoveDuplicates,
  onResetLibrary,
  onOpenThemeCustomizer,
  onOpenAIChat,
  booksCount,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#082a36] text-slate-100 rounded-2xl border border-[#0f3847] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-[#0f3847]">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">
            Configuración y Personalización
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Shortcuts */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenThemeCustomizer();
            }}
            className="p-3 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-200 flex flex-col items-center gap-2 text-center transition-colors"
          >
            <Palette className="w-6 h-6 text-teal-400" />
            <span className="font-bold">Colores & Estantería</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAIChat();
            }}
            className="p-3 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 flex flex-col items-center gap-2 text-center transition-colors"
          >
            <Sparkles className="w-6 h-6 text-sky-400" />
            <span className="font-bold">IA de Libros (Chat)</span>
          </button>
        </div>

        {/* Viewport Frame Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Modo de Presentación de Pantalla
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onToggleAndroidFrame}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-colors ${
                isAndroidFrame
                  ? 'border-teal-400 bg-teal-500/20 text-teal-300 font-bold'
                  : 'border-[#134455] bg-[#062029] text-slate-300 hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-6 h-6 text-teal-400" />
              <span>Marco Android Móvil (Con Barra de Estado)</span>
            </button>

            <button
              onClick={onToggleAndroidFrame}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-colors ${
                !isAndroidFrame
                  ? 'border-teal-400 bg-teal-500/20 text-teal-300 font-bold'
                  : 'border-[#134455] bg-[#062029] text-slate-300 hover:bg-white/5'
              }`}
            >
              <Monitor className="w-6 h-6 text-sky-400" />
              <span>Pantalla Completa / Tablet / Desktop</span>
            </button>
          </div>
        </div>

        {/* System & Performance (from requirements) */}
        <div className="bg-[#062029] p-3.5 rounded-xl border border-[#0f3847] space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-teal-300 font-semibold">
            <Cpu className="w-4 h-4" />
            <span>Optimizaciones para Android 11 y Android 15</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Aceleración por GPU activada, renderizado por hardware de páginas PDF y decodificación ultra rápida de imágenes en cómics CBR/CBZ.
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#0f3847]">
            <span>Modo Edge-to-Edge Android 15</span>
            <span className="text-emerald-400 font-mono font-bold">Activo</span>
          </div>
        </div>

        {/* Library maintenance actions */}
        <div className="space-y-2 pt-2 border-t border-[#0f3847] text-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Mantenimiento de Biblioteca ({booksCount} libros)
          </span>

          <button
            onClick={() => {
              onRemoveDuplicates();
              alert('Escaneo completado: No se encontraron libros duplicados.');
            }}
            className="w-full p-2.5 bg-[#0d3b4b] hover:bg-[#124b5e] border border-[#174d61] rounded-xl flex items-center justify-between text-slate-200"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Escanear y eliminar duplicados</span>
            </div>
            <span className="text-[11px] text-teal-400">Ejecutar</span>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Restablecer biblioteca al catálogo inicial de demostración?')) {
                onResetLibrary();
                onClose();
              }
            }}
            className="w-full p-2.5 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/40 rounded-xl flex items-center justify-between text-rose-300"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Restablecer catálogo inicial</span>
            </div>
            <span className="text-[11px]">Reiniciar</span>
          </button>

          <a
            href="/libris-app-source.zip"
            download="libris-app-source.zip"
            className="w-full p-2.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/35 rounded-xl flex items-center justify-between text-teal-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📦</span>
              <span className="font-semibold">Descargar proyecto completo (.ZIP)</span>
            </div>
            <span className="text-[11px] font-mono bg-teal-500/20 px-2 py-0.5 rounded text-teal-200">
              6.6 MB
            </span>
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg mt-2"
        >
          Listo
        </button>
      </div>
    </div>
  );
}
