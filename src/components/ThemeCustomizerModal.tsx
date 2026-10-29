import React, { useState } from 'react';
import { X, Palette, Sparkles, Check, Layers, Sliders, RotateCcw } from 'lucide-react';
import { AppThemeId, ShelfWoodId, APP_THEMES, SHELF_WOODS, CustomThemeColors, AppThemeConfig } from '../types/theme';

interface ThemeCustomizerModalProps {
  onClose: () => void;
  currentAppTheme: AppThemeId;
  currentShelfWood: ShelfWoodId;
  customColors: CustomThemeColors;
  onSelectAppTheme: (themeId: AppThemeId) => void;
  onSelectShelfWood: (woodId: ShelfWoodId) => void;
  onUpdateCustomColors: (colors: CustomThemeColors) => void;
}

export function ThemeCustomizerModal({
  onClose,
  currentAppTheme,
  currentShelfWood,
  customColors,
  onSelectAppTheme,
  onSelectShelfWood,
  onUpdateCustomColors,
}: ThemeCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [localColors, setLocalColors] = useState<CustomThemeColors>(customColors);

  const activeTheme = APP_THEMES[currentAppTheme] || APP_THEMES.petrol;
  const activeWood = SHELF_WOODS[currentShelfWood] || SHELF_WOODS.oak;

  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    const updated = { ...localColors, [key]: value };
    setLocalColors(updated);
    onUpdateCustomColors(updated);
    onSelectAppTheme('custom');
  };

  const handleResetCustomColors = () => {
    const defaults: CustomThemeColors = {
      bgCanvas: '#061720',
      bgCard: '#0d2836',
      headerBg: '#09212d',
      accent: '#2dd4bf',
      textPrimary: '#ffffff',
      shelfColor: '#78350f',
    };
    setLocalColors(defaults);
    onUpdateCustomColors(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl bg-[#082a36] text-slate-100 sm:rounded-2xl border border-[#0f3847] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-14 px-4 border-b border-[#0f3847] flex items-center justify-between shrink-0 bg-[#062029]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                Colores & Estantería
              </h2>
              <p className="text-[10px] text-teal-300/80">Personaliza fondos, tarjetas y acabado de estantes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Paletas Predefinidas vs Creador de Colores Propios */}
        <div className="flex border-b border-[#0f3847] bg-[#07242e] text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('preset')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'preset'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Paletas y Maderas Preestablecidas</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'custom'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Elegir Mis Propios Colores (Personalizado)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'preset' ? (
            <>
              {/* Preset Section 1: Color de Fondo y App */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Color de Fondo y Aplicación</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {currentAppTheme === 'custom' ? (
                      <span className="text-teal-300 font-bold">Personalizado activo</span>
                    ) : (
                      <span>Tema: <strong className="text-white">{activeTheme.name}</strong></span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(APP_THEMES) as AppThemeId[]).map((themeKey) => {
                    const theme = APP_THEMES[themeKey];
                    const isSelected = currentAppTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => onSelectAppTheme(themeKey)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-teal-400 ring-2 ring-teal-400/40 shadow-lg'
                            : 'border-[#134455] hover:border-slate-500/60'
                        }`}
                        style={{ backgroundColor: theme.bgSurface }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg shrink-0 border flex items-center justify-center shadow-inner relative overflow-hidden"
                            style={{
                              backgroundColor: theme.bgCanvas,
                              borderColor: theme.border,
                            }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>

                          <div className="min-w-0">
                            <span
                              className="text-xs font-bold block truncate"
                              style={{ color: theme.textPrimary }}
                            >
                              {theme.name}
                            </span>
                            <span
                              className="text-[10px] block truncate opacity-75"
                              style={{ color: theme.textSecondary }}
                            >
                              {theme.description}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center shrink-0 ml-2">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preset Section 2: Acabado del Estante */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Madera y Acabado del Estante</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Estante: <strong className="text-white">{activeWood.name}</strong>
                  </span>
                </div>

                {/* Live shelf visual preview banner */}
                <div className="mb-3.5 p-3 rounded-xl bg-black/40 border border-[#0f3847] space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Vista previa del estante seleccionado:
                  </span>
                  <div className="w-full">
                    <div className={`h-2 w-full rounded-t-xs ${activeWood.topEdge}`} />
                    <div
                      className={`h-5 w-full ${activeWood.faceGradient} flex items-center px-3 relative overflow-hidden`}
                      style={{ boxShadow: activeWood.shadow }}
                    >
                      <span className="text-[11px] font-semibold text-white/90 drop-shadow-sm">
                        {activeWood.name}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-gradient-to-b from-black/70 to-transparent" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(SHELF_WOODS) as ShelfWoodId[]).map((woodKey) => {
                    const wood = SHELF_WOODS[woodKey];
                    const isSelected = currentShelfWood === woodKey;
                    return (
                      <button
                        key={woodKey}
                        onClick={() => onSelectShelfWood(woodKey)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all bg-[#062029] ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                            : 'border-[#134455] hover:border-slate-500/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white truncate">
                            {wood.name}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="w-full rounded overflow-hidden">
                          <div className={`h-1.5 w-full ${wood.topEdge}`} />
                          <div className={`h-3 w-full ${wood.faceGradient}`} />
                        </div>

                        <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
                          {wood.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            // CUSTOM COLOR PICKERS SECTION
            <div className="space-y-5 text-xs">
              <div className="p-3 bg-[#062029] rounded-xl border border-teal-500/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-teal-300 block">
                    Creador de Tema Propio
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Modifica individualmente cada color de la app y del estante según tu gusto.
                  </p>
                </div>
                <button
                  onClick={handleResetCustomColors}
                  className="px-2.5 py-1 text-[11px] rounded bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1"
                  title="Restablecer valores"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer</span>
                </button>
              </div>

              {/* Live Preview Box */}
              <div
                className="p-4 rounded-xl border shadow-lg space-y-3"
                style={{
                  backgroundColor: localColors.bgCanvas,
                  borderColor: localColors.accent,
                }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold" style={{ color: localColors.textPrimary }}>
                    Vista Previa de la App
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      backgroundColor: localColors.accent,
                      color: localColors.bgCanvas,
                    }}
                  >
                    Botón Acento
                  </span>
                </div>

                <div
                  className="p-3 rounded-lg border text-xs"
                  style={{
                    backgroundColor: localColors.bgCard,
                    borderColor: `${localColors.accent}40`,
                    color: localColors.textPrimary,
                  }}
                >
                  <span className="font-semibold block">Tarjeta de Libro</span>
                  <span className="text-[10px] opacity-75">
                    Fondo: {localColors.bgCard} · Acento: {localColors.accent}
                  </span>
                </div>

                {/* Custom Shelf Preview */}
                <div>
                  <div
                    className="h-2 w-full rounded-t-xs"
                    style={{ backgroundColor: `${localColors.shelfColor}dd` }}
                  />
                  <div
                    className="h-4 w-full shadow-md"
                    style={{ backgroundColor: localColors.shelfColor }}
                  />
                  <div className="h-2 w-full bg-gradient-to-b from-black/60 to-transparent" />
                </div>
              </div>

              {/* Color Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Fondo de la App */}
                <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847] flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-200 block text-xs">
                      1. Fondo General
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {localColors.bgCanvas}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={localColors.bgCanvas}
                    onChange={(e) => handleColorChange('bgCanvas', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>

                {/* 2. Tarjetas y Superficies */}
                <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847] flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-200 block text-xs">
                      2. Tarjetas y Paneles
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {localColors.bgCard}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={localColors.bgCard}
                    onChange={(e) => handleColorChange('bgCard', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>

                {/* 3. Barra Superior */}
                <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847] flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-200 block text-xs">
                      3. Barra Superior
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {localColors.headerBg}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={localColors.headerBg}
                    onChange={(e) => handleColorChange('headerBg', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>

                {/* 4. Color de Acento y Botones */}
                <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847] flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-200 block text-xs">
                      4. Acentos y Botones
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {localColors.accent}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={localColors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>

                {/* 5. Color del Texto */}
                <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847] flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-200 block text-xs">
                      5. Texto Principal
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {localColors.textPrimary}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={localColors.textPrimary}
                    onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>

                {/* 6. Color del Estante de Madera */}
                <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847] flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-200 block text-xs">
                      6. Color del Estante
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {localColors.shelfColor}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={localColors.shelfColor}
                    onChange={(e) => handleColorChange('shelfColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#062029] border-t border-[#0f3847] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
          >
            Listo y Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
