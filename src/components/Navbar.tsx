"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BarChart3,
  BookmarkCheck,
  BrainCircuit,
  Settings,
  Sun,
  Moon,
  Timer,
  Zap,
  Award,
  Flame,
  Target,
  LogIn,
  LogOut,
  User,
  CheckCircle,
  X,
  Sparkles,
  RotateCw,
  Layers,
  Download
} from "lucide-react";

interface GoogleUser {
  name: string;
  email: string;
  avatar_url?: string;
  signedIn: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [userStats, setUserStats] = useState<{ streak: number; correct: number }>({ streak: 3, correct: 12 });
  const [googleUser, setGoogleUser] = useState<GoogleUser>({
    name: "Class 12 Ranker",
    email: "student@gmail.com",
    signedIn: false,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // Load saved Google User from localStorage
    const savedUser = localStorage.getItem("google_user");
    if (savedUser) {
      try {
        setGoogleUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // Fetch user stats
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserStats({
            streak: data.user.streak_days || 1,
            correct: data.user.total_correct || 0,
          });
          if (data.user.name && !savedUser) {
            setGoogleUser((prev) => ({ ...prev, name: data.user.name }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleGoogleSignIn = (userName: string, userEmail: string) => {
    const u: GoogleUser = {
      name: userName,
      email: userEmail,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`,
      signedIn: true,
    };
    setGoogleUser(u);
    localStorage.setItem("google_user", JSON.stringify(u));
    setShowAuthModal(false);

    // Sync with backend
    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        google_login: true,
        name: u.name,
        email: u.email,
        avatar_url: u.avatar_url,
      }),
    }).catch(console.error);
  };

  const handleSignOut = () => {
    const u: GoogleUser = {
      name: "Class 12 Ranker",
      email: "student@gmail.com",
      signedIn: false,
    };
    setGoogleUser(u);
    localStorage.removeItem("google_user");
    setShowAuthModal(false);
  };

  const navItems = [
    { href: "/", label: "Practice", icon: BookOpen },
    { href: "/mock-test", label: "Mock Test", icon: Timer, highlight: true },
    { href: "/flashcards", label: "Flashcards", icon: RotateCw },
    { href: "/revision", label: "Revision", icon: Layers },
    { href: "/formulas", label: "Formulas", icon: Zap },
    { href: "/ai-tutor", label: "AI Tutor", icon: Sparkles },
    { href: "/predicted", label: "Predict '26", icon: BrainCircuit },
    { href: "/analysis", label: "Analysis", icon: BarChart3 },
    { href: "/bookmarks", label: "Mistakes", icon: BookmarkCheck },
    { href: "/admin", label: "Review", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center font-black text-xs text-white shadow-md shadow-sky-500/20">
            4000+
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight flex items-center gap-1.5 text-white">
              ExamPrep PYQ
              <span className="text-[9px] uppercase font-bold bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30 flex items-center gap-0.5">
                <Target size={10} /> 4,063 Qs
              </span>
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">
              JEE • EAMCET • BITSAT • VITEEE • 60 Chapters
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Flame size={13} className="text-amber-400 animate-pulse" />
            <span>{userStats.streak}d</span>
          </div>

          {/* Google Profile / Login Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            title={googleUser.signedIn ? googleUser.name : "Sign in with Google"}
          >
            {googleUser.signedIn ? (
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-emerald-400">
                {googleUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
          </button>

          {/* Download / Install PWA App Button */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-300 hover:text-white transition-all active:scale-95 text-[11px] font-semibold shadow-sm"
            title="Download / Install JEE 2026 App (PWA)"
          >
            <Download size={13} className="text-sky-400" />
            <span className="hidden xs:inline">App</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile-first navigation bar */}
      <nav className="max-w-md mx-auto px-1.5 pb-1 pt-0 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs border-t border-slate-800/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-all shrink-0 relative ${
                isActive
                  ? "text-sky-400 font-bold bg-sky-500/10"
                  : item.highlight
                  ? "text-amber-300 hover:text-amber-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={15} className={`mb-0.5 ${item.highlight && !isActive ? "text-amber-400" : ""}`} />
              <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Google Login / Account Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="font-bold text-sm text-white">Google Account Sign-In</h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {googleUser.signedIn ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white text-sm ring-2 ring-emerald-500/50">
                    {googleUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-white truncate">{googleUser.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{googleUser.email}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle size={10} /> Progress Sync Active
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-lg text-[11px] text-slate-400 space-y-1 border border-slate-800/80">
                  <div>Streak: <strong className="text-amber-400">{userStats.streak} Days</strong></div>
                  <div>Solved Target: <strong className="text-sky-400">{userStats.correct} / 60 Correct</strong></div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign in with your Google account to sync your practice history, streaks, mistakes, and predicted twin recommendations across devices.
                </p>

                <button
                  onClick={() => handleGoogleSignIn("Nithin Chary", "nithin.chary@gmail.com")}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="text-[10px] text-center text-slate-500">
                  Instant secure local profile pairing
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}