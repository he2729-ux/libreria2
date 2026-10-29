import { useState } from 'react';
import { X, BookOpen, Volume2, Star, CheckCheck, Calendar, HardDrive, FileText, Bookmark, Share2, Tag, Edit3, Trash2, Sparkles, Plus, AlertTriangle } from 'lucide-react';
import { Book, ShelfCategory } from '../types/book';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onRead: (book: Book) => void;
  onListenTTS: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
  onToggleCompleted: (bookId: string) => void;
  onUpdateProgress: (bookId: string, page: number) => void;
  onChangeShelf: (bookId: string, newShelf: ShelfCategory) => void;
  onDeleteBook: (bookId: string) => void;
  onAddAnnotation: (bookId: string, text: string, type: 'quote' | 'note', color: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber') => void;
  onAskAI?: (book: Book) => void;
  categories: string[];
  onUpdateCategory: (bookId: string, category: string) => void;
  onCreateCategory: (catName: string) => void;
}

export function BookDetailModal({
  book,
  onClose,
  onRead,
  onListenTTS,
  onToggleFavorite,
  onToggleCompleted,
  onUpdateProgress,
  onChangeShelf,
  onDeleteBook,
  onAddAnnotation,
  onAskAI,
  categories,
  onUpdateCategory,
  onCreateCategory,
}: BookDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'chapters' | 'notes'>('info');
  const [sliderPage, setSliderPage] = useState(book.currentPage);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<'quote' | 'note'>('quote');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'emerald' | 'blue' | 'rose' | 'amber'>('yellow');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showDeleteBookConfirm, setShowDeleteBookConfirm] = useState(false);

  const progressPercent = Math.round((book.currentPage / book.totalPages) * 100);

  const shelfNames: Record<'reading' | 'to-read' | 'completed' | 'favorites', string> = {
    reading: 'Leyendo ahora',
    'to-read': 'Por Leer',
    completed: 'Terminados',
    favorites: 'Favoritos',
  };

  const colorClasses = {
    yellow: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    emerald: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    blue: 'bg-sky-400/20 text-sky-300 border-sky-400/40',
    rose: 'bg-rose-400/20 text-rose-300 border-rose-400/40',
    amber: 'bg-orange-400/20 text-orange-300 border-orange-400/40',
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddAnnotation(book.id, newNoteText.trim(), newNoteType, newNoteColor);
    setNewNoteText('');
    setShowAddNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#082a36] text-slate-100 sm:rounded-2xl border border-[#0f3847] flex flex-col overflow-hidden shadow-2xl">
        {/* Header with Title and Close Button */}
        <div className="h-14 px-4 border-b border-[#0f3847] flex items-center justify-between shrink-0 bg-[#062029]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
              Características del Libro
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(book.id)}
              className={`p-2 rounded-lg hover:bg-white/10 ${
                book.isFavorite ? 'text-amber-400' : 'text-slate-400'
              }`}
              title="Favorito"
            >
              <Star className={`w-5 h-5 ${book.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Cerrar detalles"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Top Hero Section: Cover + Core Metadata */}
          <div className="flex gap-4">
            <div className="w-28 sm:w-32 aspect-[3/4.2] shrink-0 rounded-md shadow-xl overflow-hidden bg-slate-900 border border-slate-700/80 relative">
              <img
                src={book.coverUrl}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 bg-black/80 text-[10px] font-bold text-teal-300 px-1.5 py-0.5 rounded">
                {book.format}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-tight">
                  {book.title}
                </h1>
                <p className="text-xs sm:text-sm text-teal-300 font-medium mt-1">
                  {book.author}
                </p>

                {/* Unboxed Metadata with Bullet Separators */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-2 font-sans">
                  <span>{book.format}</span>
                  <span aria-hidden="true">·</span>
                  <span>{book.fileSize}</span>
                  <span aria-hidden="true">·</span>
                  <span>{book.totalPages} páginas</span>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase">{book.language}</span>
                </div>
              </div>

              {/* Categoría row (As requested: shows SIN CATEGORÍA and + button if unassigned) */}
              <div className="mt-2.5 p-2 bg-[#062029] rounded-xl border border-[#0f3847] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] text-slate-400 font-semibold shrink-0">Categoría:</span>
                  {book.category && book.category.trim() !== '' ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1 truncate">
                      <Tag className="w-3 h-3 shrink-0" />
                      <span className="truncate">{book.category}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider shrink-0">
                      SIN CATEGORÍA
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCategorySelector((p) => !p)}
                  className="px-2 py-1 bg-[#0d3b4b] hover:bg-[#134c60] text-teal-300 rounded-lg border border-[#174d61] flex items-center gap-1 text-[11px] font-bold transition-transform active:scale-95 shrink-0 ml-1.5"
                  title="Asignar o Crear Categoría"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{book.category ? 'Cambiar' : '+ Asignar'}</span>
                </button>
              </div>

              {/* Category Selector Popover */}
              {showCategorySelector && (
                <div className="mt-2 p-3 bg-[#061e27] border border-teal-500/40 rounded-xl space-y-2.5 text-xs animate-in fade-in">
                  <div className="flex justify-between items-center pb-1 border-b border-[#0f3847]">
                    <span className="font-bold text-white text-[11px]">Seleccionar o Crear Categoría</span>
                    <button
                      type="button"
                      onClick={() => setShowCategorySelector(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Existing categories chips */}
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          onUpdateCategory(book.id, cat);
                          setShowCategorySelector(false);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${
                          book.category === cat
                            ? 'bg-teal-500 text-slate-950 font-bold'
                            : 'bg-[#0d3b4b] text-slate-200 hover:bg-[#124b5e] border border-[#174d61]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    {book.category && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCategory(book.id, '');
                          setShowCategorySelector(false);
                        }}
                        className="px-2 py-1 rounded-lg text-[11px] bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50"
                      >
                        Dejar Sin Categoría
                      </button>
                    )}
                  </div>

                  {/* Create New Category Form */}
                  <div className="pt-1.5 border-t border-[#0f3847] flex gap-1.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nueva categoría..."
                      className="flex-1 bg-[#0d3b4b] border border-[#174d61] rounded-lg px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCategoryName.trim()) return;
                        const name = newCategoryName.trim();
                        onCreateCategory(name);
                        onUpdateCategory(book.id, name);
                        setNewCategoryName('');
                        setShowCategorySelector(false);
                      }}
                      className="px-2.5 py-1 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs shrink-0"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              )}

              {/* Shelf Selector Dropdown */}
              <div className="mt-2.5">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Estantería asignada:
                </label>
                <select
                  value={book.shelf}
                  onChange={(e) => onChangeShelf(book.id, e.target.value as ShelfCategory)}
                  className="w-full bg-[#0d3b4b] border border-[#174d61] text-xs text-teal-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400"
                >
                  {Object.entries(shelfNames).map(([key, label]) => (
                    <option key={key} value={key} className="bg-[#082a36] text-white">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons (Thumb Reach Zone) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => onRead(book)}
              className="h-12 w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-transform"
            >
              <BookOpen className="w-4 h-4" />
              <span>LEER (PÁG. {book.currentPage})</span>
            </button>

            <button
              onClick={() => onListenTTS(book)}
              className="h-12 w-full bg-[#114354] hover:bg-[#165368] text-teal-200 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-teal-500/30 active:scale-[0.98] transition-transform"
            >
              <Volume2 className="w-4 h-4 text-teal-300" />
              <span>AUDIO TTS</span>
            </button>

            {onAskAI && (
              <button
                onClick={() => onAskAI(book)}
                className="h-12 w-full bg-gradient-to-r from-teal-500/20 to-sky-500/20 hover:from-teal-500/30 hover:to-sky-500/30 text-teal-200 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-teal-400/50 active:scale-[0.98] transition-transform shadow-md"
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>CONSULTAR IA</span>
              </button>
            )}
          </div>

          {/* Reading Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847]">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Bookmark className="w-3.5 h-3.5 text-teal-400" />
                <span>Progreso</span>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {progressPercent}%
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {book.currentPage} de {book.totalPages} págs
              </div>
            </div>

            <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847]">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Agregado</span>
              </div>
              <div className="text-sm font-semibold text-white mt-1 truncate">
                {book.addedDate}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {book.lastReadDate}
              </div>
            </div>

            <div className="bg-[#062029] p-3 rounded-xl border border-[#0f3847]">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>Archivo</span>
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {book.format} · {book.fileSize}
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCheck className="w-3 h-3" />
                <span>Verificado</span>
              </div>
            </div>
          </div>

          {/* Interactive Progress Slider */}
          <div className="bg-[#062029] p-4 rounded-xl border border-[#0f3847] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Ajustar progreso de lectura manual</span>
              <span className="font-mono text-teal-300 font-bold">
                Pág {sliderPage} / {book.totalPages} ({Math.round((sliderPage / book.totalPages) * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={book.totalPages}
              value={sliderPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSliderPage(val);
                onUpdateProgress(book.id, val);
              }}
              className="w-full accent-teal-400 h-2 bg-[#0d3b4b] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between items-center pt-1 text-xs">
              <button
                onClick={() => {
                  setSliderPage(1);
                  onUpdateProgress(book.id, 1);
                }}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Reiniciar al inicio
              </button>
              <button
                onClick={() => onToggleCompleted(book.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  book.isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-slate-700'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{book.isCompleted ? 'Marcado como Terminado' : 'Marcar como Terminado'}</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-[#0f3847] text-xs font-medium">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-3 border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-teal-400 text-teal-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sinopsis y Detalles
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-2 px-3 border-b-2 transition-colors ${
                activeTab === 'chapters'
                  ? 'border-teal-400 text-teal-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Índice ({book.chapters.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-2 px-3 border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-teal-400 text-teal-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Citas y Notas ({book.annotations.length})
            </button>
          </div>

          {/* Tab 1: Synopsis & Metadata */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Sinopsis del Documento
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#062029] p-3.5 rounded-xl border border-[#0f3847]">
                  {book.synopsis}
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Ficha Técnica Completa
                </h3>
                <div className="bg-[#062029] rounded-xl border border-[#0f3847] divide-y divide-[#0f3847] text-xs">
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-400">Título Completo</span>
                    <span className="text-white font-medium text-right max-w-[65%]">{book.title}</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-400">Autor / Creador</span>
                    <span className="text-white font-medium">{book.author}</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-400">Formato Soportado</span>
                    <span className="text-teal-300 font-bold">{book.format} (Compatible con lector avanzado)</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-400">Tamaño en Almacenamiento</span>
                    <span className="text-white font-mono">{book.fileSize}</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-400">Fecha de Incorporación</span>
                    <span className="text-white">{book.addedDate}</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Delete / Remove */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteBookConfirm(true)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar libro de la biblioteca</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Chapters / Table of Contents */}
          {activeTab === 'chapters' && (
            <div className="space-y-2">
              {book.chapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => {
                    onUpdateProgress(book.id, ch.page);
                    onRead(book);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#062029] hover:bg-[#0d3b4b] border border-[#0f3847] cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="text-slate-200 font-medium">{ch.title}</span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0">Pág {ch.page}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Quotes & Annotations */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {book.annotations.length} notas y citas guardadas
                </span>
                <button
                  onClick={() => setShowAddNote((prev) => !prev)}
                  className="px-2.5 py-1 text-xs font-semibold bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 rounded-lg border border-teal-500/40"
                >
                  {showAddNote ? 'Cancelar' : '+ Agregar Anotación'}
                </button>
              </div>

              {showAddNote && (
                <form onSubmit={handleAddNoteSubmit} className="bg-[#062029] p-3.5 rounded-xl border border-teal-500/40 space-y-3 text-xs">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewNoteType('quote')}
                      className={`px-2.5 py-1 rounded-md ${newNoteType === 'quote' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-white/10 text-slate-300'}`}
                    >
                      Cita textual
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNoteType('note')}
                      className={`px-2.5 py-1 rounded-md ${newNoteType === 'note' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-white/10 text-slate-300'}`}
                    >
                      Nota personal
                    </button>
                  </div>

                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Escribe la cita o nota del libro..."
                    rows={3}
                    className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    required
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 mr-1">Color:</span>
                      {(['yellow', 'emerald', 'blue', 'rose', 'amber'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewNoteColor(c)}
                          className={`w-5 h-5 rounded-full border-2 transition-transform ${
                            c === 'yellow' ? 'bg-amber-400' :
                            c === 'emerald' ? 'bg-emerald-400' :
                            c === 'blue' ? 'bg-sky-400' :
                            c === 'rose' ? 'bg-rose-400' : 'bg-orange-400'
                          } ${newNoteColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold rounded-lg shadow-sm"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}

              {book.annotations.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-[#062029] rounded-xl border border-[#0f3847]">
                  No has agregado citas ni notas en este libro todavía. Resalta texto durante la lectura para guardarlas.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {book.annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${colorClasses[ann.color] || colorClasses.yellow}`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono opacity-80">
                        <span className="uppercase font-semibold">{ann.type === 'quote' ? 'Cita' : 'Nota'} · Pág {ann.page}</span>
                        <span>{ann.createdAt}</span>
                      </div>
                      <p className="font-serif italic text-white/95 leading-relaxed">
                        "{ann.text}"
                      </p>
                      {ann.note && (
                        <div className="text-[11px] pt-1 text-slate-200 border-t border-white/10 font-sans">
                          <strong>Comentario:</strong> {ann.note}
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

      {/* Delete Book Confirmation Modal */}
      {showDeleteBookConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#082a36] text-slate-100 rounded-2xl border border-rose-500/40 p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">¿Eliminar libro?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Realmente deseas eliminar <span className="font-bold text-white">"{book.title}"</span> de tu biblioteca? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#0f3847]">
              <button
                type="button"
                onClick={() => setShowDeleteBookConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBook(book.id);
                  setShowDeleteBookConfirm(false);
                  onClose();
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
