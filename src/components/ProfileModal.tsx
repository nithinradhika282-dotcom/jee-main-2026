"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  User,
  Sun,
  Moon,
  Download,
  BookmarkCheck,
  FileText,
  Settings,
  Flame,
  Award,
  LogOut,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    signedIn: boolean;
    avatar_url?: string;
  };
  streak: number;
  totalCorrect: number;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onInstallPwa: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  streak,
  totalCorrect,
  theme,
  onToggleTheme,
  onGoogleSignIn,
  onSignOut,
  onInstallPwa,
}: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close Profile" />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-4 shadow-xl z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Top Handle on Mobile */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Your Profile & Settings</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
              {user.signedIn ? user.name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          {user.signedIn ? (
            <button
              onClick={onSignOut}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-900/50"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="text-xs text-white bg-sky-600 hover:bg-sky-500 font-medium px-3 py-1.5 rounded-lg transition"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
              <Flame size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Daily Streak</p>
              <p className="text-sm font-semibold text-white">{streak} Days</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
              <Award size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Solved Correct</p>
              <p className="text-sm font-semibold text-white">{totalCorrect} Qs</p>
            </div>
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="mt-4 space-y-1 text-sm">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition min-h-[44px]"
          >
            <div className="flex items-center gap-3 text-slate-200">
              {theme === "dark" ? <Sun size={18} className="text-slate-400" /> : <Moon size={18} className="text-slate-400" />}
              <span>Appearance</span>
            </div>
            <span className="text-xs font-semibold text-sky-400 capitalize">{theme} Theme</span>
          </button>

          {/* Download / Install App */}
          <button
            onClick={() => {
              onClose();
              onInstallPwa();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition min-h-[44px]"
          >
            <div className="flex items-center gap-3 text-slate-200">
              <Download size={18} className="text-slate-400" />
              <span>Download Mobile App (PWA)</span>
            </div>
            <span className="text-xs font-semibold text-sky-400">Install</span>
          </button>

          {/* Mistakes & Bookmarks */}
          <Link
            href="/bookmarks"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition min-h-[44px]"
          >
            <div className="flex items-center gap-3 text-slate-200">
              <BookmarkCheck size={18} className="text-slate-400" />
              <span>Mistakes & Bookmarks</span>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </Link>

          {/* 2026 Exam Pattern */}
          <Link
            href="/pattern"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition min-h-[44px]"
          >
            <div className="flex items-center gap-3 text-slate-200">
              <FileText size={18} className="text-slate-400" />
              <span>2026 NTA Pattern & Sections</span>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </Link>

          {/* Review / Admin */}
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition min-h-[44px]"
          >
            <div className="flex items-center gap-3 text-slate-200">
              <Settings size={18} className="text-slate-400" />
              <span>Question Audit & Review</span>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck size={12} />
            <span>ExamPrep PYQ • 4,063 Authentic Exam Questions</span>
          </p>
        </div>
      </div>
    </div>
  );
}
