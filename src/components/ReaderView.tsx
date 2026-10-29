import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sliders,
  Volume2,
  List,
  Search,
  Lock,
  Unlock,
  Columns,
  Square,
  ZoomIn,
  ZoomOut,
  Languages,
  Bookmark,
  Sparkles,
  ExternalLink,
  Plus,
  Check,
  Copy,
  RotateCcw,
  Palette,
  X,
  Tag,
  Clock,
  Smartphone,
  Hand,
  MoveHorizontal
} from 'lucide-react';
import { Book, DictionaryItem } from '../types/book';
import { ReaderSettings, ReadingTheme } from '../types/reader';
import { AppThemeConfig } from '../types/theme';

interface ReaderViewProps {
  book: Book;
  onClose: () => void;
  onUpdateProgress: (bookId: string, page: number) => void;
  onAddAnnotation: (
    bookId: string,
    text: string,
    type: 'quote' | 'note' | 'bookmark',
    color: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber',
    note?: string
  ) => void;
  onAddToDictionary: (item: Omit<DictionaryItem, 'id' | 'createdAt'>) => void;
  dictionaryItems: DictionaryItem[];
  dictCategories: string[];
  onCreateDictCategory: (catName: string) => void;
  themeConfig: AppThemeConfig;
  onStartTTS: (text: string) => void;
  isTTSSpeaking: boolean;
  onStopTTS: () => void;
}

export function ReaderView({
  book,
  onClose,
  onUpdateProgress,
  onAddAnnotation,
  onAddToDictionary,
  dictionaryItems,
  dictCategories,
  onCreateDictCategory,
  themeConfig,
  onStartTTS,
  isTTSSpeaking,
  onStopTTS,
}: ReaderViewProps) {
  // Reading Settings State (Page background is independent of app theme)
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('reader_settings_v4');
      if (saved) {
        return {
          fitToPhone: true,
          pageTurnMode: 'tap-edges',
          pageTurnAnimation: true,
          ...JSON.parse(saved),
        };
      }
    } catch {
      // fallback
    }
    return {
      theme: 'sepia', // classic book page default
      customBgColor: '#f7f6f0',
      customTextColor: '#2b2b2b',
      fontFamily: 'Literata',
      fontSize: 18,
      lineHeight: 1.75,
      paragraphIndent: true,
      paragraphSpacing: 14,
      pageLayout: 'single',
      readingDirection: book.format === 'CBR' || book.format === 'CBZ' ? 'rtl' : 'ltr',
      touchZones: 'left-right',
      invertImagesInNight: true,
      zoomLevel: 1.0,
      zoomLock: false,
      brightness: 100,
      fullscreen: false,
      immersiveMode: false,
      fitToPhone: true,
      pageTurnMode: 'tap-edges',
      pageTurnAnimation: true,
    };
  });

  const [currentPage, setCurrentPage] = useState(book.currentPage || 1);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showTOCDrawer, setShowTOCDrawer] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [controlsVisible, setControlsVisible] = useState(true);

  // Persistent contextual menu state for text selection
  const [activeSelectedText, setActiveSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [popupMode, setPopupMode] = useState<'actions' | 'quote-color' | 'note-input' | 'dict-input'>('actions');
  const [noteComment, setNoteComment] = useState('');
  const [dictDefinition, setDictDefinition] = useState('');
  const [selectedDictCat, setSelectedDictCat] = useState<string>('Diccionario General');
  const [isCreatingNewDictCat, setIsCreatingNewDictCat] = useState(false);
  const [newDictCatInput, setNewDictCatInput] = useState('');
  const [justCopied, setJustCopied] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Touch swipe gesture tracking & page turn animation state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pageAnimDirection, setPageAnimDirection] = useState<'forward' | 'backward' | null>(null);

  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Save reader settings changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reader_settings_v4', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Auto-hide controls in normal mode after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (
      controlsVisible &&
      !settings.immersiveMode &&
      !showSettingsDrawer &&
      !showTOCDrawer &&
      !showSearchModal &&
      !activeSelectedText
    ) {
      timeout = setTimeout(() => {
        setControlsVisible(false);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [controlsVisible, settings.immersiveMode, showSettingsDrawer, showTOCDrawer, showSearchModal, activeSelectedText]);

  // Sync progress back with visible page turn animation
  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(book.totalPages, newPage));
    if (clamped === currentPage) return;

    if (settings.pageTurnAnimation) {
      const dir = clamped > currentPage ? 'forward' : 'backward';
      setPageAnimDirection(dir);
      setTimeout(() => {
        setPageAnimDirection(null);
      }, 300);
    }

    setCurrentPage(clamped);
    onUpdateProgress(book.id, clamped);
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (settings.readingDirection === 'rtl') {
          handlePageChange(currentPage - 1);
        } else {
          handlePageChange(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (settings.readingDirection === 'rtl') {
          handlePageChange(currentPage + 1);
        } else {
          handlePageChange(currentPage - 1);
        }
      } else if (e.key === 'Escape') {
        if (activeSelectedText) {
          clearSelection();
        } else if (settings.immersiveMode) {
          setSettings((s) => ({ ...s, immersiveMode: false }));
          setControlsVisible(true);
        } else {
          setControlsVisible(true);
        }
      } else if (e.key === '+' || e.key === '=') {
        setSettings((s) => ({
          ...s,
          zoomLevel: Math.min(2.5, Number((s.zoomLevel + 0.1).toFixed(1))),
        }));
      } else if (e.key === '-') {
        setSettings((s) => ({
          ...s,
          zoomLevel: Math.max(0.7, Number((s.zoomLevel - 0.1).toFixed(1))),
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, settings.readingDirection, settings.immersiveMode, activeSelectedText, book.totalPages]);

  // Clear text selection helper
  const clearSelection = () => {
    setActiveSelectedText('');
    setSelectionPosition(null);
    setPopupMode('actions');
    setNoteComment('');
    setDictDefinition('');
    setIsCreatingNewDictCat(false);
    setNewDictCatInput('');
    setActionSuccessMsg(null);
    window.getSelection()?.removeAllRanges();
  };

  // Robust Text Selection Handler (Works on both Page 1 and Page 2 in Two-Page view)
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const text = selection.toString().trim();
    if (text.length > 0) {
      setActiveSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const popupWidth = 340;
      const x = Math.min(
        window.innerWidth - popupWidth - 12,
        Math.max(12, rect.left + rect.width / 2 - popupWidth / 2)
      );

      const y = rect.top > 130 ? rect.top - 68 : Math.min(window.innerHeight - 200, rect.bottom + 12);

      setSelectionPosition({ x, y });
      setPopupMode('actions');
    }
  };

  // Reading Page Sheet Themes (Only modifies the book page itself)
  interface ThemeDef {
    id: ReadingTheme;
    name: string;
    desc: string;
    bg: string;
    text: string;
    border: string;
    accent: string;
  }

  const themes: Record<ReadingTheme, ThemeDef> = {
    day: {
      id: 'day',
      name: 'Día',
      desc: 'Blanco puro nítido',
      bg: '#ffffff',
      text: '#18181b',
      border: 'rgba(0, 0, 0, 0.12)',
      accent: '#0d9488',
    },
    'day-soft': {
      id: 'day-soft',
      name: 'Día Suave',
      desc: 'Papel marfil atenuado',
      bg: '#f8f6f0',
      text: '#2d3748',
      border: 'rgba(0, 0, 0, 0.09)',
      accent: '#0f766e',
    },
    sepia: {
      id: 'sepia',
      name: 'Sepia',
      desc: 'Papel clásico pergamino',
      bg: '#f4ecd8',
      text: '#3d2f1f',
      border: 'rgba(61, 47, 31, 0.16)',
      accent: '#b45309',
    },
    'eye-care': {
      id: 'eye-care',
      name: 'Vista Cansada',
      desc: 'Verde menta antifatiga',
      bg: '#e7f2e7',
      text: '#1c3822',
      border: 'rgba(28, 56, 34, 0.16)',
      accent: '#15803d',
    },
    parchment: {
      id: 'parchment',
      name: 'Pergamino',
      desc: 'Crema cálido suave',
      bg: '#faf0db',
      text: '#45331e',
      border: 'rgba(69, 51, 30, 0.16)',
      accent: '#c2410c',
    },
    twilight: {
      id: 'twilight',
      name: 'Crepúsculo',
      desc: 'Café oscuro nocturno',
      bg: '#1e150f',
      text: '#d8c8b8',
      border: 'rgba(216, 200, 184, 0.15)',
      accent: '#f59e0b',
    },
    night: {
      id: 'night',
      name: 'Noche Petrol',
      desc: 'Azul petróleo profundo',
      bg: '#041a22',
      text: '#c7dbe2',
      border: 'rgba(15, 56, 71, 0.9)',
      accent: '#2dd4bf',
    },
    'night-oled': {
      id: 'night-oled',
      name: 'Noche OLED',
      desc: 'Negro puro sin reflejo',
      bg: '#000000',
      text: '#e2e8f0',
      border: 'rgba(255, 255, 255, 0.15)',
      accent: '#38bdf8',
    },
    'night-navy': {
      id: 'night-navy',
      name: 'Azul Marino',
      desc: 'Noche índigo relajante',
      bg: '#0a192f',
      text: '#ccd6f6',
      border: 'rgba(35, 53, 84, 0.9)',
      accent: '#64ffda',
    },
    custom: {
      id: 'custom',
      name: 'Personalizado',
      desc: 'Fondo y texto a tu gusto',
      bg: settings.customBgColor || '#f7f6f0',
      text: settings.customTextColor || '#2b2b2b',
      border: 'rgba(0, 0, 0, 0.15)',
      accent: '#2dd4bf',
    },
  };

  const activeTheme = themes[settings.theme] || themes.sepia;

  // Font class
  const fontClass =
    settings.fontFamily === 'Literata'
      ? 'font-serif'
      : settings.fontFamily === 'JetBrains Mono'
      ? 'font-mono'
      : 'font-sans';

  // Page contents
  const pageIndex = (currentPage - 1) % book.content.length;
  const pageContentLeft = book.content[pageIndex] || book.content[0] || 'Contenido del libro en proceso de carga.';
  const pageContentRight =
    book.content[(pageIndex + 1) % book.content.length] || pageContentLeft;

  // Render markdown paragraphs on the book page
  const renderBookContent = (rawText: string) => {
    const paragraphs = rawText.split('\n\n');

    return paragraphs.map((paragraph, pIdx) => {
      if (paragraph.startsWith('# ')) {
        return (
          <h1
            key={pIdx}
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-5 mt-2"
            style={{ color: activeTheme.text }}
          >
            {paragraph.replace('# ', '')}
          </h1>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3
            key={pIdx}
            className="text-base sm:text-lg font-semibold tracking-tight mb-2.5 mt-5"
            style={{ color: activeTheme.accent }}
          >
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      if (paragraph.startsWith('> ')) {
        return (
          <blockquote
            key={pIdx}
            style={{ borderColor: activeTheme.accent }}
            className="my-4 pl-4 py-1 italic border-l-3 opacity-90 text-sm leading-relaxed"
          >
            {paragraph.replace('> ', '')}
          </blockquote>
        );
      }

      return (
        <p
          key={pIdx}
          style={{
            textIndent: settings.paragraphIndent ? '1.5em' : '0',
            marginBottom: `${settings.paragraphSpacing}px`,
            lineHeight: settings.lineHeight,
          }}
          className="text-justify leading-relaxed select-text"
        >
          {paragraph}
        </p>
      );
    });
  };

  // Touch gesture listeners for finger swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeSelectedText) return;
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null || activeSelectedText) {
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    setTouchStartX(null);
    setTouchStartY(null);

    // If swipe mode is enabled ('swipe-finger' or 'both')
    if (settings.pageTurnMode === 'swipe-finger' || settings.pageTurnMode === 'both') {
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0) {
          // Deslizar hacia la izquierda -> Avanzar página
          if (settings.readingDirection === 'rtl') {
            handlePageChange(currentPage - 1);
          } else {
            handlePageChange(currentPage + 1);
          }
        } else {
          // Deslizar hacia la derecha -> Retroceder página
          if (settings.readingDirection === 'rtl') {
            handlePageChange(currentPage + 1);
          } else {
            handlePageChange(currentPage - 1);
          }
        }
      }
    }
  };

  // Content click handler: respect pageTurnMode ('tap-edges' vs 'swipe-finger')
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeSelectedText) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const canTapEdges = settings.pageTurnMode === 'tap-edges' || settings.pageTurnMode === 'both';

    if (canTapEdges && settings.touchZones === 'left-right') {
      if (clickX < width * 0.25) {
        if (settings.readingDirection === 'rtl') {
          handlePageChange(currentPage + 1);
        } else {
          handlePageChange(currentPage - 1);
        }
      } else if (clickX > width * 0.75) {
        if (settings.readingDirection === 'rtl') {
          handlePageChange(currentPage - 1);
        } else {
          handlePageChange(currentPage + 1);
        }
      } else {
        setControlsVisible((prev) => !prev);
      }
    } else {
      // In swipe-only mode, tapping screen simply toggles reader controls
      setControlsVisible((prev) => !prev);
    }
  };

  // Actions on selected text
  const handleSaveQuote = (color: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber') => {
    if (!activeSelectedText.trim()) return;
    onAddAnnotation(book.id, activeSelectedText, 'quote', color);
    setActionSuccessMsg('¡Cita guardada!');
    setTimeout(() => {
      clearSelection();
    }, 550);
  };

  const handleSaveNote = () => {
    if (!activeSelectedText.trim()) return;
    onAddAnnotation(book.id, activeSelectedText, 'note', 'emerald', noteComment.trim());
    setActionSuccessMsg('¡Nota guardada!');
    setTimeout(() => {
      clearSelection();
    }, 550);
  };

  const handleSaveToDictionary = (rememberLater = false) => {
    if (!activeSelectedText.trim()) return;

    let targetCategory = selectedDictCat;
    if (rememberLater) {
      targetCategory = 'Pendientes';
    } else if (isCreatingNewDictCat && newDictCatInput.trim()) {
      targetCategory = newDictCatInput.trim();
      onCreateDictCategory(targetCategory);
    }

    const isPending = rememberLater || targetCategory === 'Pendientes' || !dictDefinition.trim();

    onAddToDictionary({
      term: activeSelectedText,
      definition: isPending ? '' : dictDefinition.trim(),
      category: targetCategory,
      isPending,
      bookId: book.id,
      bookTitle: book.title,
    });

    setActionSuccessMsg(
      rememberLater
        ? 'Guardado en Pendientes'
        : `Añadido a "${targetCategory}"`
    );

    setTimeout(() => {
      clearSelection();
    }, 600);
  };

  const handleCopyText = () => {
    if (!activeSelectedText) return;
    navigator.clipboard.writeText(activeSelectedText);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

  const handleTranslate = () => {
    if (!activeSelectedText) return;
    const url = `https://translate.google.com/?sl=auto&tl=es&text=${encodeURIComponent(
      activeSelectedText
    )}&op=translate`;
    window.open(url, '_blank');
  };

  const handleWebSearch = () => {
    if (!activeSelectedText) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(activeSelectedText)}`;
    window.open(url, '_blank');
  };

  // Zoom controls
  const zoomIn = () => {
    setSettings((s) => ({
      ...s,
      zoomLevel: Math.min(2.5, Number((s.zoomLevel + 0.1).toFixed(1))),
    }));
  };

  const zoomOut = () => {
    setSettings((s) => ({
      ...s,
      zoomLevel: Math.max(0.7, Number((s.zoomLevel - 0.1).toFixed(1))),
    }));
  };

  const resetZoom = () => {
    setSettings((s) => ({ ...s, zoomLevel: 1.0 }));
  };

  // Toggle Immersive Mode
  const toggleImmersiveMode = () => {
    setSettings((s) => {
      const next = !s.immersiveMode;
      if (next) {
        setControlsVisible(false);
      } else {
        setControlsVisible(true);
      }
      return { ...s, immersiveMode: next };
    });
  };

  const effectiveFontSize = Math.round(settings.fontSize * (settings.zoomLevel || 1.0));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-text transition-colors duration-200 overflow-hidden"
      style={{
        backgroundColor: themeConfig.bgCanvas,
        color: themeConfig.textPrimary,
        filter: `brightness(${settings.brightness}%)`,
      }}
      onMouseUp={handleTextSelection}
    >
      {/* Top Reading Navigation Bar (Retains App Configured Theme Colors) */}
      {!settings.immersiveMode && (
        <div
          style={{
            backgroundColor: themeConfig.headerBg,
            borderColor: themeConfig.border,
            color: themeConfig.textPrimary,
          }}
          className={`w-full h-14 border-b px-3 flex items-center justify-between shrink-0 transition-transform duration-300 z-40 ${
            controlsVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-transform"
              aria-label="Cerrar lector y volver a biblioteca"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold truncate leading-tight">
                {book.title}
              </h2>
              <p className="text-[10px] opacity-75 truncate" style={{ color: themeConfig.textSecondary }}>
                {book.author} · Pág {currentPage} de {book.totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Zoom Indicator & Buttons */}
            <div
              className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-lg bg-black/20 border text-xs font-mono mr-1"
              style={{ borderColor: themeConfig.border }}
            >
              <button
                onClick={zoomOut}
                disabled={settings.zoomLevel <= 0.7}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                title="Reducir zoom (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetZoom}
                className="px-1.5 py-0.5 hover:underline font-bold text-[11px]"
                title="Restablecer zoom a 100%"
              >
                {Math.round(settings.zoomLevel * 100)}%
              </button>
              <button
                onClick={zoomIn}
                disabled={settings.zoomLevel >= 2.5}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                title="Aumentar zoom (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Immersive Mode Button */}
            <button
              onClick={toggleImmersiveMode}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Lectura Inmersiva (Oculta barras y menús)"
            >
              <Maximize2 className="w-5 h-5" style={{ color: themeConfig.accent }} />
            </button>

            {/* TTS Audio Button */}
            <button
              onClick={() => {
                if (isTTSSpeaking) {
                  onStopTTS();
                } else {
                  onStartTTS(pageContentLeft);
                }
              }}
              style={{
                backgroundColor: isTTSSpeaking ? themeConfig.accent : undefined,
                color: isTTSSpeaking ? themeConfig.accentText : undefined,
              }}
              className={`p-2 rounded-lg transition-colors ${
                isTTSSpeaking ? 'font-bold shadow' : 'hover:bg-white/10'
              }`}
              title="Lector de Texto a Voz (TTS)"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Table of Contents Button */}
            <button
              onClick={() => setShowTOCDrawer(true)}
              className="p-2 rounded-lg hover:bg-white/10"
              title="Tabla de Contenidos (Índice)"
            >
              <List className="w-5 h-5" />
            </button>

            {/* Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-lg hover:bg-white/10"
              title="Buscar en el documento"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Zoom Lock Button */}
            <button
              onClick={() => setSettings((s) => ({ ...s, zoomLock: !s.zoomLock }))}
              className="p-2 rounded-lg hover:bg-white/10"
              title={settings.zoomLock ? 'Bloqueo lateral activado' : 'Bloquear movimiento lateral'}
            >
              {settings.zoomLock ? (
                <Lock className="w-5 h-5" style={{ color: themeConfig.accent }} />
              ) : (
                <Unlock className="w-5 h-5" />
              )}
            </button>

            {/* Reader Settings Drawer Button */}
            <button
              onClick={() => setShowSettingsDrawer(true)}
              className="p-2 rounded-lg hover:bg-white/10"
              title="Ajustes de Fondo de Hoja y Lectura"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Exit Pill when in Immersive Mode */}
      {settings.immersiveMode && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 animate-in fade-in">
          <button
            onClick={toggleImmersiveMode}
            style={{
              backgroundColor: themeConfig.headerBg,
              borderColor: themeConfig.border,
              color: themeConfig.textPrimary,
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xl border backdrop-blur-md opacity-45 hover:opacity-100 transition-opacity"
            title="Salir de Lectura Inmersiva (o presiona ESC)"
          >
            <Minimize2 className="w-3.5 h-3.5" style={{ color: themeConfig.accent }} />
            <span>Salir Inmersivo</span>
          </button>
        </div>
      )}

      {/* In-page styling for visible page-turn animation */}
      <style>{`
        @keyframes pageTurnSlideForward {
          0% { transform: translateX(24px) scale(0.985); opacity: 0.55; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes pageTurnSlideBackward {
          0% { transform: translateX(-24px) scale(0.985); opacity: 0.55; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        .anim-page-turn-forward {
          animation: pageTurnSlideForward 0.28s cubic-bezier(0.2, 0.9, 0.3, 1);
        }
        .anim-page-turn-backward {
          animation: pageTurnSlideBackward 0.28s cubic-bezier(0.2, 0.9, 0.3, 1);
        }
      `}</style>

      {/* Main Content Viewport: Framing Canvas (Retains App Canvas Background) */}
      <div
        ref={contentContainerRef}
        onClick={handleContentClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`flex-1 overflow-y-auto relative cursor-default ${
          settings.fitToPhone ? 'px-0 sm:px-4 py-0 sm:py-2' : 'px-2 sm:px-6 py-4'
        } ${settings.zoomLock ? 'overflow-x-hidden' : ''}`}
        style={{
          direction: settings.readingDirection,
        }}
      >
        {/* LA HOJA DEL LIBRO (Only this book sheet changes its background color) */}
        {settings.pageLayout === 'single' ? (
          <div
            className={`mx-auto select-text ${fontClass} transition-all duration-200 ${
              settings.fitToPhone
                ? 'w-full max-w-none rounded-none sm:rounded-2xl p-4 sm:p-10 my-0 sm:my-3 min-h-[92vh] border-0 sm:border shadow-md'
                : 'max-w-3xl rounded-2xl p-6 sm:p-12 my-3 border shadow-2xl'
            } ${
              pageAnimDirection === 'forward'
                ? 'anim-page-turn-forward'
                : pageAnimDirection === 'backward'
                ? 'anim-page-turn-backward'
                : ''
            }`}
            style={{
              backgroundColor: activeTheme.bg,
              color: activeTheme.text,
              borderColor: activeTheme.border || 'rgba(0,0,0,0.12)',
              fontSize: `${effectiveFontSize}px`,
              boxShadow: settings.fitToPhone
                ? 'none'
                : '0 12px 35px -5px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            <article
              className="prose max-w-none select-text cursor-text"
              style={{ color: activeTheme.text }}
              onMouseUp={handleTextSelection}
            >
              {renderBookContent(pageContentLeft)}
            </article>
          </div>
        ) : (
          /* Two-Page View: Two Facing Sheets */
          <div
            className={`mx-auto select-text max-w-6xl grid grid-cols-1 md:grid-cols-2 my-2 sm:my-4 ${fontClass} rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ${
              pageAnimDirection === 'forward'
                ? 'anim-page-turn-forward'
                : pageAnimDirection === 'backward'
                ? 'anim-page-turn-backward'
                : ''
            }`}
            style={{
              backgroundColor: activeTheme.bg,
              color: activeTheme.text,
              borderColor: activeTheme.border || 'rgba(0,0,0,0.12)',
              fontSize: `${effectiveFontSize}px`,
              boxShadow: '0 14px 45px -10px rgba(0, 0, 0, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Page 1 (Left) */}
            <div className="p-6 sm:p-12 border-b md:border-b-0 md:border-r border-current/15">
              <article
                className="prose max-w-none select-text cursor-text"
                style={{ color: activeTheme.text }}
                onMouseUp={handleTextSelection}
              >
                {renderBookContent(pageContentLeft)}
              </article>
            </div>

            {/* Page 2 (Right) */}
            <div className="p-6 sm:p-12 hidden md:block">
              <article
                className="prose max-w-none select-text cursor-text"
                style={{ color: activeTheme.text }}
                onMouseUp={handleTextSelection}
              >
                {renderBookContent(pageContentRight)}
              </article>
            </div>
          </div>
        )}
      </div>

      {/* Contextual Menu on Selected Text */}
      {activeSelectedText && selectionPosition && (
        <div
          className="fixed z-50 bg-[#062029] text-white border border-[#174d61] rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2 animate-in fade-in zoom-in-95 text-xs font-sans max-w-[360px]"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {actionSuccessMsg ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              <span className="font-semibold text-xs">{actionSuccessMsg}</span>
            </div>
          ) : popupMode === 'actions' ? (
            <div>
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-[#0f3847] mb-1">
                <span className="text-[10px] text-teal-300 font-mono truncate max-w-[200px]">
                  "{activeSelectedText.slice(0, 32)}..."
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Cerrar menú"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => setPopupMode('quote-color')}
                  className="px-2.5 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1.5 text-amber-300 font-medium active:scale-95 transition-transform"
                  title="Resaltar texto y guardar Cita"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Cita</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => setPopupMode('note-input')}
                  className="px-2.5 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1.5 text-emerald-300 font-medium active:scale-95 transition-transform"
                  title="Agregar Nota Personal"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nota</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => setPopupMode('dict-input')}
                  className="px-2.5 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1.5 text-sky-300 font-medium active:scale-95 transition-transform"
                  title="Guardar palabra en Diccionario"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Diccionario</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={handleCopyText}
                  className="px-2 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1 text-slate-300 active:scale-95"
                  title="Copiar texto al portapapeles"
                >
                  {justCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{justCopied ? '¡Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={handleTranslate}
                  className="px-2 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1 text-teal-400"
                  title="Traducir en línea"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Traducir</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={handleWebSearch}
                  className="px-2 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-1 text-slate-400 hover:text-white"
                  title="Buscar en Google"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : popupMode === 'quote-color' ? (
            <div className="p-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-300">
                  Color para la Cita:
                </span>
                <button
                  type="button"
                  onClick={() => setPopupMode('actions')}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Atrás
                </button>
              </div>

              <div className="flex items-center gap-2.5 py-1 justify-center">
                {(
                  [
                    ['yellow', 'bg-amber-400', 'Amarillo'],
                    ['emerald', 'bg-emerald-400', 'Verde'],
                    ['blue', 'bg-sky-400', 'Azul'],
                    ['rose', 'bg-rose-400', 'Rosa'],
                    ['amber', 'bg-orange-400', 'Naranja'],
                  ] as const
                ).map(([c, bgCls, label]) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleSaveQuote(c)}
                    className={`w-7 h-7 rounded-full ${bgCls} transition-transform hover:scale-125 ring-2 ring-transparent hover:ring-white flex items-center justify-center shadow-md`}
                    title={`Guardar cita en color ${label}`}
                  />
                ))}
              </div>
            </div>
          ) : popupMode === 'note-input' ? (
            <div className="p-1 space-y-2 w-72">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300">
                  Agregar Nota Personal
                </span>
                <button
                  type="button"
                  onClick={() => setPopupMode('actions')}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Atrás
                </button>
              </div>

              <div className="text-[11px] text-slate-300 bg-[#0a2732] p-2 rounded-lg border border-[#0f3847] line-clamp-2 italic">
                "{activeSelectedText}"
              </div>

              <textarea
                value={noteComment}
                onChange={(e) => setNoteComment(e.target.value)}
                placeholder="Escribe tu observación o apunte..."
                rows={2}
                className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                autoFocus
              />

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPopupMode('actions')}
                  className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={handleSaveNote}
                  className="px-3.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400"
                >
                  Guardar Nota
                </button>
              </div>
            </div>
          ) : (
            /* Submenu: Save to Dictionary (With Category Selection & New List Creation) */
            <div className="p-1 space-y-2.5 w-76">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-sky-300">Guardar en Diccionario</span>
                <button
                  type="button"
                  onClick={() => setPopupMode('actions')}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Atrás
                </button>
              </div>

              <div className="text-xs font-semibold text-white bg-[#0a2732] p-1.5 rounded-lg border border-[#0f3847] truncate">
                Palabra: <span className="text-sky-300 font-bold">"{activeSelectedText}"</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Definición (Opcional):
                </label>
                <input
                  type="text"
                  value={dictDefinition}
                  onChange={(e) => setDictDefinition(e.target.value)}
                  placeholder="Significado o concepto..."
                  className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  autoFocus
                />
              </div>

              {/* Category / List Selector with "Crear nueva lista" option */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Lista / Categoría destino:</span>
                  {!isCreatingNewDictCat && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewDictCat(true)}
                      className="text-teal-300 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nueva Lista</span>
                    </button>
                  )}
                </div>

                {!isCreatingNewDictCat ? (
                  <select
                    value={selectedDictCat}
                    onChange={(e) => setSelectedDictCat(e.target.value)}
                    className="w-full bg-[#0d3b4b] border border-[#174d61] text-xs text-white rounded-lg p-1.5 focus:outline-none"
                  >
                    {dictCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#082a36]">
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newDictCatInput}
                      onChange={(e) => setNewDictCatInput(e.target.value)}
                      placeholder="Nombre de la nueva lista..."
                      className="flex-1 bg-[#0d3b4b] border border-[#174d61] rounded-lg px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewDictCat(false)}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Volver
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#0f3847]">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleSaveToDictionary(true)}
                  className="px-2 py-1 text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 whitespace-nowrap"
                  title="Guardar palabra en Pendientes para definirla más tarde"
                >
                  Recordar más tarde
                </button>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPopupMode('actions')}
                    className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleSaveToDictionary(false)}
                    className="px-3 py-1 bg-sky-400 text-slate-950 font-bold rounded text-xs hover:bg-sky-300"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Reading Pagination & Chapter Controls (Retains App Configured Theme Colors) */}
      {!settings.immersiveMode && (
        <div
          style={{
            backgroundColor: themeConfig.headerBg,
            borderColor: themeConfig.border,
            color: themeConfig.textPrimary,
          }}
          className={`w-full border-t p-3 shrink-0 transition-transform duration-300 z-40 ${
            controlsVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <input
                type="range"
                min="1"
                max={book.totalPages}
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                style={{ accentColor: themeConfig.accent }}
                className="w-full h-1.5 bg-black/20 rounded-lg cursor-pointer"
              />

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= book.totalPages}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between items-center text-xs opacity-85 font-mono tabular-nums">
              <span>
                Pág {currentPage} / {book.totalPages} ({Math.round((currentPage / book.totalPages) * 100)}%)
              </span>
              <div className="flex items-center gap-2 font-sans">
                {/* Fit to Phone Quick Toggle */}
                <button
                  onClick={() => setSettings((s) => ({ ...s, fitToPhone: !s.fitToPhone }))}
                  style={{ color: settings.fitToPhone ? themeConfig.accent : undefined }}
                  className="flex items-center gap-1 hover:underline font-semibold text-[11px]"
                  title={settings.fitToPhone ? 'Desactivar ajuste al teléfono' : 'Ajustar hoja al teléfono'}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{settings.fitToPhone ? 'Ajustado' : 'Libre'}</span>
                </button>

                {/* Quick font size buttons */}
                <div className="flex items-center gap-0.5 bg-black/20 rounded px-1 border border-white/10 text-[10px]">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, fontSize: Math.max(12, s.fontSize - 1) }))}
                    className="px-1 hover:text-white"
                    title="Letra más pequeña"
                  >
                    A-
                  </button>
                  <span className="px-1 font-mono font-bold" style={{ color: themeConfig.accent }}>
                    {settings.fontSize}
                  </span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, fontSize: Math.min(36, s.fontSize + 1) }))}
                    className="px-1 hover:text-white"
                    title="Letra más grande"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      pageLayout: s.pageLayout === 'single' ? 'two-page' : 'single',
                    }))
                  }
                  style={{ color: themeConfig.accent }}
                  className="flex items-center gap-1 hover:underline font-semibold text-[11px]"
                >
                  {settings.pageLayout === 'single' ? (
                    <Columns className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>{settings.pageLayout === 'single' ? '2 Pág' : '1 Pág'}</span>
                </button>

                <button
                  onClick={toggleImmersiveMode}
                  className="hidden sm:flex items-center gap-1 hover:underline opacity-80 hover:opacity-100 text-[11px]"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inmersivo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Settings Drawer Modal (Themes for Book Page Sheet & Zoom) */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            style={{
              backgroundColor: themeConfig.bgCard,
              borderColor: themeConfig.border,
              color: themeConfig.textPrimary,
            }}
            className="w-full max-w-md h-full p-5 flex flex-col justify-between overflow-y-auto border-l shadow-2xl"
          >
            <div className="space-y-6">
              <div
                className="flex justify-between items-center border-b pb-3"
                style={{ borderColor: themeConfig.border }}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" style={{ color: themeConfig.accent }} />
                  <h3 className="font-bold text-sm tracking-wide uppercase" style={{ color: themeConfig.accent }}>
                    Fondo de la Hoja y Lectura
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Presets of Book Page Sheet Backgrounds */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: themeConfig.textSecondary }}>
                    Color de la Hoja (Libro)
                  </label>
                  <span className="text-[10px] font-mono" style={{ color: themeConfig.accent }}>
                    {activeTheme.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {(
                    [
                      'day',
                      'day-soft',
                      'sepia',
                      'eye-care',
                      'parchment',
                      'twilight',
                      'night',
                      'night-oled',
                      'night-navy',
                      'custom',
                    ] as ReadingTheme[]
                  ).map((themeKey) => {
                    const t = themes[themeKey];
                    const isSelected = settings.theme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setSettings((s) => ({ ...s, theme: themeKey }))}
                        style={{
                          backgroundColor: t.bg,
                          color: t.text,
                          borderColor: isSelected ? t.accent : 'rgba(0,0,0,0.15)',
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between h-16 transition-all shadow-sm ${
                          isSelected ? 'ring-2 ring-teal-400 shadow-md scale-[1.02]' : 'opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs truncate">{t.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: t.accent }} />}
                        </div>
                        <span className="text-[10px] opacity-75 truncate">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Selector for Book Page Sheet */}
              <div
                style={{
                  backgroundColor: themeConfig.bgSurface,
                  borderColor: themeConfig.border,
                }}
                className="p-3 rounded-xl border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: themeConfig.accent }}>
                    <Palette className="w-3.5 h-3.5" />
                    <span>Personalizar Hoja Libremente</span>
                  </label>
                  {settings.theme !== 'custom' && (
                    <button
                      onClick={() => setSettings((s) => ({ ...s, theme: 'custom' }))}
                      className="text-[10px] hover:underline"
                      style={{ color: themeConfig.accent }}
                    >
                      Activar personalizado
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] opacity-75 block mb-1">Fondo de la Hoja</span>
                    <div className="flex items-center gap-2 bg-black/25 p-1.5 rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={settings.customBgColor || '#f7f6f0'}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            theme: 'custom',
                            customBgColor: e.target.value,
                          }))
                        }
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="font-mono text-[11px] uppercase">
                        {settings.customBgColor || '#f7f6f0'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] opacity-75 block mb-1">Texto de la Hoja</span>
                    <div className="flex items-center gap-2 bg-black/25 p-1.5 rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={settings.customTextColor || '#2b2b2b'}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            theme: 'custom',
                            customTextColor: e.target.value,
                          }))
                        }
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="font-mono text-[11px] uppercase">
                        {settings.customTextColor || '#2b2b2b'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zoom Controls */}
              <div
                style={{
                  backgroundColor: themeConfig.bgSurface,
                  borderColor: themeConfig.border,
                }}
                className="p-3 rounded-xl border space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: themeConfig.textSecondary }}>
                    Zoom de Lectura
                  </span>
                  <span className="font-mono font-bold text-xs" style={{ color: themeConfig.accent }}>
                    {Math.round(settings.zoomLevel * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={zoomOut}
                    disabled={settings.zoomLevel <= 0.7}
                    className="p-2 rounded-lg bg-black/20 border border-white/10 hover:bg-white/10 disabled:opacity-30"
                    title="Alejar"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.7"
                    max="2.5"
                    step="0.05"
                    value={settings.zoomLevel}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, zoomLevel: Number(e.target.value) }))
                    }
                    style={{ accentColor: themeConfig.accent }}
                    className="w-full h-1.5 bg-black/25 rounded-lg"
                  />
                  <button
                    onClick={zoomIn}
                    disabled={settings.zoomLevel >= 2.5}
                    className="p-2 rounded-lg bg-black/20 border border-white/10 hover:bg-white/10 disabled:opacity-30"
                    title="Acercar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="p-2 rounded-lg bg-black/20 border border-white/10 hover:bg-white/10 text-slate-300"
                    title="Restablecer a 100%"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-1.5 justify-between">
                  {[0.8, 1.0, 1.25, 1.5, 1.8].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSettings((s) => ({ ...s, zoomLevel: lvl }))}
                      style={{
                        backgroundColor: settings.zoomLevel === lvl ? themeConfig.accentBg : undefined,
                        color: settings.zoomLevel === lvl ? themeConfig.accent : undefined,
                        borderColor: settings.zoomLevel === lvl ? themeConfig.accent : undefined,
                      }}
                      className={`flex-1 py-1 rounded text-[11px] font-mono border ${
                        settings.zoomLevel === lvl
                          ? 'font-bold'
                          : 'bg-black/20 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {Math.round(lvl * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: themeConfig.textSecondary }}>
                  Tipografía
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Literata', 'Plus Jakarta Sans', 'System Sans', 'JetBrains Mono'] as const).map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setSettings((s) => ({ ...s, fontFamily: f }))}
                        style={{
                          backgroundColor: settings.fontFamily === f ? themeConfig.accentBg : undefined,
                          color: settings.fontFamily === f ? themeConfig.accent : undefined,
                          borderColor: settings.fontFamily === f ? themeConfig.accent : undefined,
                        }}
                        className={`p-2 rounded-lg text-xs border text-center transition-colors ${
                          settings.fontFamily === f
                            ? 'font-bold'
                            : 'border-white/10 bg-black/20 text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {f}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Fit to Phone Toggle (Ajustar hoja al teléfono) */}
              <div
                style={{
                  backgroundColor: themeConfig.bgSurface,
                  borderColor: themeConfig.border,
                }}
                className="p-3.5 rounded-xl border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-2">
                    <Smartphone className="w-4 h-4" style={{ color: themeConfig.accent }} />
                    <span>Ajustar hoja al teléfono</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.fitToPhone}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        fitToPhone: e.target.checked,
                      }))
                    }
                    style={{ accentColor: themeConfig.accent }}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {settings.fitToPhone
                    ? '✓ Activado: La hoja llena la pantalla de tu móvil sin márgenes vacíos.'
                    : 'Desactivado: Formato libro con márgenes y tamaño libre de texto.'}
                </p>
              </div>

              {/* Font Size & Line Height */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: themeConfig.textSecondary }}>Tamaño del Texto:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, fontSize: Math.max(12, s.fontSize - 1) }))}
                        className="px-2 py-0.5 rounded bg-black/20 border border-white/10 text-xs font-bold hover:bg-white/10"
                        title="Disminuir tamaño de letra"
                      >
                        A-
                      </button>
                      <span className="font-mono font-bold px-1" style={{ color: themeConfig.accent }}>
                        {settings.fontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, fontSize: Math.min(36, s.fontSize + 1) }))}
                        className="px-2 py-0.5 rounded bg-black/20 border border-white/10 text-xs font-bold hover:bg-white/10"
                        title="Aumentar tamaño de letra"
                      >
                        A+
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="36"
                    value={settings.fontSize}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))
                    }
                    style={{ accentColor: themeConfig.accent }}
                    className="w-full h-1.5 bg-black/25 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: themeConfig.textSecondary }}>Interlineado:</span>
                    <span className="font-mono font-bold" style={{ color: themeConfig.accent }}>{settings.lineHeight}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.3"
                    max="2.4"
                    step="0.05"
                    value={settings.lineHeight}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, lineHeight: Number(e.target.value) }))
                    }
                    style={{ accentColor: themeConfig.accent }}
                    className="w-full h-1.5 bg-black/25 rounded-lg"
                  />
                </div>
              </div>

              {/* Page Turn Method Selection (Tocar bordes vs Desplazamiento con el dedo) */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: themeConfig.textSecondary }}>
                  Forma de cambiar de página
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, pageTurnMode: 'tap-edges' }))}
                    style={{
                      backgroundColor: settings.pageTurnMode === 'tap-edges' ? themeConfig.accentBg : undefined,
                      color: settings.pageTurnMode === 'tap-edges' ? themeConfig.accent : undefined,
                      borderColor: settings.pageTurnMode === 'tap-edges' ? themeConfig.accent : undefined,
                    }}
                    className={`p-2 rounded-lg border text-center transition-colors flex flex-col items-center gap-1 ${
                      settings.pageTurnMode === 'tap-edges' ? 'font-bold' : 'border-white/10 bg-black/20 text-slate-300'
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>Tocar bordes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, pageTurnMode: 'swipe-finger' }))}
                    style={{
                      backgroundColor: settings.pageTurnMode === 'swipe-finger' ? themeConfig.accentBg : undefined,
                      color: settings.pageTurnMode === 'swipe-finger' ? themeConfig.accent : undefined,
                      borderColor: settings.pageTurnMode === 'swipe-finger' ? themeConfig.accent : undefined,
                    }}
                    className={`p-2 rounded-lg border text-center transition-colors flex flex-col items-center gap-1 ${
                      settings.pageTurnMode === 'swipe-finger' ? 'font-bold' : 'border-white/10 bg-black/20 text-slate-300'
                    }`}
                  >
                    <MoveHorizontal className="w-4 h-4" />
                    <span>Deslizar dedo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, pageTurnMode: 'both' }))}
                    style={{
                      backgroundColor: settings.pageTurnMode === 'both' ? themeConfig.accentBg : undefined,
                      color: settings.pageTurnMode === 'both' ? themeConfig.accent : undefined,
                      borderColor: settings.pageTurnMode === 'both' ? themeConfig.accent : undefined,
                    }}
                    className={`p-2 rounded-lg border text-center transition-colors flex flex-col items-center gap-1 ${
                      settings.pageTurnMode === 'both' ? 'font-bold' : 'border-white/10 bg-black/20 text-slate-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ambos</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {settings.pageTurnMode === 'tap-edges'
                    ? 'Toca el lado izquierdo o derecho de la pantalla para pasar de página.'
                    : settings.pageTurnMode === 'swipe-finger'
                    ? 'Arrastra tu dedo lateralmente con swipe hacia la izquierda o derecha.'
                    : 'Puedes tocar los extremos de la pantalla o deslizar con el dedo.'}
                </p>
              </div>

              {/* Page Turn Animation Toggle */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: themeConfig.accent }} />
                    <span>Animación al cambiar de página</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.pageTurnAnimation}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        pageTurnAnimation: e.target.checked,
                      }))
                    }
                    style={{ accentColor: themeConfig.accent }}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Muestra un desplazamiento y transición visible para que se aprecie con claridad cuándo se pasa la hoja.
                </p>
              </div>

              {/* Immersive Mode Switch */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" style={{ color: themeConfig.accent }} />
                    <span>Modo Inmersivo (Sin distracciones)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.immersiveMode}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        immersiveMode: e.target.checked,
                      }))
                    }
                    style={{ accentColor: themeConfig.accent }}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsDrawer(false)}
              style={{
                backgroundColor: themeConfig.accent,
                color: themeConfig.accentText,
              }}
              className="w-full mt-6 py-2.5 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-98"
            >
              Cerrar Ajustes
            </button>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer Modal */}
      {showTOCDrawer && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            style={{
              backgroundColor: themeConfig.bgCard,
              borderColor: themeConfig.border,
              color: themeConfig.textPrimary,
            }}
            className="w-full max-w-sm h-full p-5 flex flex-col justify-between overflow-y-auto border-r shadow-2xl"
          >
            <div>
              <div
                className="flex justify-between items-center border-b pb-3 mb-4"
                style={{ borderColor: themeConfig.border }}
              >
                <h3 className="font-bold text-sm tracking-wide uppercase" style={{ color: themeConfig.accent }}>
                  Tabla de Contenidos
                </h3>
                <button
                  onClick={() => setShowTOCDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {book.chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      handlePageChange(ch.page);
                      setShowTOCDrawer(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex justify-between items-center transition-colors ${
                      currentPage >= ch.page
                        ? 'bg-white/10 font-semibold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                    style={{
                      color: currentPage >= ch.page ? themeConfig.accent : undefined,
                    }}
                  >
                    <span className="truncate">{ch.title}</span>
                    <span className="font-mono text-[11px] opacity-75 shrink-0 ml-2">
                      pág {ch.page}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search in Book Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div
            style={{
              backgroundColor: themeConfig.bgCard,
              borderColor: themeConfig.border,
              color: themeConfig.textPrimary,
            }}
            className="w-full max-w-md rounded-2xl border p-4 shadow-2xl space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wide" style={{ color: themeConfig.accent }}>
                Buscar en {book.title}
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div
              className="flex items-center gap-2 bg-black/25 border rounded-lg px-2.5 py-1.5"
              style={{ borderColor: themeConfig.border }}
            >
              <Search className="w-4 h-4" style={{ color: themeConfig.accent }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe palabra o frase clave..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="text-[11px]" style={{ color: themeConfig.textSecondary }}>
              {searchQuery ? (
                <p>Buscando concordancias de "{searchQuery}" en todo el volumen...</p>
              ) : (
                <p>Escribe cualquier término para explorar capítulos y párrafos correspondientes.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
