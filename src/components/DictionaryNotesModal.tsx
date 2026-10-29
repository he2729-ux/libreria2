import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  BookOpen,
  ArrowUpDown,
  Clock,
  BookMarked,
  Tag,
  AlertTriangle,
  Check,
  Edit2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  FolderPlus
} from 'lucide-react';
import { Book, DictionaryItem, BookAnnotation } from '../types/book';

interface DictionaryNotesModalProps {
  books: Book[];
  dictionary: DictionaryItem[];
  dictCategories: string[];
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
  onDeleteDictionaryItem: (id: string) => void;
  onAddDictionaryItem: (item: Omit<DictionaryItem, 'id' | 'createdAt'>) => void;
  onUpdateDictionaryItem: (item: DictionaryItem) => void;
  onCreateDictCategory: (categoryName: string) => void;
  onDeleteDictCategory: (categoryName: string) => void;
  onDeleteAnnotation: (bookId: string, annotationId: string) => void;
}

export function DictionaryNotesModal({
  books,
  dictionary,
  dictCategories,
  onClose,
  onSelectBook,
  onReadBook,
  onDeleteDictionaryItem,
  onAddDictionaryItem,
  onUpdateDictionaryItem,
  onCreateDictCategory,
  onDeleteDictCategory,
  onDeleteAnnotation,
}: DictionaryNotesModalProps) {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'quotes' | 'notes'>('dictionary');
  const [searchQuery, setSearchQuery] = useState('');

  // Dictionary Sorting & Presentation Mode (Default: categories in alphabetical order with collapsible sections)
  const [dictSortMode, setDictSortMode] = useState<'categories-az' | 'alphabetical' | 'date'>('categories-az');
  const [showDictSortMenu, setShowDictSortMenu] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Quotes & Notes color filter and sorting
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'book-az'>('date-desc');

  // Add new word form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCategory, setNewCategory] = useState('Diccionario General');
  const [rememberLater, setRememberLater] = useState(false);
  const [customNewCategoryInput, setCustomNewCategoryInput] = useState('');
  const [isCreatingInlineCategory, setIsCreatingInlineCategory] = useState(false);

  // Quick edit definition for pending term
  const [definingItemId, setDefiningItemId] = useState<string | null>(null);
  const [definingText, setDefiningText] = useState('');
  const [definingTargetCategory, setDefiningTargetCategory] = useState('Diccionario General');

  // Category deletion confirmation
  const [dictCategoryToDelete, setDictCategoryToDelete] = useState<string | null>(null);

  // New category creation input in dictionary header
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Toggle single category collapse
  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Flatten all annotations across books
  const allAnnotations: Array<BookAnnotation & { bookTitle: string }> = books.flatMap((b) =>
    b.annotations.map((a) => ({ ...a, bookTitle: b.title }))
  );

  // Date parsing helper
  const parseDate = (dStr?: string) => {
    if (!dStr) return 0;
    const parts = dStr.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return new Date(dStr).getTime() || 0;
  };

  // Sort helper function for Quotes and Notes
  const sortAnnotations = (list: typeof allAnnotations) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'book-az') {
        return a.bookTitle.localeCompare(b.bookTitle, 'es');
      }
      const timeA = parseDate(a.createdAt);
      const timeB = parseDate(b.createdAt);
      return sortBy === 'date-desc' ? timeB - timeA : timeA - timeB;
    });
  };

  // Filtered and sorted quotes
  const filteredQuotes = sortAnnotations(
    allAnnotations
      .filter((a) => a.type === 'quote')
      .filter((a) => colorFilter === 'all' || a.color === colorFilter)
      .filter(
        (a) =>
          a.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Filtered and sorted notes
  const filteredNotes = sortAnnotations(
    allAnnotations
      .filter((a) => a.type === 'note' || a.type === 'bookmark')
      .filter((a) => colorFilter === 'all' || a.color === colorFilter)
      .filter(
        (a) =>
          a.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.note && a.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
          a.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Filter dictionary terms by search query
  const searchLower = searchQuery.toLowerCase().trim();
  const searchFilteredDictionary = dictionary.filter(
    (d) =>
      !searchLower ||
      d.term.toLowerCase().includes(searchLower) ||
      d.definition.toLowerCase().includes(searchLower) ||
      (d.category && d.category.toLowerCase().includes(searchLower))
  );

  // All distinct dictionary categories in alphabetical order
  const allKnownCategories = Array.from(
    new Set([
      ...dictCategories,
      ...dictionary.map((d) => (d.isPending ? 'Pendientes' : d.category || 'Diccionario General')),
    ])
  ).sort((a, b) => {
    // Put "Diccionario General" or "Pendientes" sensibly or sort strictly A-Z as requested
    return a.localeCompare(b, 'es', { sensitivity: 'base' });
  });

  const pendingCount = dictionary.filter((d) => d.category === 'Pendientes' || d.isPending).length;

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) return;

    let targetCat = newCategory;
    if (isCreatingInlineCategory && customNewCategoryInput.trim()) {
      targetCat = customNewCategoryInput.trim();
      onCreateDictCategory(targetCat);
    }

    const isPending = rememberLater || !newDefinition.trim();
    if (isPending && !isCreatingInlineCategory) {
      targetCat = 'Pendientes';
    }

    onAddDictionaryItem({
      term: newTerm.trim(),
      definition: newDefinition.trim(),
      category: isPending ? 'Pendientes' : targetCat,
      isPending,
    });

    setNewTerm('');
    setNewDefinition('');
    setRememberLater(false);
    setIsCreatingInlineCategory(false);
    setCustomNewCategoryInput('');
    setShowAddForm(false);
  };

  const handleSavePendingDefinition = (item: DictionaryItem) => {
    if (!definingText.trim()) return;
    onUpdateDictionaryItem({
      ...item,
      definition: definingText.trim(),
      isPending: false,
      category: definingTargetCategory || 'Diccionario General',
    });
    setDefiningItemId(null);
    setDefiningText('');
  };

  const handleCategoryCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onCreateDictCategory(newCatName.trim());
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const colorStyles: Record<string, string> = {
    yellow: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    blue: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
    rose: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
    amber: 'border-orange-400/40 bg-orange-400/10 text-orange-200',
  };

  // Helper to render an individual dictionary card
  const renderDictionaryItemCard = (item: DictionaryItem, showCategoryBadge: boolean = true) => {
    const isPending = item.isPending || item.category === 'Pendientes';
    const isDefining = definingItemId === item.id;

    return (
      <div
        key={item.id}
        className="p-3.5 hover:bg-white/[0.03] transition-colors flex flex-col gap-2 border-b border-[#0f3847]/70 last:border-b-0"
      >
        {/* Term Row Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <h4 className="font-bold text-sm text-white tracking-wide">{item.term}</h4>

            {showCategoryBadge && (
              <div className="flex items-center gap-1">
                {isPending ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Clock className="w-3 h-3" />
                    <span>Pendiente</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    <Tag className="w-2.5 h-2.5 opacity-75" />
                    <span>{item.category || 'Diccionario General'}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={item.category || 'Diccionario General'}
              onChange={(e) => {
                const newCat = e.target.value;
                onUpdateDictionaryItem({
                  ...item,
                  category: newCat,
                  isPending: newCat === 'Pendientes',
                });
              }}
              className="bg-[#0d3b4b] border border-[#174d61] text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
              title="Mover a otra categoría"
            >
              {dictCategories.map((c) => (
                <option key={c} value={c} className="bg-[#082a36]">
                  Mover a: {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => onDeleteDictionaryItem(item.id)}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition-colors"
              title="Eliminar término"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Definition Text or Inline Add Definition for Pending */}
        {isDefining ? (
          <div className="p-2.5 bg-[#0a2732] rounded-lg border border-teal-500/40 space-y-2 mt-1">
            <label className="text-[11px] font-semibold text-teal-300 block">
              Agregar definición a "{item.term}":
            </label>
            <textarea
              value={definingText}
              onChange={(e) => setDefiningText(e.target.value)}
              placeholder="Escribe la explicación del término..."
              rows={2}
              className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white text-xs placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Pasar a:</span>
                <select
                  value={definingTargetCategory}
                  onChange={(e) => setDefiningTargetCategory(e.target.value)}
                  className="bg-[#0d3b4b] border border-[#174d61] rounded px-2 py-1 text-[11px] text-white"
                >
                  {dictCategories
                    .filter((c) => c !== 'Pendientes')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDefiningItemId(null)}
                  className="px-2.5 py-1 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePendingDefinition(item)}
                  className="px-3 py-1 bg-teal-500 text-slate-950 font-bold rounded-lg flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        ) : isPending && !item.definition ? (
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5 mt-1">
            <span className="text-xs text-amber-300/90 italic">
              Definición pendiente de completar.
            </span>
            <button
              onClick={() => {
                setDefiningItemId(item.id);
                setDefiningText('');
                setDefiningTargetCategory('Diccionario General');
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Completar definición</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {item.definition}
          </p>
        )}

        {/* Metadata Footer */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-white/5">
          <span className="truncate">
            {item.bookTitle ? (
              <span className="inline-flex items-center gap-1 text-slate-300">
                <BookOpen className="w-2.5 h-2.5 text-teal-400" />
                {item.bookTitle}
              </span>
            ) : (
              'Agregado directamente'
            )}
          </span>
          <span className="font-mono opacity-75">{item.createdAt}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#082a36] text-slate-100 sm:rounded-2xl border border-[#0f3847] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-14 px-4 border-b border-[#0f3847] flex items-center justify-between shrink-0 bg-[#062029]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold tracking-tight text-white uppercase">
              Diccionario, Citas y Notas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tab Selection (Diccionario, Citas, Notas) */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-[#0f3847] bg-[#072530] text-xs">
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'dictionary'
                ? 'border-teal-400 text-teal-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Diccionario ({dictionary.length})</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'quotes'
                ? 'border-teal-400 text-teal-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Citas ({allAnnotations.filter((a) => a.type === 'quote').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'notes'
                ? 'border-teal-400 text-teal-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookMarked className="w-4 h-4 text-emerald-400" />
            <span>Notas ({allAnnotations.filter((a) => a.type !== 'quote').length})</span>
          </button>
        </div>

        {/* Search & Action Controls Bar */}
        <div className="p-3 bg-[#062029] border-b border-[#0f3847] flex flex-wrap gap-2 items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#0d3b4b] rounded-lg px-2.5 py-1.5 border border-[#174d61]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'dictionary'
                  ? 'Buscar concepto, palabra o definición...'
                  : activeTab === 'quotes'
                  ? 'Buscar en citas...'
                  : 'Buscar en notas...'
              }
              className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Controls for Dictionary Tab: 3-Dots Menu, + Categoría, + Término */}
          {activeTab === 'dictionary' && (
            <div className="flex items-center gap-1.5 relative">
              <button
                onClick={() => setShowNewCatInput((p) => !p)}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-teal-300 border border-teal-500/30 flex items-center gap-1 text-xs font-medium"
                title="Crear nueva lista o categoría de diccionario"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva Lista</span>
              </button>

              <button
                onClick={() => setShowAddForm((p) => !p)}
                className="px-3 py-1.5 text-xs font-semibold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 rounded-lg border border-sky-500/40 flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cerrar' : 'Nuevo Término'}</span>
              </button>

              {/* 3-Dots Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowDictSortMenu((p) => !p)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    showDictSortMenu
                      ? 'bg-teal-500 text-slate-950 border-teal-400'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                  }`}
                  title="Opciones de ordenación del Diccionario"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu for Dictionary Sorting */}
                {showDictSortMenu && (
                  <div
                    className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-[#082a36] border border-[#174d61] rounded-xl shadow-2xl p-1.5 space-y-1 text-xs animate-in fade-in"
                    onClick={() => setShowDictSortMenu(false)}
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-300 border-b border-[#0f3847]">
                      Ordenar Diccionario
                    </div>

                    <button
                      onClick={() => setDictSortMode('categories-az')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        dictSortMode === 'categories-az'
                          ? 'bg-teal-500/20 text-teal-300 font-bold'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Por categorías / listas (A - Z)</span>
                        <span className="text-[10px] opacity-70">
                          Agrupadas alfabéticamente y contraíbles
                        </span>
                      </div>
                      {dictSortMode === 'categories-az' && (
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />
                      )}
                    </button>

                    <button
                      onClick={() => setDictSortMode('alphabetical')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        dictSortMode === 'alphabetical'
                          ? 'bg-teal-500/20 text-teal-300 font-bold'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Alfabético general (A - Z)</span>
                        <span className="text-[10px] opacity-70">
                          Lista corrida con etiquetas de categoría
                        </span>
                      </div>
                      {dictSortMode === 'alphabetical' && (
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />
                      )}
                    </button>

                    <button
                      onClick={() => setDictSortMode('date')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        dictSortMode === 'date'
                          ? 'bg-teal-500/20 text-teal-300 font-bold'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Por fecha de agregación</span>
                        <span className="text-[10px] opacity-70">
                          Términos más recientes primero
                        </span>
                      </div>
                      {dictSortMode === 'date' && (
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conditional Controls: Sorting and Color filters for Citas/Notas */}
          {activeTab !== 'dictionary' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#0d3b4b] px-2 py-1 rounded-lg border border-[#174d61]">
                <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[11px] text-white focus:outline-none cursor-pointer"
                >
                  <option value="date-desc" className="bg-[#082a36] text-white">
                    Fecha (más reciente)
                  </option>
                  <option value="date-asc" className="bg-[#082a36] text-white">
                    Fecha (más antigua)
                  </option>
                  <option value="book-az" className="bg-[#082a36] text-white">
                    Nombre del libro (A-Z)
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 pl-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Filter className="w-3 h-3" /> Color:
                </span>
                <button
                  onClick={() => setColorFilter('all')}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    colorFilter === 'all'
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  Todos
                </button>
                {(['yellow', 'emerald', 'blue', 'rose', 'amber'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColorFilter(colorFilter === c ? 'all' : c)}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                      c === 'yellow'
                        ? 'bg-amber-400'
                        : c === 'emerald'
                        ? 'bg-emerald-400'
                        : c === 'blue'
                        ? 'bg-sky-400'
                        : c === 'rose'
                        ? 'bg-rose-400'
                        : 'bg-orange-400'
                    } ${colorFilter === c ? 'scale-125 border-white' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: DICCIONARIO EN FORMA DE LISTA (SIN PESTAÑAS CONFUSAS) */}
          {activeTab === 'dictionary' && (
            <div className="space-y-3">
              {/* Category creation inline input */}
              {showNewCatInput && (
                <form
                  onSubmit={handleCategoryCreateSubmit}
                  className="p-2.5 bg-[#062029] rounded-xl border border-teal-500/40 flex items-center gap-2 animate-in fade-in"
                >
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nombre de la nueva lista / categoría de diccionario..."
                    className="flex-1 bg-[#0d3b4b] border border-[#174d61] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-teal-400"
                  >
                    Crear Lista
                  </button>
                </form>
              )}

              {/* Add New Term Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateTerm}
                  className="bg-[#062029] p-4 rounded-xl border border-sky-500/40 space-y-3 text-xs animate-in fade-in"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        Palabra o Término *
                      </label>
                      <input
                        type="text"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        placeholder="Ej. Arbitraje, HODL, Resistencia..."
                        className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        Categoría / Lista
                      </label>
                      {!isCreatingInlineCategory ? (
                        <div className="flex gap-1.5">
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            disabled={rememberLater}
                            className="flex-1 bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white focus:outline-none disabled:opacity-50"
                          >
                            {dictCategories.map((c) => (
                              <option key={c} value={c} className="bg-[#082a36]">
                                {c}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsCreatingInlineCategory(true)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-teal-300 border border-teal-500/30 whitespace-nowrap"
                          >
                            + Nueva
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={customNewCategoryInput}
                            onChange={(e) => setCustomNewCategoryInput(e.target.value)}
                            placeholder="Nombre de la nueva lista..."
                            className="flex-1 bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setIsCreatingInlineCategory(false)}
                            className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                          >
                            Volver
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option: Remember Definition Later */}
                  <div className="p-2.5 bg-black/25 rounded-lg border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-xs font-semibold text-amber-200 block">
                          Recordar definición más tarde
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Se guardará en la categoría <strong>"Pendientes"</strong> para definirla después.
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="rememberLaterCheckbox"
                      checked={rememberLater}
                      onChange={(e) => {
                        setRememberLater(e.target.checked);
                        if (e.target.checked) {
                          setNewCategory('Pendientes');
                        }
                      }}
                      className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {!rememberLater && (
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        Significado o Definición (Opcional)
                      </label>
                      <textarea
                        value={newDefinition}
                        onChange={(e) => setNewDefinition(e.target.value)}
                        placeholder="Escribe la explicación clara sobre este término..."
                        rows={2}
                        className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1 border-t border-[#0f3847]">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-lg shadow-sm"
                    >
                      {rememberLater ? 'Guardar como Pendiente' : 'Guardar en Diccionario'}
                    </button>
                  </div>
                </form>
              )}

              {/* Status Indicator of Current Sorting Mode */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  Modo de orden:{' '}
                  <strong className="text-teal-300">
                    {dictSortMode === 'categories-az'
                      ? 'Por categorías / listas (A - Z)'
                      : dictSortMode === 'alphabetical'
                      ? 'Alfabético general (A - Z)'
                      : 'Por fecha de agregación'}
                  </strong>
                </span>
                <span className="font-mono">{searchFilteredDictionary.length} términos</span>
              </div>

              {/* No items fallback */}
              {searchFilteredDictionary.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#062029] rounded-xl border border-[#0f3847] space-y-2">
                  <Sparkles className="w-8 h-8 text-sky-400/50 mx-auto" />
                  <p className="font-medium text-slate-300">
                    {searchQuery
                      ? `No hay términos que coincidan con "${searchQuery}".`
                      : 'El diccionario está vacío.'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Añade palabras con el botón "+ Nuevo Término" o seleccionando texto mientras lees.
                  </p>
                </div>
              ) : dictSortMode === 'categories-az' ? (
                /* MODE 1 (DEFAULT): LIST ORDERED BY CATEGORIES (A-Z) WITH COLLAPSIBLE ACCORDIONS */
                <div className="space-y-3">
                  {allKnownCategories.map((catName) => {
                    // Filter terms for this category
                    const categoryItems = searchFilteredDictionary
                      .filter((d) => {
                        if (catName === 'Pendientes') {
                          return d.isPending || d.category === 'Pendientes';
                        }
                        if (catName === 'Diccionario General') {
                          return d.category === 'Diccionario General' || (!d.category && !d.isPending);
                        }
                        return d.category === catName && !d.isPending;
                      })
                      .sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }));

                    // If searching and this category has no items, skip it
                    if (searchQuery && categoryItems.length === 0) {
                      return null;
                    }

                    const isCollapsed = collapsedCategories[catName] === true;
                    const isPendingCat = catName === 'Pendientes';

                    return (
                      <div
                        key={catName}
                        className="bg-[#062029] rounded-xl border border-[#0f3847] overflow-hidden shadow-xs"
                      >
                        {/* Collapsible Category Header */}
                        <div
                          onClick={() => toggleCategoryCollapse(catName)}
                          className="px-3.5 py-2.5 bg-[#072a37] hover:bg-[#0a3545] cursor-pointer flex items-center justify-between transition-colors select-none"
                        >
                          <div className="flex items-center gap-2">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-teal-400" />
                            )}
                            <span
                              className={`font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 ${
                                isPendingCat ? 'text-amber-300' : 'text-teal-200'
                              }`}
                            >
                              {isPendingCat && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                              <span>{catName}</span>
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                                isPendingCat
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-white/10 text-slate-300'
                              }`}
                            >
                              {categoryItems.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Allow deleting custom category */}
                            {catName !== 'Diccionario General' && catName !== 'Pendientes' && (
                              <button
                                type="button"
                                onClick={() => setDictCategoryToDelete(catName)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition-colors"
                                title={`Eliminar categoría "${catName}"`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Category Items List (Sorted A-Z) */}
                        {!isCollapsed && (
                          <div>
                            {categoryItems.length === 0 ? (
                              <div className="p-4 text-center text-[11px] text-slate-500 italic">
                                Sin términos en esta categoría.
                              </div>
                            ) : (
                              <div>
                                {categoryItems.map((item) => renderDictionaryItemCard(item, false))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : dictSortMode === 'alphabetical' ? (
                /* MODE 2: FLAT ALPHABETICAL LIST (A-Z) WITH CATEGORY BADGE ON EACH TERM */
                <div className="divide-y divide-[#0f3847] bg-[#062029] rounded-xl border border-[#0f3847] overflow-hidden">
                  {[...searchFilteredDictionary]
                    .sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }))
                    .map((item) => renderDictionaryItemCard(item, true))}
                </div>
              ) : (
                /* MODE 3: ORDERED BY DATE ADDED (NEWEST FIRST) WITH CATEGORY BADGE ON EACH TERM */
                <div className="divide-y divide-[#0f3847] bg-[#062029] rounded-xl border border-[#0f3847] overflow-hidden">
                  {[...searchFilteredDictionary]
                    .sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))
                    .map((item) => renderDictionaryItemCard(item, true))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CITAS */}
          {activeTab === 'quotes' && (
            <div className="space-y-3">
              {filteredQuotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#062029] rounded-xl border border-[#0f3847]">
                  No se encontraron citas con los filtros y orden seleccionados.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        colorStyles[quote.color] || colorStyles.yellow
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px] text-slate-300">
                        <span className="font-semibold truncate">
                          {quote.bookTitle} · Pág {quote.page}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] opacity-75 font-mono">{quote.createdAt}</span>
                          <button
                            onClick={() => {
                              const found = books.find((b) => b.id === quote.bookId);
                              if (found) {
                                onReadBook(found);
                                onClose();
                              }
                            }}
                            className="text-teal-300 hover:underline flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Ir al libro</span>
                          </button>
                          <button
                            onClick={() => onDeleteAnnotation(quote.bookId, quote.id)}
                            className="hover:text-rose-400 p-0.5"
                            title="Eliminar cita"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="font-serif italic text-white/95 leading-relaxed text-sm">
                        "{quote.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTAS Y MARCADORES */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#062029] rounded-xl border border-[#0f3847]">
                  No se encontraron notas ni marcadores guardados con los filtros seleccionados.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        colorStyles[note.color] || colorStyles.emerald
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px] text-slate-300">
                        <span className="font-semibold truncate">
                          {note.bookTitle} · Pág {note.page}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] opacity-75 font-mono">{note.createdAt}</span>
                          <button
                            onClick={() => onDeleteAnnotation(note.bookId, note.id)}
                            className="hover:text-rose-400 p-0.5"
                            title="Eliminar nota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-white font-medium">{note.text}</p>
                      {note.note && (
                        <div className="p-2.5 bg-black/30 rounded-lg text-slate-200 border border-white/5">
                          <strong className="text-teal-300 text-[11px] block mb-0.5">Nota:</strong>
                          <span>{note.note}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dictionary Category Deletion Confirmation Modal */}
      {dictCategoryToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#082a36] text-slate-100 rounded-2xl border border-rose-500/40 p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">¿Eliminar categoría del diccionario?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Realmente deseas eliminar la categoría{' '}
              <span className="font-bold text-white">"{dictCategoryToDelete}"</span>? Los términos no
              se perderán: se moverán automáticamente a{' '}
              <span className="text-teal-300 font-semibold">"Diccionario General"</span>.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#0f3847]">
              <button
                type="button"
                onClick={() => setDictCategoryToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDictCategory(dictCategoryToDelete);
                  setDictCategoryToDelete(null);
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
