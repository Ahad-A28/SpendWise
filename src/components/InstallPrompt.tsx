'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-bottom-5">
      <button 
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 p-1"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3 pr-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Install SpendWise</h3>
          <p className="text-slate-400 text-xs mt-0.5">Add to home screen for a better experience</p>
        </div>
      </div>
      <button 
        onClick={handleInstall}
        className="w-full mt-3 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl transition-colors"
      >
        Install App
      </button>
    </div>
  );
}
