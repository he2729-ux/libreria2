import { Square, Circle, ChevronLeft } from 'lucide-react';

interface AndroidNavBarProps {
  onBack?: () => void;
  onHome?: () => void;
  onRecents?: () => void;
  theme?: 'dark' | 'light' | 'twilight';
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function AndroidNavBar({
  onBack,
  onHome,
  onRecents,
  theme = 'dark',
  bgColor,
  borderColor,
  textColor,
}: AndroidNavBarProps) {
  const isLight = theme === 'light';

  return (
    <div
      className={`w-full h-11 flex items-center justify-around select-none border-t transition-colors ${
        !bgColor
          ? isLight
            ? 'bg-slate-100 border-slate-200 text-slate-700'
            : 'bg-[#041a22] border-[#0a2732] text-slate-400'
          : ''
      }`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
    >
      <button
        onClick={onBack}
        title="Volver (Atrás)"
        aria-label="Volver"
        className="w-14 h-9 flex items-center justify-center rounded-lg active:bg-white/10 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        onClick={onHome}
        title="Inicio (Biblioteca)"
        aria-label="Inicio"
        className="w-14 h-9 flex items-center justify-center rounded-lg active:bg-white/10 transition-colors"
      >
        <Circle className="w-4 h-4 stroke-[2.2]" />
      </button>

      <button
        onClick={onRecents}
        title="Recientes / Multitarea"
        aria-label="Recientes"
        className="w-14 h-9 flex items-center justify-center rounded-lg active:bg-white/10 transition-colors"
      >
        <Square className="w-3.5 h-3.5 stroke-[2.2]" />
      </button>
    </div>
  );
}
