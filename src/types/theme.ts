export type AppThemeId =
  | 'petrol'
  | 'oled'
  | 'twilight'
  | 'sapphire'
  | 'emerald'
  | 'amethyst'
  | 'paper'
  | 'custom';

export type ShelfWoodId =
  | 'oak'
  | 'mahogany'
  | 'walnut'
  | 'white-marble'
  | 'industrial'
  | 'charred'
  | 'cherry'
  | 'custom';

export interface CustomThemeColors {
  bgCanvas: string;
  bgCard: string;
  headerBg: string;
  accent: string;
  textPrimary: string;
  shelfColor: string;
}

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  description: string;
  bgCanvas: string;
  bgSurface: string;
  bgCard: string;
  bgCardHover: string;
  border: string;
  headerBg: string;
  accent: string;
  accentBg: string;
  accentText: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}

export interface ShelfWoodConfig {
  id: ShelfWoodId;
  name: string;
  description: string;
  topEdge: string;
  faceGradient: string;
  shadow: string;
  accentDot: string;
}

export const APP_THEMES: Record<AppThemeId, AppThemeConfig> = {
  petrol: {
    id: 'petrol',
    name: 'Azul Petróleo Clásico',
    description: 'Tono original oscuro azulado con detalles en aguamarina.',
    bgCanvas: '#041a22',
    bgSurface: '#062029',
    bgCard: '#082a36',
    bgCardHover: '#0b3341',
    border: '#0f3847',
    headerBg: '#082a36',
    accent: '#2dd4bf',
    accentBg: '#14b8a6',
    accentText: '#041a22',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    isDark: true,
  },
  oled: {
    id: 'oled',
    name: 'Negro Puro OLED',
    description: 'Negro absoluto ultra contrastado para ahorrar batería en pantallas AMOLED.',
    bgCanvas: '#000000',
    bgSurface: '#080808',
    bgCard: '#111111',
    bgCardHover: '#1a1a1a',
    border: '#222222',
    headerBg: '#0e0e0e',
    accent: '#38bdf8',
    accentBg: '#0284c7',
    accentText: '#000000',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    isDark: true,
  },
  twilight: {
    id: 'twilight',
    name: 'Crepúsculo Cálido',
    description: 'Café tostado y tonalidades ámbar ideales para descansar la vista de noche.',
    bgCanvas: '#140c07',
    bgSurface: '#1c120b',
    bgCard: '#241710',
    bgCardHover: '#2d1e15',
    border: '#38251a',
    headerBg: '#21150e',
    accent: '#fbbf24',
    accentBg: '#f59e0b',
    accentText: '#140c07',
    textPrimary: '#fef3c7',
    textSecondary: '#d6c4b2',
    isDark: true,
  },
  sapphire: {
    id: 'sapphire',
    name: 'Zafiro Medianoche',
    description: 'Azul marino profundo espacial con acentos cobalto y cian.',
    bgCanvas: '#030a16',
    bgSurface: '#071326',
    bgCard: '#0d1f3b',
    bgCardHover: '#122a4f',
    border: '#183664',
    headerBg: '#0b1b36',
    accent: '#60a5fa',
    accentBg: '#3b82f6',
    accentText: '#030a16',
    textPrimary: '#f0f9ff',
    textSecondary: '#93c5fd',
    isDark: true,
  },
  emerald: {
    id: 'emerald',
    name: 'Bosque Esmeralda',
    description: 'Verde pino orgánico y sereno con toques menta.',
    bgCanvas: '#03140e',
    bgSurface: '#061e16',
    bgCard: '#0a2d21',
    bgCardHover: '#0f3c2c',
    border: '#144c38',
    headerBg: '#08261c',
    accent: '#34d399',
    accentBg: '#10b981',
    accentText: '#03140e',
    textPrimary: '#ecfdf5',
    textSecondary: '#a7f3d0',
    isDark: true,
  },
  amethyst: {
    id: 'amethyst',
    name: 'Púrpura Nórdico',
    description: 'Gris violeta elegante con acentos lilas y plateados.',
    bgCanvas: '#0e0817',
    bgSurface: '#150d24',
    bgCard: '#201435',
    bgCardHover: '#2a1a45',
    border: '#37235a',
    headerBg: '#1a102c',
    accent: '#c084fc',
    accentBg: '#a855f7',
    accentText: '#0e0817',
    textPrimary: '#faf5ff',
    textSecondary: '#d8b4fe',
    isDark: true,
  },
  paper: {
    id: 'paper',
    name: 'Blanco Papel / Día',
    description: 'Modo claro inspirado en las páginas de libros impresos.',
    bgCanvas: '#f5f4ef',
    bgSurface: '#eae7de',
    bgCard: '#ffffff',
    bgCardHover: '#faf9f5',
    border: '#dcd7ca',
    headerBg: '#ffffff',
    accent: '#0d9488',
    accentBg: '#0f766e',
    accentText: '#ffffff',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    isDark: false,
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    description: 'Colores elegidos libremente por el usuario.',
    bgCanvas: '#061720',
    bgSurface: '#0d2836',
    bgCard: '#0d2836',
    bgCardHover: '#133547',
    border: '#163b4e',
    headerBg: '#09212d',
    accent: '#2dd4bf',
    accentBg: '#2dd4bf20',
    accentText: '#2dd4bf',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    isDark: true,
  },
};

export const SHELF_WOODS: Record<ShelfWoodId, ShelfWoodConfig> = {
  oak: {
    id: 'oak',
    name: 'Roble Clásico',
    description: 'Madera natural dorada y cálida tradicional de biblioteca.',
    topEdge: 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 border-t border-amber-400/40',
    faceGradient: 'bg-gradient-to-b from-amber-800 via-[#3d2010] to-[#251206]',
    shadow: '0 8px 18px rgba(0,0,0,0.65)',
    accentDot: '#d97706',
  },
  mahogany: {
    id: 'mahogany',
    name: 'Caoba Real',
    description: 'Madera rojiza aristocrática pulida con brillo profundo.',
    topEdge: 'bg-gradient-to-b from-red-800 via-red-900 to-[#3f0d0d] border-t border-red-500/40',
    faceGradient: 'bg-gradient-to-b from-[#4a0e0e] via-[#2f0808] to-[#1a0404]',
    shadow: '0 8px 18px rgba(0,0,0,0.7)',
    accentDot: '#991b1b',
  },
  walnut: {
    id: 'walnut',
    name: 'Nogal Profundo',
    description: 'Tono chocolate oscuro sobrio de grano fino.',
    topEdge: 'bg-gradient-to-b from-[#4a3525] via-[#352518] to-[#24170e] border-t border-[#6d5138]',
    faceGradient: 'bg-gradient-to-b from-[#2b1c11] via-[#1c1109] to-[#0f0804]',
    shadow: '0 8px 18px rgba(0,0,0,0.8)',
    accentDot: '#78350f',
  },
  'white-marble': {
    id: 'white-marble',
    name: 'Mármol Blanco Minimalista',
    description: 'Estante de piedra blanca marfil contemporánea y pulcra.',
    topEdge: 'bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-t border-white',
    faceGradient: 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400',
    shadow: '0 8px 18px rgba(0,0,0,0.4)',
    accentDot: '#e2e8f0',
  },
  industrial: {
    id: 'industrial',
    name: 'Titanio / Acero Grafito',
    description: 'Metal cepillado oscuro moderno de alta resistencia.',
    topEdge: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-t border-cyan-400/30',
    faceGradient: 'bg-gradient-to-b from-slate-800 via-slate-900 to-[#0b1118]',
    shadow: '0 8px 18px rgba(0,0,0,0.75)',
    accentDot: '#38bdf8',
  },
  charred: {
    id: 'charred',
    name: 'Yakisugi (Madera Quemada)',
    description: 'Técnica tradicional japonesa de cedro carbonizado negro carbón.',
    topEdge: 'bg-gradient-to-b from-[#1f1f1f] via-[#141414] to-[#0a0a0a] border-t border-amber-500/20',
    faceGradient: 'bg-gradient-to-b from-[#141414] via-[#0d0d0d] to-[#050505]',
    shadow: '0 8px 20px rgba(0,0,0,0.9)',
    accentDot: '#262626',
  },
  cherry: {
    id: 'cherry',
    name: 'Cerezo Dorado',
    description: 'Madera clara con matices miel y reflejos cobrizos cálidos.',
    topEdge: 'bg-gradient-to-b from-orange-500 via-orange-600 to-amber-700 border-t border-orange-300/40',
    faceGradient: 'bg-gradient-to-b from-orange-700 via-[#5a270d] to-[#361605]',
    shadow: '0 8px 18px rgba(0,0,0,0.6)',
    accentDot: '#ea580c',
  },
  custom: {
    id: 'custom',
    name: 'Estante Personalizado',
    description: 'Color de estantería personalizado libremente por el usuario.',
    topEdge: 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 border-t border-amber-400/40',
    faceGradient: 'bg-gradient-to-b from-amber-800 via-[#3d2010] to-[#251206]',
    shadow: '0 8px 18px rgba(0,0,0,0.65)',
    accentDot: '#d97706',
  },
};
