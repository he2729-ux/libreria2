import { Wifi, BatteryMedium } from 'lucide-react';

interface AndroidStatusBarProps {
  time?: string;
  theme?: 'dark' | 'light' | 'twilight';
  bgColor?: string;
  textColor?: string;
}

export function AndroidStatusBar({
  time = '20:02',
  theme = 'dark',
  bgColor,
  textColor,
}: AndroidStatusBarProps) {
  const isLight = theme === 'light';

  return (
    <div
      className={`w-full px-4 py-1.5 flex items-center justify-between text-xs font-sans tracking-tight select-none transition-colors ${
        !bgColor ? (isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#041a22] text-slate-300') : ''
      }`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="flex items-center gap-2 font-medium">
        <span>{time}</span>
        <span className="text-[10px] opacity-75">●</span>
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-[10px] tabular-nums font-mono opacity-80">571 B/s</span>
        <Wifi className="w-3.5 h-3.5" />
        <span className="font-semibold text-[10px] tracking-tighter">VoLTE</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">92</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}
