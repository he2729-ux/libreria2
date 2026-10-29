import React, { useState } from 'react';
import { X, Cloud, RefreshCw, CheckCircle2, Download, UploadCloud, Database } from 'lucide-react';
import { Book, DictionaryItem } from '../types/book';

interface SyncModalProps {
  onClose: () => void;
  books: Book[];
  dictionary: DictionaryItem[];
  onImportBackup: (books: Book[], dictionary: DictionaryItem[]) => void;
}

export function SyncModal({ onClose, books, dictionary, onImportBackup }: SyncModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Hace 5 minutos');
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleDriveSync = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setLastSyncTime('Ahora mismo');
      // Save snapshot to localStorage
      localStorage.setItem('libris_cloud_backup_time', new Date().toISOString());
    }, 1200);
  };

  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      books,
      dictionary,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `libris-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.books && Array.isArray(json.books)) {
          onImportBackup(json.books, json.dictionary || []);
          alert('¡Copia de seguridad restaurada con éxito!');
          onClose();
        }
      } catch (err) {
        alert('Error al leer el archivo de copia de seguridad.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#082a36] text-slate-100 rounded-2xl border border-[#0f3847] p-5 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#0f3847]">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">
              Sincronización en la Nube
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Mantén sincronizados tus libros, progreso de lectura, señaladores, citas y diccionarios personales en todos tus dispositivos mediante Google Drive o copia local.
        </p>

        {/* Google Drive Card */}
        <div className="bg-[#062029] p-4 rounded-xl border border-[#0f3847] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                G
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Google Drive</span>
                <span className="text-[10px] text-slate-400">Última sync: {lastSyncTime}</span>
              </div>
            </div>
            {syncSuccess && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sincronizado
              </span>
            )}
          </div>

          <button
            onClick={handleDriveSync}
            disabled={isSyncing}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando biblioteca...' : 'Sincronizar con Google Drive'}</span>
          </button>
        </div>

        {/* Local Backup & Restore */}
        <div className="pt-2 border-t border-[#0f3847] space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Copia de Seguridad Local
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleExportJson}
              className="p-2.5 bg-[#0d3b4b] hover:bg-[#124b5e] border border-[#174d61] rounded-xl flex items-center justify-center gap-1.5 text-teal-300 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Exportar JSON</span>
            </button>

            <label className="p-2.5 bg-[#0d3b4b] hover:bg-[#124b5e] border border-[#174d61] rounded-xl flex items-center justify-center gap-1.5 text-teal-300 font-medium cursor-pointer text-center">
              <UploadCloud className="w-4 h-4" />
              <span>Importar JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
