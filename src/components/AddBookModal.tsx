import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Book, BookFormat, ShelfCategory } from '../types/book';

interface AddBookModalProps {
  onClose: () => void;
  onAddBook: (newBook: Book) => void;
}

export function AddBookModal({ onClose, onAddBook }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [format, setFormat] = useState<BookFormat>('MD');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [totalPages, setTotalPages] = useState(120);
  const [shelf, setShelf] = useState<ShelfCategory>('to-read');
  const [synopsis, setSynopsis] = useState('');
  const [isKidsSafe, setIsKidsSafe] = useState(false);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Auto fill title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(cleanName);

    // Calculate file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MB`);

    // Detect format
    const ext = file.name.split('.').pop()?.toUpperCase() || 'MD';
    if (['PDF', 'EPUB', 'MD', 'CBR', 'CBZ', 'AZW3', 'FB3', 'DJVU'].includes(ext)) {
      setFormat(ext as BookFormat);
    } else {
      setFormat('MD');
    }

    // Read content if text / markdown
    if (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
        // Estimate pages based on word count (~300 words per page)
        const words = text.split(/\s+/).length;
        setTotalPages(Math.max(1, Math.round(words / 300)));
      };
      reader.readAsText(file);
    } else {
      // For binary files (PDF/EPUB/CBR), generate placeholder chapter structure
      setContent(`# ${cleanName}\n\nEste documento en formato ${ext} ha sido importado exitosamente a tu estantería.\n\n### Capítulo 1: Introducción y lectura\n\nEl motor de renderizado de Libris ha indexado el contenido.`);
      setTotalPages(85);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || 'Autor Desconocido',
      coverUrl: '/src/assets/images/book_cover_satoshi_1793155016013.jpg', // fallback default cover
      format,
      fileSize,
      totalPages: Number(totalPages) || 100,
      currentPage: 1,
      readTimeMinutes: 0,
      addedDate: new Date().toLocaleDateString('es-ES'),
      lastReadDate: 'Sin iniciar',
      isFavorite: false,
      isCompleted: false,
      rating: 5,
      shelf,
      synopsis: synopsis.trim() || 'Documento agregado recientemente a la biblioteca.',
      isKidsSafe,
      language: 'es',
      chapters: [
        { id: 'ch-1', title: 'Capítulo 1: Inicio', page: 1, level: 1 },
        { id: 'ch-2', title: 'Capítulo 2: Desarrollo', page: Math.round(totalPages / 2), level: 1 },
      ],
      content: [
        content || `# ${title}\n\nDocumento listo para lectura en la aplicación.`
      ],
      annotations: [],
    };

    onAddBook(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[#082a36] text-slate-100 rounded-2xl border border-[#0f3847] p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-[#0f3847]">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">
              Añadir Documento a la Estantería
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Drag and Drop Zone */}
        <div className="my-4">
          <label className="border-2 border-dashed border-[#174d61] hover:border-teal-400/70 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#062029]">
            <Upload className="w-8 h-8 text-teal-400 mb-2" />
            <span className="text-xs font-semibold text-slate-200">
              {fileName ? fileName : 'Selecciona o suelta un archivo (.md, .txt, .pdf, .cbr, .epub)'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Soporte para Markdown, PDF, EPUB, CBR, CBZ, AZW3 y FB3
            </span>
            <input
              type="file"
              accept=".md,.txt,.pdf,.epub,.cbr,.cbz,.azw3,.fb3"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Título del Libro *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Criptografía y Redes Descentralizadas"
              className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Autor</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nombre del autor"
                className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2.5 text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BookFormat)}
                className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2.5 text-white focus:outline-none"
              >
                <option value="PDF">PDF</option>
                <option value="EPUB">EPUB</option>
                <option value="MD">Markdown (.md)</option>
                <option value="CBR">CBR (Cómic)</option>
                <option value="CBZ">CBZ (Cómic)</option>
                <option value="AZW3">AZW3</option>
                <option value="FB3">FB3</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Páginas Estimadas</label>
              <input
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                min="1"
                className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Estantería Destino</label>
              <select
                value={shelf}
                onChange={(e) => setShelf(e.target.value as ShelfCategory)}
                className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2.5 text-white focus:outline-none"
              >
                <option value="reading">Leyendo ahora</option>
                <option value="to-read">Por Leer</option>
                <option value="completed">Terminados</option>
                <option value="favorites">Favoritos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Sinopsis / Descripción</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Breve resumen del libro..."
              rows={2}
              className="w-full bg-[#0d3b4b] border border-[#174d61] rounded-lg p-2 text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#0f3847]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Guardar en Estantería
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
