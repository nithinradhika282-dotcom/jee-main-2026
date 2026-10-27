"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, CheckCircle2, Share2, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.log("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Check if already running in standalone mode (PWA installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(Boolean(isStandalone));
    };

    checkStandalone();

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Capture beforeinstallprompt for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user dismissed banner recently
      const dismissed = localStorage.getItem("pwa_banner_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    // 5. Detect appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setJustInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setJustInstalled(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Global custom event so Navbar "Install App" button can trigger install prompt
    const handleTriggerInstall = () => {
      triggerInstall();
    };
    window.addEventListener("trigger-pwa-install", handleTriggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("trigger-pwa-install", handleTriggerInstall);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // In browsers without active beforeinstallprompt (e.g. desktop firefox or already installed)
      setShowIosModal(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_banner_dismissed", "true");
  };

  if (isInstalled && !justInstalled) return null;

  return (
    <>
      {/* 1. SUCCESS TOAST AFTER INSTALLATION */}
      {justInstalled && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white">App Installed Successfully!</p>
            <p className="text-emerald-300/80">Launch from your home screen for distraction-free practice.</p>
          </div>
        </div>
      )}

      {/* 2. FLOATING BOTTOM INSTALL BANNER */}
      {showBanner && !isInstalled && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 bg-slate-900/95 border border-sky-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 shrink-0 shadow-lg shadow-sky-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/icon-192x192.png"
                  alt="JEE 2026 App"
                  className="w-full h-full rounded-[10px] object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">Download JEE 2026 App</h4>
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Instant offline access, NTA fullscreen mode & fast loading.
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={triggerInstall}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-500/25 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Install / Download App
            </button>
            <button
              onClick={dismissBanner}
              className="py-2 px-3 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* 3. IOS / MANUAL INSTALL MODAL */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 shrink-0 shadow-lg shadow-sky-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/icon-192x192.png"
                  alt="JEE 2026 App"
                  className="w-full h-full rounded-[10px] object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Install JEE 2026 App</h3>
                <p className="text-xs text-sky-400 font-medium">Add to your Home Screen</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {isIos
                ? "On iPhone / iPad, follow these 2 quick steps to install the app:"
                : "To install this app on your device, follow these quick steps in your browser:"}
            </p>

            <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 mb-5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  {isIos ? (
                    <>
                      Tap the <span className="text-sky-300 font-semibold inline-flex items-center gap-1"><Share2 className="w-3 h-3 inline" /> Share</span> button in the Safari navigation bar.
                    </>
                  ) : (
                    <>
                      Click the browser menu (<span className="text-sky-300 font-semibold">⋮</span> or <span className="text-sky-300 font-semibold">⚙</span>) or address bar install icon.
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>
                  Scroll down and tap{" "}
                  <span className="text-sky-300 font-semibold inline-flex items-center gap-1">
                    <PlusSquare className="w-3 h-3 inline" /> Add to Home Screen
                  </span>
                  .
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
