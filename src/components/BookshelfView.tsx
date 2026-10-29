import { Book } from '../types/book';
import { ShelfWoodConfig } from '../types/theme';
import { BookOpen, Star, CheckCheck } from 'lucide-react';

interface BookshelfViewProps {
  books: Book[];
  onSelect: (book: Book) => void;
  onRead: (book: Book) => void;
  shelfWood: ShelfWoodConfig;
  customShelfColor?: string;
}

export function BookshelfView({ books, onSelect, onRead, shelfWood, customShelfColor }: BookshelfViewProps) {
  // Chunk books into shelves of 3 books per shelf
  const shelfRows: Book[][] = [];
  const chunkSize = 3;
  for (let i = 0; i < books.length; i += chunkSize) {
    shelfRows.push(books.slice(i, i + chunkSize));
  }

  if (books.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm">No se encontraron libros en esta estantería.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-3 py-4 space-y-8 select-none">
      {shelfRows.map((row, rowIndex) => (
        <div key={`shelf-${rowIndex}`} className="relative">
          {/* Books standing on the shelf */}
          <div className="grid grid-cols-3 gap-3 px-2 pb-2 items-end">
            {row.map((book) => {
              const progress = Math.round((book.currentPage / book.totalPages) * 100);
              return (
                <div key={book.id} className="group relative flex flex-col items-center">
                  {/* Book 3D card */}
                  <div
                    onClick={() => onSelect(book)}
                    className="cursor-pointer relative w-full aspect-[3/4.2] rounded-r-md rounded-l-xs shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden bg-slate-900 border-r border-t border-b border-white/10"
                    style={{
                      boxShadow: '4px 6px 14px rgba(0, 0, 0, 0.5), inset 2px 0 4px rgba(255,255,255,0.1)'
                    }}
                  >
                    {/* Book spine simulation on the left */}
                    <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />

                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.classList.add('bg-gradient-to-br', 'from-teal-950', 'to-slate-900', 'flex', 'items-center', 'justify-center', 'p-2', 'text-center');
                          const span = document.createElement('span');
                          span.className = 'text-[10px] font-bold text-teal-200 line-clamp-3';
                          span.innerText = book.title;
                          parent.appendChild(span);
                        }
                      }}
                    />

                    {/* Progress pill overlay at bottom of book */}
                    <div className="absolute bottom-1.5 inset-x-1.5 bg-black/80 backdrop-blur-xs rounded px-1.5 py-0.5 flex items-center justify-between text-[9px] font-mono tabular-nums text-slate-200 z-10">
                      <span className="text-teal-300 font-semibold">{progress}%</span>
                      <span>{book.format}</span>
                    </div>

                    {book.isFavorite && (
                      <div className="absolute top-1 right-1 z-10 p-0.5 rounded-full bg-black/60 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                      </div>
                    )}

                    {book.isCompleted && (
                      <div className="absolute top-1 left-3.5 z-10 p-0.5 rounded-full bg-emerald-950/80 text-emerald-400">
                        <CheckCheck className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Book title and quick actions underneath */}
                  <div className="w-full mt-2 text-center">
                    <p
                      onClick={() => onSelect(book)}
                      className="text-xs font-medium text-slate-200 line-clamp-1 hover:text-teal-300 cursor-pointer"
                      title={book.title}
                    >
                      {book.title}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRead(book);
                      }}
                      className="mt-1 text-[11px] text-teal-400 hover:text-teal-200 font-medium inline-flex items-center gap-1 active:scale-95"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Leer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customizable Realistic Shelf Surface */}
          <div className="w-full relative">
            {/* Top shelf edge highlight */}
            <div
              className={`h-1.5 w-full rounded-t-xs ${shelfWood.id !== 'custom' ? shelfWood.topEdge : ''}`}
              style={{
                backgroundColor: shelfWood.id === 'custom' && customShelfColor ? `${customShelfColor}dd` : undefined,
                borderTop: shelfWood.id === 'custom' ? '1px solid rgba(255,255,255,0.2)' : undefined,
              }}
            />
            {/* Front shelf face */}
            <div
              className={`h-4 w-full ${shelfWood.id !== 'custom' ? shelfWood.faceGradient : ''} flex items-center justify-between px-3 relative overflow-hidden`}
              style={{
                backgroundColor: shelfWood.id === 'custom' && customShelfColor ? customShelfColor : undefined,
                boxShadow: shelfWood.shadow || '0 8px 18px rgba(0,0,0,0.6)',
              }}
            >
              {/* Subtle fine wood grain overlay */}
              <div className="w-full h-full opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
            {/* Deep shelf bottom shadow */}
            <div className="h-3.5 w-full bg-gradient-to-b from-black/65 to-transparent" />
          </div>
        </div>
      ))}
    </div>
  );
}
