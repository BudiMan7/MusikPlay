import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, ExternalLink, X, Sparkles, Terminal, ShieldCheck, ChevronRight } from 'lucide-react';
import { GlassCard } from '../design/GlassCard';
import { GlassButton } from '../design/GlassButton';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'github'>('pwa');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <GlassCard
        className="w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20 shadow-2xl relative"
        variant="glow"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Download & Pasang Aplikasi
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Android & iOS
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih metode instalasi atau unduh paket APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 px-5 pt-3 gap-2 bg-black/10">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Pasang Langsung (WebAPK)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Android Studio Project (.ZIP)
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Build APK Otomatis
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      Pemasangan Cepat Tanpa Perlu Komputer
                    </h3>
                    <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
                      Android secara otomatis mengubah aplikasi ini menjadi <strong>WebAPK asli</strong>. Akan muncul di daftar aplikasi HP, memiliki ikon sendiri, berjalan layar penuh (standalone), bisa memutar lagu di latar belakang, dan berfungsi 100% offline.
                    </p>
                  </div>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Aplikasi Sudah Terpasang!</p>
                    <p className="text-xs text-emerald-300/80">
                      Anda sedang menjalankan Liquid Glass Music Player dalam mode aplikasi mandiri (standalone).
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="space-y-2">
                  <GlassButton
                    onClick={handleInstallClick}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Smartphone className="w-4 h-4" />
                    Pasang Sekarang ke Layar Utama
                  </GlassButton>
                  <p className="text-[11px] text-center text-slate-400">
                    Klik tombol di atas untuk konfirmasi instalasi di perangkat Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cara Pasang Manual di HP:
                  </h4>

                  {/* Android Chrome */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-medium text-xs">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">1</span>
                      Browser Chrome di HP Android:
                    </div>
                    <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                      Ketuk menu titik tiga (<strong>⋮</strong>) di pojok kanan atas browser &rarr; pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar utama"</strong>.
                    </p>
                  </div>

                  {/* iOS Safari */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-medium text-xs">
                      <span className="w-5 h-5 rounded-full bg-violet-500/30 text-violet-300 flex items-center justify-center text-[10px] font-bold">2</span>
                      Browser Safari di iPhone / iPad:
                    </div>
                    <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                      Ketuk tombol <strong>Bagikan (Share icon)</strong> di toolbar Safari &rarr; gulir ke bawah &rarr; pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Download className="w-4 h-4 text-indigo-400" />
                  Paket Lengkap Android Studio (Kotlin + Jetpack Compose)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Semua kode sumber native Kotlin, Jetpack Compose UI, Room Database, Media3 ExoPlayer Service, dan Equalizer Controller sudah disiapkan dan dikemas dalam format ZIP.
                </p>
                <div className="pt-2">
                  <a
                    href="/LiquidGlassMusic-AndroidProject.zip"
                    download="LiquidGlassMusic-AndroidProject.zip"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Project .ZIP (18 KB)
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/20 border border-white/10 space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Langkah Kompilasi APK di Laptop / PC:
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-1 leading-relaxed">
                  <li>Ekstrak file <code className="text-indigo-300">LiquidGlassMusic-AndroidProject.zip</code>.</li>
                  <li>Buka folder tersebut di <strong>Android Studio Ladybug / Koala</strong>.</li>
                  <li>Tunggu Gradle sinkronisasi dependensi.</li>
                  <li>Pilih menu <strong>Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)</strong>.</li>
                  <li>File APK siap diinstal pada folder <code className="text-indigo-300">app/build/outputs/apk/release/</code>!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Build APK Otomatis via GitHub Actions (Cloud Gratis)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kami sudah menyertakan file <code className="text-indigo-300">.github/workflows/build-apk.yml</code>. Anda tidak perlu install Android Studio di komputer. Cukup upload ke GitHub:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 pl-1">
                  <li>Push atau upload source code ke repository GitHub pribadi Anda.</li>
                  <li>Buka tab <strong>Actions</strong> di GitHub.</li>
                  <li>GitHub Actions akan otomatis meng-compile APK dalam 2 menit.</li>
                  <li>Download file <strong className="text-white">LiquidGlassMusic-Release-APK</strong> langsung ke HP Anda!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Liquid Glass Music Player &bull; iOS 26 Design &bull; Media3 Audio
          </p>
          <GlassButton
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            Tutup
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
