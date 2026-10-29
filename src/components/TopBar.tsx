import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  MoreVertical,
  X,
  BookOpen,
  Grid,
  LayoutList,
  Layers,
  Cloud,
  BookmarkCheck,
  SlidersHorizontal,
  Sparkles,
  Palette
} from 'lucide-react';
import { ViewMode } from '../types/reader';
import { AppThemeConfig } from '../types/theme';

interface TopBarProps {
  title: string;
  onOpenDrawer: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenDictionaryNotes: () => void;
  onOpenSync: () => void;
  onOpenSettings: () => void;
  onOpenAIChat: () => void;
  onOpenThemeCustomizer: () => void;
  themeConfig: AppThemeConfig;
}

export function TopBar({
  title,
  onOpenDrawer,
  searchQuery,
  onSearchChange,
  viewMode,
  onChangeViewMode,
  onOpenDictionaryNotes,
  onOpenSync,
  onOpenSettings,
  onOpenAIChat,
  onOpenThemeCustomizer,
  themeConfig,
}: TopBarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <header
      className="relative w-full h-14 flex items-center justify-between px-3 border-b select-none z-30 transition-colors"
      style={{
        backgroundColor: themeConfig.headerBg,
        borderColor: themeConfig.border,
        color: themeConfig.textPrimary,
      }}
    >
      {showSearch ? (
        <div className="w-full flex items-center gap-2">
          <Search className="w-5 h-5 shrink-0" style={{ color: themeConfig.accent }} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título, autor o formato..."
            className="w-full bg-transparent text-sm placeholder-slate-400 focus:outline-none"
            style={{ color: themeConfig.textPrimary }}
          />
          <button
            onClick={() => {
              onSearchChange('');
              setShowSearch(false);
            }}
            className="p-1.5 opacity-80 hover:opacity-100 rounded-md active:bg-white/10"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onOpenDrawer}
              className="p-2 opacity-90 hover:opacity-100 rounded-lg active:bg-white/10 transition-colors shrink-0"
              aria-label="Abrir menú lateral"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Direct AI Assistant Button */}
            <button
              onClick={onOpenAIChat}
              className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 shadow-xs"
              style={{
                backgroundColor: themeConfig.accentBg,
                color: themeConfig.accentText,
              }}
              title="Preguntar a la IA sobre tus libros"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">IA Libros</span>
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className="p-2 opacity-90 hover:opacity-100 rounded-lg active:bg-white/10 transition-colors"
              aria-label="Buscar libros"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-2 opacity-90 hover:opacity-100 rounded-lg active:bg-white/10 transition-colors"
                aria-label="Más opciones"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-2 text-sm z-50 animate-in fade-in zoom-in-95 duration-150 border"
                  style={{
                    backgroundColor: themeConfig.bgCard,
                    borderColor: themeConfig.border,
                    color: themeConfig.textPrimary,
                  }}
                >
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider opacity-75">
                    Modo de visualización
                  </div>
                  <button
                    onClick={() => {
                      onChangeViewMode('shelf');
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 ${
                      viewMode === 'shelf' ? 'font-bold' : ''
                    }`}
                    style={{ color: viewMode === 'shelf' ? themeConfig.accent : undefined }}
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Estantería</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeViewMode('cards');
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 ${
                      viewMode === 'cards' ? 'font-bold' : ''
                    }`}
                    style={{ color: viewMode === 'cards' ? themeConfig.accent : undefined }}
                  >
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>Tarjetas detalladas</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeViewMode('grid');
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 ${
                      viewMode === 'grid' ? 'font-bold' : ''
                    }`}
                    style={{ color: viewMode === 'grid' ? themeConfig.accent : undefined }}
                  >
                    <Grid className="w-4 h-4 text-sky-400" />
                    <span>Cuadrícula de portadas</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeViewMode('compact');
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10 ${
                      viewMode === 'compact' ? 'font-bold' : ''
                    }`}
                    style={{ color: viewMode === 'compact' ? themeConfig.accent : undefined }}
                  >
                    <LayoutList className="w-4 h-4 opacity-75" />
                    <span>Lista compacta</span>
                  </button>

                  <div className="my-1 border-t" style={{ borderColor: themeConfig.border }} />

                  {/* AI interaction option */}
                  <button
                    onClick={() => {
                      onOpenAIChat();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10"
                    style={{ color: themeConfig.accent }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold">Interacción con la Inteligencia Artificial</span>
                  </button>

                  {/* Theme customizer option */}
                  <button
                    onClick={() => {
                      onOpenThemeCustomizer();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <Palette className="w-4 h-4 text-pink-400" />
                    <span>Personalizar Color y Estantería</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenDictionaryNotes();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    <span>Citas, Notas y Diccionario</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSync();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <Cloud className="w-4 h-4 text-blue-400" />
                    <span>Sincronización en la nube</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSettings();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                    <span>Preferencias y Lector</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
