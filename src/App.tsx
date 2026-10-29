import { useState, useEffect } from 'react';
import { INITIAL_BOOKS, INITIAL_DICTIONARY, INITIAL_CATEGORIES, INITIAL_DICT_CATEGORIES } from './data/initialBooks';
import { Book, DictionaryItem, ShelfCategory } from './types/book';
import { ViewMode } from './types/reader';
import { AppThemeId, ShelfWoodId, APP_THEMES, SHELF_WOODS, CustomThemeColors, AppThemeConfig } from './types/theme';
import { useTTS } from './hooks/useTTS';
import { Capacitor } from '@capacitor/core';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { TopBar } from './components/TopBar';
import { BookCardItem } from './components/BookCardItem';
import { BookshelfView } from './components/BookshelfView';
import { BookDetailModal } from './components/BookDetailModal';
import { ReaderView } from './components/ReaderView';
import { TTSPlayerBar } from './components/TTSPlayerBar';
import { SidebarDrawer } from './components/SidebarDrawer';
import { DictionaryNotesModal } from './components/DictionaryNotesModal';
import { AddBookModal } from './components/AddBookModal';
import { SyncModal } from './components/SyncModal';
import { SettingsModal } from './components/SettingsModal';
import { AIBookChatModal } from './components/AIBookChatModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  BookOpen,
  Smartphone,
  Sparkles,
  Tag,
  X
} from 'lucide-react';

const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  bgCanvas: '#061720',
  bgCard: '#0d2836',
  headerBg: '#09212d',
  accent: '#2dd4bf',
  textPrimary: '#ffffff',
  shelfColor: '#78350f',
};

export default function App() {
  // Books state with localStorage persistence
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('libris_app_books');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOKS;
  });

  // Dynamic Book Categories state with localStorage persistence
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('libris_app_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CATEGORIES;
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Dynamic Dictionary Categories state with localStorage persistence
  const [dictCategories, setDictCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('libris_dict_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DICT_CATEGORIES;
  });

  // Personal dictionary state with localStorage persistence
  const [dictionary, setDictionary] = useState<DictionaryItem[]>(() => {
    try {
      const saved = localStorage.getItem('libris_app_dict');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DICTIONARY;
  });

  // Theme & Shelf Wood Customization state
  const [appThemeId, setAppThemeId] = useState<AppThemeId>(() => {
    try {
      const saved = localStorage.getItem('libris_app_theme') as AppThemeId;
      if (saved && (APP_THEMES[saved] || saved === 'custom')) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'petrol';
  });

  const [shelfWoodId, setShelfWoodId] = useState<ShelfWoodId>(() => {
    try {
      const saved = localStorage.getItem('libris_shelf_wood') as ShelfWoodId;
      if (saved && (SHELF_WOODS[saved] || saved === 'custom')) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'oak';
  });

  // Custom colors user picker state
  const [customColors, setCustomColors] = useState<CustomThemeColors>(() => {
    try {
      const saved = localStorage.getItem('libris_custom_colors');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CUSTOM_COLORS;
  });

  // Active view states
  const [activeShelf, setActiveShelf] = useState<ShelfCategory | 'all'>('reading');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAndroidFrame, setIsAndroidFrame] = useState(true);

  // Active modal targets
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [aiTargetBook, setAiTargetBook] = useState<Book | null>(null);

  // Modals visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isDictionaryNotesOpen, setIsDictionaryNotesOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // PWA Install hook for Android/iOS
  const { triggerInstall, canPromptDirectly } = usePWAInstall();

  // Shelf switcher quick dropdown
  const [shelfTargetBook, setShelfTargetBook] = useState<Book | null>(null);

  // Dynamic Theme Config calculation
  const currentAppTheme: AppThemeConfig =
    appThemeId === 'custom'
      ? {
          id: 'custom',
          name: 'Personalizado',
          description: 'Colores elegidos por el usuario',
          bgCanvas: customColors.bgCanvas,
          bgSurface: customColors.bgCard,
          bgCard: customColors.bgCard,
          bgCardHover: `${customColors.bgCard}dd`,
          border: `${customColors.accent}33`,
          headerBg: customColors.headerBg,
          accent: customColors.accent,
          accentBg: `${customColors.accent}25`,
          accentText: customColors.accent,
          textPrimary: customColors.textPrimary,
          textSecondary: '#94a3b8',
          isDark: true,
        }
      : APP_THEMES[appThemeId] || APP_THEMES.petrol;

  const currentShelfWood = SHELF_WOODS[shelfWoodId] || SHELF_WOODS.oak;

  // TTS Hook
  const {
    isPlaying: isTTSSpeaking,
    isPaused: isTTSPaused,
    voices,
    settings: ttsSettings,
    speak: startTTS,
    pause: pauseTTS,
    resume: resumeTTS,
    stop: stopTTS,
    updateRate: updateTTSRate,
    toggleFavoriteVoice,
    setSettings: setTTSSettings,
  } = useTTS();

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('libris_app_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('libris_app_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('libris_dict_categories', JSON.stringify(dictCategories));
  }, [dictCategories]);

  useEffect(() => {
    localStorage.setItem('libris_custom_colors', JSON.stringify(customColors));
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem('libris_app_dict', JSON.stringify(dictionary));
  }, [dictionary]);

  useEffect(() => {
    localStorage.setItem('libris_app_theme', appThemeId);
  }, [appThemeId]);

  useEffect(() => {
    localStorage.setItem('libris_shelf_wood', shelfWoodId);
  }, [shelfWoodId]);

  // Book modification handlers
  const handleToggleFavorite = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b))
    );
    if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
      setSelectedBookForDetails((b) => (b ? { ...b, isFavorite: !b.isFavorite } : null));
    }
  };

  const handleToggleCompleted = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const isComp = !b.isCompleted;
          return {
            ...b,
            isCompleted: isComp,
            currentPage: isComp ? b.totalPages : b.currentPage,
            shelf: isComp ? 'completed' : b.shelf,
          };
        }
        return b;
      })
    );
    if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
      setSelectedBookForDetails((b) =>
        b
          ? {
              ...b,
              isCompleted: !b.isCompleted,
              currentPage: !b.isCompleted ? b.totalPages : b.currentPage,
            }
          : null
      );
    }
  };

  const handleUpdateProgress = (bookId: string, newPage: number) => {
    const clamped = Math.max(1, newPage);
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const isComp = clamped >= b.totalPages;
          return {
            ...b,
            currentPage: clamped,
            isCompleted: isComp,
            lastReadDate: 'Ahora mismo',
            readTimeMinutes: b.readTimeMinutes + 2,
          };
        }
        return b;
      })
    );
    if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
      setSelectedBookForDetails((b) =>
        b ? { ...b, currentPage: clamped, lastReadDate: 'Ahora mismo' } : null
      );
    }
  };

  const handleChangeShelf = (bookId: string, newShelf: ShelfCategory) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, shelf: newShelf } : b))
    );
    if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
      setSelectedBookForDetails((b) => (b ? { ...b, shelf: newShelf } : null));
    }
    setShelfTargetBook(null);
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (selectedBookForDetails?.id === bookId) {
      setSelectedBookForDetails(null);
    }
    if (activeReadingBook?.id === bookId) {
      setActiveReadingBook(null);
      stopTTS();
    }
  };

  // Book Category management handlers
  const handleSelectCategory = (cat: string | null) => {
    setActiveCategory(cat);
  };

  const handleCreateCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      localStorage.setItem('libris_app_categories', JSON.stringify(updated));
    }
  };

  const handleDeleteCategory = (catName: string) => {
    const updated = categories.filter((c) => c !== catName);
    setCategories(updated);
    localStorage.setItem('libris_app_categories', JSON.stringify(updated));
    if (activeCategory === catName) {
      setActiveCategory(null);
    }
    setBooks((prev) =>
      prev.map((b) => (b.category === catName ? { ...b, category: undefined } : b))
    );
  };

  const handleUpdateBookCategory = (bookId: string, newCat: string) => {
    const cleanCat = newCat === 'SIN CATEGORÍA' ? undefined : newCat;
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, category: cleanCat } : b))
    );
    if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
      setSelectedBookForDetails((b) => (b ? { ...b, category: cleanCat } : null));
    }
  };

  // Dictionary Categories handlers
  const handleCreateDictCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed && !dictCategories.includes(trimmed)) {
      const updated = [...dictCategories, trimmed];
      setDictCategories(updated);
      localStorage.setItem('libris_dict_categories', JSON.stringify(updated));
    }
  };

  const handleDeleteDictCategory = (catName: string) => {
    if (catName === 'Diccionario General' || catName === 'Pendientes') return;
    const updated = dictCategories.filter((c) => c !== catName);
    setDictCategories(updated);
    localStorage.setItem('libris_dict_categories', JSON.stringify(updated));
    // Move terms in deleted category to 'Diccionario General'
    setDictionary((prev) =>
      prev.map((d) => (d.category === catName ? { ...d, category: 'Diccionario General' } : d))
    );
  };

  const handleUpdateDictionaryItem = (updatedItem: DictionaryItem) => {
    setDictionary((prev) => prev.map((d) => (d.id === updatedItem.id ? updatedItem : d)));
  };

  const handleAddAnnotation = (
    bookId: string,
    text: string,
    type: 'quote' | 'note' | 'bookmark',
    color: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber',
    note?: string
  ) => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      bookId,
      type,
      color,
      text,
      note,
      page: 1,
      createdAt: new Date().toLocaleDateString('es-ES'),
    };

    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, annotations: [newAnn, ...b.annotations] } : b))
    );

    if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
      setSelectedBookForDetails((b) =>
        b ? { ...b, annotations: [newAnn, ...b.annotations] } : null
      );
    }
  };

  const handleDeleteAnnotation = (bookId: string, annotationId: string) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, annotations: b.annotations.filter((a) => a.id !== annotationId) }
          : b
      )
    );
    if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
      setSelectedBookForDetails((b) =>
        b ? { ...b, annotations: b.annotations.filter((a) => a.id !== annotationId) } : null
      );
    }
  };

  const handleAddToDictionary = (item: Omit<DictionaryItem, 'id' | 'createdAt'>) => {
    const newItem: DictionaryItem = {
      ...item,
      id: `dict-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('es-ES'),
    };
    setDictionary((prev) => [newItem, ...prev]);
  };

  const handleDeleteDictionaryItem = (id: string) => {
    setDictionary((prev) => prev.filter((d) => d.id !== id));
  };

  // Filter books according to active shelf, active category, and search query
  const filteredBooks = books
    .filter((b) => {
      if (activeCategory) {
        if (activeCategory === 'SIN CATEGORÍA') {
          return !b.category || b.category.trim() === '';
        }
        return b.category === activeCategory;
      }
      if (activeShelf === 'all') return true;
      if (activeShelf === 'favorites') return b.isFavorite;
      if (activeShelf === 'completed') return b.isCompleted;
      if (activeShelf === 'to-read') return b.shelf === 'to-read' && !b.isCompleted;
      if (activeShelf === 'reading') return b.shelf === 'reading' && !b.isCompleted;
      return b.shelf === activeShelf;
    })
    .filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.format.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    });

  // Shelf Section Titles
  const shelfTitles: Record<string, string> = {
    reading: 'Leyendo Ahora',
    all: 'Todos los Libros',
    favorites: 'Libros Favoritos',
    'to-read': 'Por Leer',
    completed: 'Libros Terminados',
    finance: 'Finanzas y Análisis',
    comics: 'Cómics y Manga',
  };

  const currentTitle = activeCategory
    ? activeCategory === 'SIN CATEGORÍA'
      ? 'Sin Categoría'
      : activeCategory
    : shelfTitles[activeShelf] || 'Leyendo Ahora';

  // Android Navigation bar handlers
  const handleAndroidBack = () => {
    if (activeReadingBook) {
      setActiveReadingBook(null);
      stopTTS();
    } else if (isAIChatOpen) {
      setIsAIChatOpen(false);
    } else if (isThemeCustomizerOpen) {
      setIsThemeCustomizerOpen(false);
    } else if (selectedBookForDetails) {
      setSelectedBookForDetails(null);
    } else if (isDrawerOpen) {
      setIsDrawerOpen(false);
    } else if (isAddBookOpen) {
      setIsAddBookOpen(false);
    } else if (isDictionaryNotesOpen) {
      setIsDictionaryNotesOpen(false);
    } else if (isSyncOpen) {
      setIsSyncOpen(false);
    } else if (isSettingsOpen) {
      setIsSettingsOpen(false);
    } else if (activeCategory !== null) {
      setActiveCategory(null);
    } else if (activeShelf !== 'reading') {
      setActiveShelf('reading');
    }
  };

  const handleAndroidHome = () => {
    setActiveReadingBook(null);
    setSelectedBookForDetails(null);
    setIsAIChatOpen(false);
    setIsThemeCustomizerOpen(false);
    setIsDrawerOpen(false);
    setIsAddBookOpen(false);
    setIsDictionaryNotesOpen(false);
    setIsSyncOpen(false);
    setIsSettingsOpen(false);
    setActiveCategory(null);
    setActiveShelf('reading');
    stopTTS();
  };

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col items-center justify-center p-0 md:p-4 select-none transition-colors duration-300"
      style={{
        backgroundColor: currentAppTheme.isDark ? '#020b0e' : '#e2ded4',
      }}
    >
      {/* Top Controls Bar for desktop presentation (Viewport mode & quick AI) */}
      <div className="w-full max-w-4xl py-2 px-3 hidden md:flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-teal-400">Libris Android</span>
          <span aria-hidden="true">·</span>
          <span>Lector de Libros, Estantería Virtual & IA</span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Quick Button */}
          <button
            onClick={() => {
              setAiTargetBook(null);
              setIsAIChatOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-teal-500/20 to-sky-500/20 hover:from-teal-500/30 hover:to-sky-500/30 border border-teal-500/40 rounded-lg text-teal-300 font-bold transition-all active:scale-95 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interacción con la Inteligencia Artificial</span>
          </button>

          <button
            onClick={() => setIsAndroidFrame((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-teal-300 font-medium transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isAndroidFrame ? 'Pantalla Completa' : 'Marco Android'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Android Phone Frame OR Full Immersive View */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden shadow-2xl relative ${
          isAndroidFrame
            ? 'h-[100dvh] md:h-[92vh] md:max-w-[430px] md:max-h-[890px] md:rounded-3xl md:border-[6px] md:border-[#0c2e3a]'
            : 'max-w-5xl h-[100dvh] md:h-[94vh] md:rounded-2xl border'
        }`}
        style={{
          backgroundColor: currentAppTheme.bgCanvas,
          borderColor: isAndroidFrame ? undefined : currentAppTheme.border,
          color: currentAppTheme.textPrimary,
        }}
      >
        {/* Android Status Bar matching the mobile status */}
        {!Capacitor.isNativePlatform() && <AndroidStatusBar
          bgColor={currentAppTheme.headerBg}
          textColor={currentAppTheme.textSecondary}
          theme={currentAppTheme.isDark ? 'dark' : 'light'}
        />}

        {/* Top App Bar (hamburger, title, AI quick button, search, and more menu) */}
        <TopBar
          title={currentTitle}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onOpenDictionaryNotes={() => setIsDictionaryNotesOpen(true)}
          onOpenSync={() => setIsSyncOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAIChat={() => {
            setAiTargetBook(null);
            setIsAIChatOpen(true);
          }}
          onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
          themeConfig={currentAppTheme}
        />

        {/* Active Category Filter Banner (shown only when a category is selected) */}
        {activeCategory && (
          <div
            className="w-full px-3 py-1.5 border-b flex items-center justify-between text-xs transition-colors shrink-0"
            style={{
              backgroundColor: currentAppTheme.bgSurface,
              borderColor: currentAppTheme.border,
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Tag className="w-3.5 h-3.5 shrink-0" style={{ color: currentAppTheme.accent }} />
              <span className="text-[11px] opacity-75">Categoría:</span>
              <span className="font-bold text-xs truncate" style={{ color: currentAppTheme.accent }}>
                {activeCategory}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 opacity-75 font-mono">
                {filteredBooks.length}
              </span>
            </div>
            <button
              onClick={() => setActiveCategory(null)}
              className="p-1 hover:bg-white/10 rounded flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100"
              title="Quitar filtro de categoría"
            >
              <span>Ver todos</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area: Bookshelf / Cards / Grid / List */}
        <div
          className="flex-1 overflow-y-auto transition-colors"
          style={{ backgroundColor: currentAppTheme.bgCanvas }}
        >
          {filteredBooks.length === 0 ? (
            <div className="p-8 text-center opacity-75 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto" style={{ color: currentAppTheme.accent }} />
              <p className="text-sm font-medium">No hay libros que coincidan con la búsqueda o categoría.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                  setActiveShelf('all');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: currentAppTheme.bgCard,
                  color: currentAppTheme.accent,
                }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : viewMode === 'shelf' ? (
            // Realistic Wooden Bookshelf View with customizable wood material or custom user color
            <BookshelfView
              books={filteredBooks}
              onSelect={(b) => setSelectedBookForDetails(b)}
              onRead={(b) => setActiveReadingBook(b)}
              shelfWood={currentShelfWood}
              customShelfColor={
                appThemeId === 'custom' || shelfWoodId === 'custom'
                  ? customColors.shelfColor
                  : undefined
              }
            />
          ) : viewMode === 'cards' ? (
            // Detailed Cards View
            <div className="divide-y" style={{ borderColor: currentAppTheme.border }}>
              {filteredBooks.map((book) => (
                <BookCardItem
                  key={book.id}
                  book={book}
                  onSelect={(b) => setSelectedBookForDetails(b)}
                  onRead={(b) => setActiveReadingBook(b)}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleCompleted={handleToggleCompleted}
                  onOpenShelfSelector={(b) => setShelfTargetBook(b)}
                  onOpenActions={(b) => setSelectedBookForDetails(b)}
                  themeConfig={currentAppTheme}
                />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            // Covers Grid View
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBookForDetails(book)}
                  className="p-2.5 rounded-xl border cursor-pointer transition-all group flex flex-col justify-between hover:-translate-y-1"
                  style={{
                    backgroundColor: currentAppTheme.bgCard,
                    borderColor: currentAppTheme.border,
                  }}
                >
                  <div className="relative aspect-[3/4.2] rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shadow-md">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 bg-black/80 text-[9px] font-bold text-teal-300 px-1 rounded">
                      {book.format}
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3
                      className="text-xs font-semibold line-clamp-1"
                      style={{ color: currentAppTheme.textPrimary }}
                    >
                      {book.title}
                    </h3>
                    <p
                      className="text-[11px] truncate mt-0.5 opacity-75"
                      style={{ color: currentAppTheme.textSecondary }}
                    >
                      {book.author}
                    </p>
                    <div className="w-full h-1 bg-black/30 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.round((book.currentPage / book.totalPages) * 100)}%`,
                          backgroundColor: currentAppTheme.accent,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Compact Table List View
            <div className="divide-y" style={{ borderColor: currentAppTheme.border }}>
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBookForDetails(book)}
                  className="p-3 flex items-center justify-between cursor-pointer text-xs transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-12 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                      <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold truncate"
                        style={{ color: currentAppTheme.textPrimary }}
                      >
                        {book.title}
                      </h3>
                      <p
                        className="text-[11px] opacity-75"
                        style={{ color: currentAppTheme.textSecondary }}
                      >
                        {book.author} · {book.format} ({book.fileSize})
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-right shrink-0 font-mono text-[11px] font-bold"
                    style={{ color: currentAppTheme.accent }}
                  >
                    {Math.round((book.currentPage / book.totalPages) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Android Bottom Navigation Bar (Back, Home, Recents) */}
        {!Capacitor.isNativePlatform() && <AndroidNavBar
          onBack={handleAndroidBack}
          onHome={handleAndroidHome}
          onRecents={() => setIsSettingsOpen(true)}
          bgColor={currentAppTheme.headerBg}
          borderColor={currentAppTheme.border}
          textColor={currentAppTheme.textSecondary}
        />}
      </div>

      {/* Book Characteristics Details Modal */}
      {selectedBookForDetails && (
        <BookDetailModal
          book={selectedBookForDetails}
          onClose={() => setSelectedBookForDetails(null)}
          onRead={(b) => {
            setSelectedBookForDetails(null);
            setActiveReadingBook(b);
          }}
          onListenTTS={(b) => {
            setSelectedBookForDetails(null);
            setActiveReadingBook(b);
            const content = b.content[0] || b.title;
            startTTS(content);
          }}
          onToggleFavorite={handleToggleFavorite}
          onToggleCompleted={handleToggleCompleted}
          onUpdateProgress={handleUpdateProgress}
          onChangeShelf={handleChangeShelf}
          onDeleteBook={handleDeleteBook}
          onAddAnnotation={handleAddAnnotation}
          onAskAI={(b) => {
            setSelectedBookForDetails(null);
            setAiTargetBook(b);
            setIsAIChatOpen(true);
          }}
          categories={categories}
          onUpdateCategory={handleUpdateBookCategory}
          onCreateCategory={handleCreateCategory}
        />
      )}

      {/* Advanced Full Reader Screen */}
      {activeReadingBook && (
        <ReaderView
          book={activeReadingBook}
          onClose={() => {
            setActiveReadingBook(null);
            stopTTS();
          }}
          onUpdateProgress={handleUpdateProgress}
          onAddAnnotation={handleAddAnnotation}
          onAddToDictionary={handleAddToDictionary}
          dictionaryItems={dictionary}
          dictCategories={dictCategories}
          onCreateDictCategory={handleCreateDictCategory}
          themeConfig={currentAppTheme}
          onStartTTS={(text) => startTTS(text)}
          isTTSSpeaking={isTTSSpeaking}
          onStopTTS={stopTTS}
        />
      )}

      {/* Floating TTS Player Bar */}
      <TTSPlayerBar
        isPlaying={isTTSSpeaking}
        isPaused={isTTSPaused}
        onPlay={() => {
          if (activeReadingBook) {
            startTTS(activeReadingBook.content[0] || activeReadingBook.title);
          }
        }}
        onPause={pauseTTS}
        onResume={resumeTTS}
        onStop={stopTTS}
        voices={voices}
        settings={ttsSettings}
        onUpdateRate={updateTTSRate}
        onSelectVoice={(uri) => setTTSSettings((s) => ({ ...s, voiceUri: uri }))}
        onToggleFavoriteVoice={toggleFavoriteVoice}
        onUpdateSettings={(s) => setTTSSettings((prev) => ({ ...prev, ...s }))}
      />

      {/* Sidebar Drawer Menu */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeShelf={activeShelf}
        onSelectShelf={setActiveShelf}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
        books={books}
        onOpenAddBook={() => setIsAddBookOpen(true)}
        onOpenDictionaryNotes={() => setIsDictionaryNotesOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAIChat={() => {
          setAiTargetBook(null);
          setIsAIChatOpen(true);
        }}
        onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        themeConfig={currentAppTheme}
      />

      {/* AI Book Chat & Assistant Modal */}
      {isAIChatOpen && (
        <AIBookChatModal
          books={books}
          initialSelectedBook={aiTargetBook}
          onClose={() => setIsAIChatOpen(false)}
          onReadBook={(b) => {
            setIsAIChatOpen(false);
            setActiveReadingBook(b);
          }}
        />
      )}

      {/* Theme & Shelf Wood Customizer Modal */}
      {isThemeCustomizerOpen && (
        <ThemeCustomizerModal
          onClose={() => setIsThemeCustomizerOpen(false)}
          currentAppTheme={appThemeId}
          currentShelfWood={shelfWoodId}
          customColors={customColors}
          onSelectAppTheme={setAppThemeId}
          onSelectShelfWood={setShelfWoodId}
          onUpdateCustomColors={setCustomColors}
        />
      )}

      {/* Dictionary, Quotes, and Notes Modal */}
      {isDictionaryNotesOpen && (
        <DictionaryNotesModal
          books={books}
          dictionary={dictionary}
          dictCategories={dictCategories}
          onClose={() => setIsDictionaryNotesOpen(false)}
          onSelectBook={(b) => {
            setIsDictionaryNotesOpen(false);
            setSelectedBookForDetails(b);
          }}
          onReadBook={(b) => {
            setIsDictionaryNotesOpen(false);
            setActiveReadingBook(b);
          }}
          onDeleteDictionaryItem={handleDeleteDictionaryItem}
          onAddDictionaryItem={handleAddToDictionary}
          onUpdateDictionaryItem={handleUpdateDictionaryItem}
          onCreateDictCategory={handleCreateDictCategory}
          onDeleteDictCategory={handleDeleteDictCategory}
          onDeleteAnnotation={handleDeleteAnnotation}
        />
      )}

      {/* Add / Upload Book Modal */}
      {isAddBookOpen && (
        <AddBookModal
          onClose={() => setIsAddBookOpen(false)}
          onAddBook={(newBook) => {
            setBooks((prev) => [newBook, ...prev]);
            setSelectedBookForDetails(newBook);
          }}
        />
      )}

      {/* Cloud Sync Modal */}
      {isSyncOpen && (
        <SyncModal
          onClose={() => setIsSyncOpen(false)}
          books={books}
          dictionary={dictionary}
          onImportBackup={(newBooks, newDict) => {
            setBooks(newBooks);
            setDictionary(newDict);
          }}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          isAndroidFrame={isAndroidFrame}
          onToggleAndroidFrame={() => setIsAndroidFrame((p) => !p)}
          onRemoveDuplicates={() => {
            const seen = new Set<string>();
            const unique = books.filter((b) => {
              const lower = b.title.trim().toLowerCase();
              if (seen.has(lower)) return false;
              seen.add(lower);
              return true;
            });
            setBooks(unique);
          }}
          onResetLibrary={() => {
            setBooks(INITIAL_BOOKS);
            setDictionary(INITIAL_DICTIONARY);
            setCategories(INITIAL_CATEGORIES);
            setDictCategories(INITIAL_DICT_CATEGORIES);
          }}
          onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
          onOpenAIChat={() => {
            setAiTargetBook(null);
            setIsAIChatOpen(true);
          }}
          booksCount={books.length}
        />
      )}

      {/* Quick Shelf Change Modal */}
      {shelfTargetBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-[#082a36] text-slate-100 rounded-2xl border border-[#0f3847] p-4 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Mover a Estantería
            </h3>
            <p className="text-xs text-slate-300 font-medium truncate">
              {shelfTargetBook.title}
            </p>
            <div className="space-y-1 text-xs">
              {(
                [
                  ['reading', 'Leyendo ahora'],
                  ['to-read', 'Por Leer'],
                  ['completed', 'Terminados'],
                  ['favorites', 'Favoritos'],
                ] as const
              ).map(([sKey, sLabel]) => (
                <button
                  key={sKey}
                  onClick={() => handleChangeShelf(shelfTargetBook.id, sKey as ShelfCategory)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    shelfTargetBook.shelf === sKey
                      ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {sLabel}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShelfTargetBook(null)}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Install Guide Modal for Mobile */}
      {isInstallGuideOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#082a36] text-slate-100 rounded-2xl border border-teal-500/40 p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#0f3847]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h3 className="font-bold text-sm text-white">Instalar en la pantalla de inicio</h3>
              </div>
              <button
                onClick={() => setIsInstallGuideOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {canPromptDirectly && (
              <button
                onClick={async () => {
                  await triggerInstall();
                  setIsInstallGuideOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <span>Instalar aplicación directamente</span>
              </button>
            )}

            <div className="space-y-3 text-xs text-slate-200">
              <div className="bg-[#051a22] p-3 rounded-xl border border-[#0f3847] space-y-1.5">
                <div className="font-bold text-teal-300 flex items-center gap-1.5">
                  <span>1. En el menú de Chrome:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Toca los <strong>tres puntos (⋮)</strong> arriba a la derecha y selecciona <strong>«Crear acceso directo»</strong>.
                </p>
                <p className="text-[10px] text-emerald-300 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/30">
                  ✓ Al tocar «Crear acceso directo», el icono de Libris aparecerá en la pantalla principal de tu teléfono y se abrirá a pantalla completa como una app nativa.
                </p>
              </div>

              <div className="bg-[#051a22] p-3 rounded-xl border border-[#0f3847] space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>⚠️ Aclaración sobre la carpeta «Descargas»:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Si presionas la flecha de descarga (⬇️) en Chrome, se descarga una copia HTML a tu carpeta de archivos. Las aplicaciones para móvil no se instalan abriendo ese archivo, sino tocando <strong>«Crear acceso directo»</strong> o compilando el APK.
                </p>
              </div>

              {/* Direct ZIP Download */}
              <a
                href="/libris-app-source.zip"
                download="libris-app-source.zip"
                className="w-full py-2.5 px-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">📦</span>
                  <span>Descargar código fuente (.ZIP)</span>
                </div>
                <span className="font-mono text-[10px] bg-teal-500/20 px-1.5 py-0.5 rounded">6.6 MB</span>
              </a>
            </div>

            <button
              onClick={() => setIsInstallGuideOpen(false)}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
