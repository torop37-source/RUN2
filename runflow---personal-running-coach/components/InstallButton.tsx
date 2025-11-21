import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

export const InstallButton: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    window.addEventListener("beforeinstallprompt", handler);

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Check if not in standalone mode (not already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIosDevice && !isStandalone) {
        setIsIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isIOS) {
        setShowIOSInstructions(true);
    } else if (promptInstall) {
      promptInstall.prompt();
    }
  };

  if (!supportsPWA && !isIOS) {
    return null;
  }

  return (
    <>
        <button 
          onClick={handleInstallClick}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-primary font-bold hover:bg-primary/10 transition-colors animate-pulse"
        >
          <Icon name="download" />
          <p className="text-sm font-medium leading-normal">Installer l'App</p>
        </button>

        {showIOSInstructions && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowIOSInstructions(false)}>
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-t-2xl sm:rounded-xl w-full max-w-sm shadow-2xl border-t sm:border border-border-light dark:border-border-dark animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Installer sur iPhone</h3>
                        <button onClick={() => setShowIOSInstructions(false)}><Icon name="close" /></button>
                    </div>
                    <div className="flex flex-col gap-4 text-sm text-subtle-light dark:text-subtle-dark">
                        <p>Pour installer RunFlow sur votre écran d'accueil :</p>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center size-8 bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-text-light dark:text-text-dark">1</span>
                            <p>Appuyez sur le bouton <strong>Partager</strong> <Icon name="ios_share" className="inline text-base mx-1" /> en bas de votre navigateur.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center size-8 bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-text-light dark:text-text-dark">2</span>
                            <p>Faites défiler vers le bas et choisissez <strong>"Sur l'écran d'accueil"</strong>.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};