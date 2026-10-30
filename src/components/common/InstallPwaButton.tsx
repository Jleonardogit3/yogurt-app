import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle2, Share, PlusSquare, Sparkles } from 'lucide-react';
import { Modal } from './Modal';

// Interfaz para el evento beforeinstallprompt de PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaButton: React.FC<{
  variant?: 'header' | 'sidebar' | 'banner';
}> = ({ variant = 'header' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar si ya está en modo standalone (instalada)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Escuchar el evento oficial del navegador para instalar
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Aplicación instalada exitosamente');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome, Edge, Android con soporte directo
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Si el navegador no disparó el evento (iOS Safari o ya tiene icono en barra de URL)
      setIsModalOpen(true);
    }
  };

  if (isInstalled) {
    return null; // Si ya está instalada como PWA, no saturamos la vista
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          title="Instalar en tu escritorio o móvil como aplicación nativa"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-sm shadow-rose-200 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-indigo-50 border border-rose-200/80 rounded-2xl p-3.5 text-left mb-3">
          <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>App para Escritorio</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
            Instálala como programa independiente en tu PC o Mac para abrirla con un solo clic.
          </p>
          <button
            onClick={handleInstallClick}
            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Instalar en Escritorio</span>
          </button>
        </div>
      )}

      {/* Modal Guía de Instalación según el Dispositivo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Instalar YogurtApp como Aplicación"
        subtitle="Disfruta de apertura instantánea en escritorio y móvil sin barras de navegador"
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Instrucciones para Escritorio (Chrome / Edge) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-2">
              <Monitor className="w-4 h-4 text-indigo-600" />
              <span>En tu Computadora (Chrome, Edge, Brave):</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside pl-1">
              <li>
                Mira en la <b>barra de direcciones</b> (a la derecha de la URL).
              </li>
              <li>
                Haz clic en el icono de <b>Instalar</b> o <b>"Instalar YogurtApp"</b>.
              </li>
              <li>¡Listo! Se creará un acceso directo en tu Escritorio y menú de inicio.</li>
            </ol>
          </div>

          {/* Instrucciones para iPhone / iPad (iOS Safari) */}
          {isIOS && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs mb-2">
                <Smartphone className="w-4 h-4 text-rose-600" />
                <span>En tu iPhone / iPad (Safari):</span>
              </div>
              <ol className="text-xs text-rose-800 space-y-2 list-decimal list-inside pl-1">
                <li className="flex items-center gap-1.5">
                  <span>1. Toca el botón <b>Compartir</b></span>
                  <Share className="w-3.5 h-3.5 text-rose-600 inline" />
                  <span>en la barra inferior de Safari.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>2. Desliza hacia abajo y pulsa</span>
                  <PlusSquare className="w-3.5 h-3.5 text-rose-600 inline" />
                  <b>"Añadir a la pantalla de inicio"</b>.
                </li>
                <li>3. Pulsa <b>"Añadir"</b> en la esquina superior derecha.</li>
              </ol>
            </div>
          )}

          {/* Instrucciones para Móvil Android */}
          {!isIOS && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>En tu Teléfono Android (Chrome):</span>
              </div>
              <ol className="text-xs text-emerald-800 space-y-1.5 list-decimal list-inside pl-1">
                <li>Toca los <b>3 puntos</b> del menú en la esquina superior de Chrome.</li>
                <li>Selecciona <b>"Instalar aplicación"</b> o <b>"Añadir a la pantalla principal"</b>.</li>
                <li>Aparecerá como una aplicación nativa en tu pantalla de inicio.</li>
              </ol>
            </div>
          )}

          {/* Ventajas */}
          <div className="flex items-center justify-around text-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              100% Sin Internet
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Acceso Rápido
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Sin barra de URL
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
