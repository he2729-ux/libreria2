export type BookFormat = 'PDF' | 'EPUB' | 'MD' | 'CBR' | 'CBZ' | 'AZW3' | 'FB3' | 'DJVU';

export type ShelfCategory = 'reading' | 'to-read' | 'completed' | 'favorites' | 'finance' | 'comics';

export interface BookChapter {
  id: string;
  title: string;
  page: number;
  level: number;
}

export interface BookAnnotation {
  id: string;
  bookId: string;
  type: 'quote' | 'note' | 'bookmark';
  color: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber';
  text: string;
  note?: string;
  page: number;
  chapter?: string;
  createdAt: string;
}

export interface DictionaryItem {
  id: string;
  term: string;
  definition: string;
  category: string; // 'Diccionario General', 'Pendientes', or user-created categories
  type?: string;
  color?: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber';
  bookId?: string;
  bookTitle?: string;
  isPending?: boolean;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  format: BookFormat;
  fileSize: string;
  totalPages: number;
  currentPage: number;
  readTimeMinutes: number;
  addedDate: string;
  lastReadDate: string;
  isFavorite: boolean;
  isCompleted: boolean;
  rating: number; // 1-5
  shelf: ShelfCategory;
  category?: string;
  synopsis: string;
  isKidsSafe?: boolean;
  language: string;
  chapters: BookChapter[];
  content: string[]; // pages or sections of text/markdown
  annotations: BookAnnotation[];
}
