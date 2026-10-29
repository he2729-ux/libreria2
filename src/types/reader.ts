export type ReadingTheme =
  | 'day'
  | 'day-soft'
  | 'sepia'
  | 'eye-care'
  | 'parchment'
  | 'twilight'
  | 'night'
  | 'night-oled'
  | 'night-navy'
  | 'custom';

export type ViewMode = 'shelf' | 'cards' | 'grid' | 'compact';
export type PageLayout = 'single' | 'two-page';
export type ReadingDirection = 'ltr' | 'rtl'; // rtl for manga
export type TouchZoneConfig = 'left-right' | 'edges-center' | 'vertical-scroll';
export type PageTurnMode = 'tap-edges' | 'swipe-finger' | 'both';

export interface ReaderSettings {
  theme: ReadingTheme;
  customBgColor?: string;
  customTextColor?: string;
  fontFamily: 'Literata' | 'Plus Jakarta Sans' | 'System Sans' | 'JetBrains Mono';
  fontSize: number; // in px, e.g. 18
  lineHeight: number; // e.g. 1.7
  paragraphIndent: boolean;
  paragraphSpacing: number; // e.g. 12
  pageLayout: PageLayout;
  readingDirection: ReadingDirection;
  touchZones: TouchZoneConfig;
  invertImagesInNight: boolean;
  zoomLevel: number; // 0.7 to 2.5
  zoomLock: boolean; // lock lateral scrolling when zoomed
  brightness: number; // 50 to 100%
  fullscreen: boolean;
  immersiveMode: boolean; // hide all toolbars and distraction-free
  fitToPhone: boolean; // Si la hoja se ajusta al teléfono o permite tamaño de texto personalizado
  pageTurnMode: PageTurnMode; // Tocar borde del teléfono, desplazamiento con el dedo (swipe) o ambos
  pageTurnAnimation: boolean; // Animación visible al pasar de página
}

export interface TTSSettings {
  rate: number; // 0.1 to 4.0
  pitch: number; // 0.5 to 1.5
  voiceUri: string;
  favoriteVoices: string[];
  skipHeadersFooters: boolean;
  readFootnotes: boolean;
  activeLanguage: string;
}
