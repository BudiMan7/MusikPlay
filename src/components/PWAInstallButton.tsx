import React from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenModal: () => void;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenModal,
  variant = 'compact',
}) => {
  const { isInstalled } = usePWAInstall();

  // If already running standalone, show a subtle APK download badge instead of hiding completely
  if (isInstalled && variant === 'compact') {
    return (
      <button
        onClick={onOpenModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-medium border border-indigo-400/20 transition backdrop-blur-md"
        title="Unduh Project APK / Bantuan"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Paket APK</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={onOpenModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 hover:from-indigo-500/30 hover:to-violet-500/30 text-indigo-200 text-xs font-medium border border-indigo-500/30 shadow-sm transition backdrop-blur-md"
      >
        <Smartphone className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>Install APK</span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpenModal}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 transition group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-white group-hover:text-indigo-200 transition">
            Pasang ke Android / Unduh APK
          </div>
          <div className="text-xs text-slate-400">
            WebAPK 1-klik, source Kotlin, & build APK otomatis
          </div>
        </div>
      </div>
      <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
        Buka
      </span>
    </button>
  );
};
