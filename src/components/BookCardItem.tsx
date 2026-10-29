import { Star, CheckCheck, Library, MoreVertical, BookOpen } from 'lucide-react';
import { Book } from '../types/book';
import { AppThemeConfig } from '../types/theme';

interface BookCardItemProps {
  book: Book;
  onSelect: (book: Book) => void;
  onRead: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
  onToggleCompleted: (bookId: string) => void;
  onOpenShelfSelector: (book: Book) => void;
  onOpenActions: (book: Book, e: React.MouseEvent) => void;
  themeConfig?: AppThemeConfig;
}

export function BookCardItem({
  book,
  onSelect,
  onRead,
  onToggleFavorite,
  onToggleCompleted,
  onOpenShelfSelector,
  onOpenActions,
  themeConfig,
}: BookCardItemProps) {
  const progressPercent = Math.round((book.currentPage / book.totalPages) * 100);

  const cardBg = themeConfig?.bgCard || '#082a36';
  const borderColor = themeConfig?.border || '#0f3847';
  const textTitle = themeConfig?.textPrimary || '#f8fafc';
  const textMuted = themeConfig?.textSecondary || '#94a3b8';
  const accentColor = themeConfig?.accent || '#2dd4bf';

  return (
    <div
      className="w-full border-b p-3.5 transition-colors"
      style={{
        backgroundColor: cardBg,
        borderColor: borderColor,
      }}
    >
      <div className="flex gap-3.5">
        {/* Book Cover (Clicking opens details!) */}
        <button
          onClick={() => onSelect(book)}
          className="relative shrink-0 w-24 h-34 rounded shadow-md overflow-hidden bg-slate-800 border border-slate-700/60 focus:outline-none focus:ring-2 active:scale-[0.98] transition-transform text-left group"
          title={`Ver detalles de ${book.title}`}
        >
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-gradient-to-br', 'from-teal-900', 'to-slate-900', 'flex', 'items-center', 'justify-center', 'p-2', 'text-center');
                const span = document.createElement('span');
                span.className = 'text-[11px] font-semibold text-teal-200 line-clamp-3';
                span.innerText = book.title;
                parent.appendChild(span);
              }
            }}
          />
          {/* Format badge tag */}
          <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-[9px] font-bold text-teal-300 px-1 rounded">
            {book.format}
          </div>
        </button>

        {/* Right Info Section */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <button
              onClick={() => onSelect(book)}
              className="text-left w-full group focus:outline-none"
            >
              <h2
                className="text-sm font-semibold line-clamp-2 leading-snug transition-colors group-hover:underline"
                style={{ color: textTitle }}
              >
                {book.title}
              </h2>
            </button>
            <div
              className="text-xs mt-0.5 flex items-center gap-1.5"
              style={{ color: textMuted }}
            >
              <span>{book.format}, {book.fileSize}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{book.author}</span>
            </div>
          </div>

          {/* Reading Progress Line & Dots */}
          <div className="my-2.5">
            <div className="relative w-full flex items-center">
              <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
              {/* Discrete chapter markers as in screenshot */}
              <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
              </div>
            </div>
            <div
              className="flex justify-between items-center text-[11px] mt-1 font-mono tabular-nums"
              style={{ color: textMuted }}
            >
              <span>Pág {book.currentPage} de {book.totalPages} ({progressPercent}%)</span>
              <span>{book.lastReadDate}</span>
            </div>
          </div>

          {/* Action icon buttons row as in the screenshot */}
          <div className="flex items-center justify-between opacity-80 pt-0.5">
            <button
              onClick={() => onToggleFavorite(book.id)}
              className={`p-1.5 rounded-lg active:scale-95 transition-transform ${
                book.isFavorite ? 'text-amber-400 opacity-100' : 'hover:opacity-100'
              }`}
              title={book.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
              aria-label="Favorito"
            >
              <Star className={`w-4 h-4 ${book.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>


            <button
              onClick={() => onToggleCompleted(book.id)}
              className={`p-1.5 rounded-lg active:scale-95 transition-transform ${
                book.isCompleted ? 'text-emerald-400 opacity-100' : 'hover:opacity-100'
              }`}
              title={book.isCompleted ? 'Libro terminado' : 'Marcar como leído'}
              aria-label="Marcar como terminado"
            >
              <CheckCheck className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenShelfSelector(book)}
              className="p-1.5 rounded-lg hover:opacity-100 active:scale-95 transition-transform"
              title="Organizar en estanterías"
              aria-label="Estanterías"
            >
              <Library className="w-4 h-4" />
            </button>

            <button
              onClick={() => onRead(book)}
              className="px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 active:scale-95 transition-all shadow-xs"
              style={{
                backgroundColor: themeConfig ? `${themeConfig.accent}20` : '#0d3b4b',
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
              title="Continuar lectura"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Leer</span>
            </button>

            <button
              onClick={(e) => onOpenActions(book, e)}
              className="p-1.5 rounded-lg hover:opacity-100 active:scale-95 transition-transform"
              title="Más opciones"
              aria-label="Más opciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
