'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';

const DISMISS_KEY = 'eliasdex-pwa-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if user dismissed within the last 7 days
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowBanner(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm z-50 p-4 rounded-2xl bg-surface-canvas border border-orange-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-surface-primary font-heading">Install EliasDex</h4>
            <p className="text-xs text-ink-500 mt-0.5">Install app for fast, offline-ready streaming experience</p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-ink-500 hover:text-ink-300 p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={dismiss}
          className="text-xs"
        >
          Not Now
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleInstallClick}
          className="text-xs gap-1.5 bg-orange-500 hover:bg-orange-600 border-none"
        >
          <Download className="w-3.5 h-3.5" />
          Install App
        </Button>
      </div>
    </div>
  );
};
