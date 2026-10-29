import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Library,
  Star,
  Clock,
  CheckCheck,
  Bookmark,
  FolderPlus,
  Settings,
  Palette,
  Bot,
  Tag,
  Plus,
  Trash2,
  Cloud,
  AlertTriangle
} from 'lucide-react';
import { Book, ShelfCategory } from '../types/book';
import { AppThemeConfig } from '../types/theme';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeShelf: ShelfCategory | 'all';
  onSelectShelf: (shelf: ShelfCategory | 'all') => void;
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onCreateCategory: (catName: string) => void;
  onDeleteCategory: (catName: string) => void;
  books: Book[];
  onOpenAddBook: () => void;
  onOpenDictionaryNotes: () => void;
  onOpenSync: () => void;
  onOpenSettings: () => void;
  onOpenAIChat: () => void;
  onOpenThemeCustomizer: () => void;
  onOpenInstallGuide?: () => void;
  themeConfig: AppThemeConfig;
}

export function SidebarDrawer({
  isOpen,
  onClose,
  activeShelf,
  onSelectShelf,
  categories,
  activeCategory,
  onSelectCategory,
  onCreateCategory,
  onDeleteCategory,
  books,
  onOpenAddBook,
  onOpenDictionaryNotes,
  onOpenSync,
  onOpenSettings,
  onOpenAIChat,
  onOpenThemeCustomizer,
  onOpenInstallGuide,
  themeConfig,
}: SidebarDrawerProps) {
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const shelves = [
    { id: 'reading', label: 'Leyendo Ahora', icon: BookOpen, count: books.filter((b) => b.shelf === 'reading').length },
    { id: 'all', label: 'Todos los Libros', icon: Library, count: books.length },
    { id: 'favorites', label: 'Favoritos', icon: Star, count: books.filter((b) => b.isFavorite).length },
    { id: 'to-read', label: 'Por Leer', icon: Clock, count: books.filter((b) => b.shelf === 'to-read').length },
    { id: 'completed', label: 'Terminados', icon: CheckCheck, count: books.filter((b) => b.isCompleted).length },
  ];

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onCreateCategory(newCatName.trim());
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const uncategorizedCount = books.filter((b) => !b.category || b.category.trim() === '').length;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer content panel */}
      <div
        className="relative w-76 max-w-[85vw] h-full flex flex-col justify-between z-10 shadow-2xl border-r animate-in slide-in-from-left duration-200"
        style={{
          backgroundColor: themeConfig.bgSurface,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        <div className="overflow-y-auto">
          {/* Header Brand */}
          <div
            className="p-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: themeConfig.headerBg,
              borderColor: themeConfig.border,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs"
                style={{
                  backgroundColor: themeConfig.accentBg,
                  color: themeConfig.accentText,
                }}
              >
                L
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide">
                  Libris
                </h2>
                <p className="text-[11px] opacity-75">Estantería & Lector</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 opacity-80 hover:opacity-100 rounded-lg active:bg-white/10"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Banner Shortcut */}
          <div className="p-3">
            <button
              onClick={() => {
                onOpenAIChat();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl border flex items-center gap-2.5 transition-transform active:scale-98 shadow-sm"
              style={{
                backgroundColor: themeConfig.bgCard,
                borderColor: themeConfig.accent,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: themeConfig.accentBg,
                  color: themeConfig.accentText,
                }}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-xs font-bold block truncate" style={{ color: themeConfig.accent }}>
                  Interacción con la Inteligencia Artificial
                </span>
                <span className="text-[10px] opacity-75 block truncate">
                  Gemini · Claude · ChatGPT · Copilot
                </span>
              </div>
            </button>
          </div>

          {/* Core Shelves */}
          <div className="px-2 pb-1 space-y-0.5 text-xs">
            <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider opacity-75">
              Biblioteca
            </div>

            {shelves.map((sh) => {
              const Icon = sh.icon;
              const isActive = activeShelf === sh.id && activeCategory === null;
              return (
                <button
                  key={sh.id}
                  onClick={() => {
                    onSelectCategory(null);
                    onSelectShelf(sh.id as any);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'font-bold shadow-xs'
                      : 'hover:bg-white/5 opacity-90'
                  }`}
                  style={{
                    backgroundColor: isActive ? themeConfig.bgCard : undefined,
                    color: isActive ? themeConfig.accent : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" style={{ color: themeConfig.accent }} />
                    <span>{sh.label}</span>
                  </div>
                  <span className="text-[11px] font-mono opacity-75">
                    {sh.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DEDICATED CATEGORIES SECTION */}
          <div className="px-2 py-2 border-t mt-1" style={{ borderColor: themeConfig.border }}>
            <div className="flex items-center justify-between px-3 py-1 text-[10px] uppercase font-bold tracking-wider opacity-75">
              <span>Categorías</span>
              <button
                onClick={() => setShowNewCatInput((p) => !p)}
                className="p-1 rounded hover:bg-white/10 text-teal-400 flex items-center gap-0.5 lowercase text-[10px] font-semibold"
                title="Crear nueva categoría"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>nueva</span>
              </button>
            </div>

            {/* Create Category Inline Form */}
            {showNewCatInput && (
              <form onSubmit={handleCreateCategorySubmit} className="p-2 space-y-1.5 my-1 bg-black/20 rounded-xl">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nombre de la categoría..."
                  className="w-full bg-[#0a232d] border border-[#144759] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(false)}
                    className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-0.5 bg-teal-500 text-slate-950 font-bold rounded text-[11px]"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {/* Categories List */}
            <div className="space-y-0.5 text-xs">
              {categories.map((cat) => {
                const count = books.filter((b) => b.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <div
                    key={cat}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors group ${
                      isActive ? 'font-bold shadow-xs' : 'hover:bg-white/5 opacity-90'
                    }`}
                    style={{
                      backgroundColor: isActive ? themeConfig.bgCard : undefined,
                      color: isActive ? themeConfig.accent : undefined,
                    }}
                  >
                    <button
                      onClick={() => {
                        onSelectCategory(cat);
                        onClose();
                      }}
                      className="flex-1 text-left flex items-center gap-2.5 truncate"
                    >
                      <Tag className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{cat}</span>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-mono opacity-75">
                        {count}
                      </span>
                      {/* Delete category trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryToDelete(cat);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Uncategorized Books Filter Entry */}
              {uncategorizedCount > 0 && (
                <button
                  onClick={() => {
                    onSelectCategory('SIN CATEGORÍA');
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-xs ${
                    activeCategory === 'SIN CATEGORÍA' ? 'font-bold shadow-xs' : 'hover:bg-white/5 opacity-80 text-amber-300/90'
                  }`}
                  style={{
                    backgroundColor: activeCategory === 'SIN CATEGORÍA' ? themeConfig.bgCard : undefined,
                    color: activeCategory === 'SIN CATEGORÍA' ? themeConfig.accent : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sin Categoría</span>
                  </div>
                  <span className="text-[11px] font-mono opacity-75">
                    {uncategorizedCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Tools & Customization */}
          <div className="px-2 py-2 border-t space-y-1 text-xs" style={{ borderColor: themeConfig.border }}>
            <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider opacity-75">
              Herramientas
            </div>

            {/* Color Customizer */}
            <button
              onClick={() => {
                onOpenThemeCustomizer();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 opacity-90"
            >
              <Palette className="w-4 h-4 text-pink-400" />
              <span>Color de la App y Estantería</span>
            </button>

            {/* Add Book */}
            <button
              onClick={() => {
                onOpenAddBook();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 opacity-90"
            >
              <FolderPlus className="w-4 h-4 text-sky-400" />
              <span>Añadir o Subir Libro</span>
            </button>

            {/* Dictionary & Notes */}
            <button
              onClick={() => {
                onOpenDictionaryNotes();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 opacity-90"
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Citas, Notas y Diccionario</span>
            </button>

            {/* Cloud Sync */}
            <button
              onClick={() => {
                onOpenSync();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 opacity-90"
            >
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>Google Drive Sync</span>
            </button>
          </div>
        </div>

        {/* Footer Settings & Install App */}
        <div
          className="p-3 border-t space-y-1.5"
          style={{
            backgroundColor: themeConfig.headerBg,
            borderColor: themeConfig.border,
          }}
        >
          <button
            onClick={() => {
              if (onOpenInstallGuide) onOpenInstallGuide();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 transition-all active:scale-98"
          >
            <span className="text-sm">📲</span>
            <span>Instalar en mi Celular</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs opacity-90 hover:opacity-100 hover:bg-white/5"
          >
            <Settings className="w-4 h-4 opacity-75" />
            <span>Configuración y Rendimiento</span>
          </button>
        </div>
      </div>

      {/* Category Deletion Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#082a36] text-slate-100 rounded-2xl border border-rose-500/40 p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">¿Eliminar categoría?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Realmente deseas eliminar la categoría <span className="font-bold text-white">"{categoryToDelete}"</span>? Los libros asignados no se borrarán, pero pasarán a estar <span className="text-amber-300">"Sin Categoría"</span>.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#0f3847]">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCategory(categoryToDelete);
                  setCategoryToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
