"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, User } from "lucide-react";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [streak, setStreak] = useState(3);
  const [totalCorrect, setTotalCorrect] = useState(12);
  const [showProfile, setShowProfile] = useState(false);
  const [googleUser, setGoogleUser] = useState({
    name: "Class 12 Ranker",
    email: "student@gmail.com",
    signedIn: false,
  });

  useEffect(() => {
    // 1. Theme sync
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // 2. User profile from localStorage
    const savedUser = localStorage.getItem("google_user");
    if (savedUser) {
      try {
        setGoogleUser(JSON.parse(savedUser));
      } catch {}
    }

    // 3. User stats from API
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setStreak(data.user.streak_days || 1);
          setTotalCorrect(data.user.total_correct || 0);
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

  const handleGoogleSignIn = () => {
    const mockName = "IIT Aspirant";
    const mockEmail = "aspirant2026@gmail.com";
    const u = { name: mockName, email: mockEmail, signedIn: true };
    setGoogleUser(u);
    localStorage.setItem("google_user", JSON.stringify(u));
    setShowProfile(false);

    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ google_login: true, name: mockName, email: mockEmail }),
    }).catch(() => {});
  };

  const handleSignOut = () => {
    const u = { name: "Class 12 Ranker", email: "student@gmail.com", signedIn: false };
    setGoogleUser(u);
    localStorage.removeItem("google_user");
  };

  const handleInstallPwa = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100">
        <div className="max-w-md mx-auto px-4 h-13 flex items-center justify-between">
          {/* Left: App Name */}
          <Link href="/" className="flex items-center gap-2" aria-label="ExamPrep Home">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
              EP
            </div>
            <span className="font-semibold text-base tracking-tight text-white">ExamPrep</span>
          </Link>

          {/* Right: Streak & Profile */}
          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-amber-400 text-xs font-semibold"
              title={`${streak} Day Streak`}
            >
              <Flame size={14} className="text-amber-400" />
              <span>{streak}d</span>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => setShowProfile(true)}
              className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              aria-label="Open profile and settings"
            >
              {googleUser.signedIn ? (
                <span className="text-xs font-bold text-sky-400">
                  {googleUser.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={16} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={googleUser}
        streak={streak}
        totalCorrect={totalCorrect}
        theme={theme}
        onToggleTheme={toggleTheme}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onInstallPwa={handleInstallPwa}
      />
    </>
  );
}
