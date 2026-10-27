"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Timer, Layers, Sparkles, User } from "lucide-react";
import ProfileModal from "./ProfileModal";

export default function BottomNav() {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { href: "/", label: "Practice", icon: BookOpen },
    { href: "/mock-test", label: "Mock Test", icon: Timer },
    { href: "/revision", label: "Revise", icon: Layers, activePrefixes: ["/revision", "/formulas", "/flashcards", "/predicted"] },
    { href: "/ai-tutor", label: "AI Tutor", icon: Sparkles },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 safe-bottom-bar"
        aria-label="Bottom Navigation"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activePrefixes
              ? item.activePrefixes.some((p) => pathname === p || pathname?.startsWith(p + "/"))
              : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors select-none ${
                  isActive ? "text-sky-400 font-semibold" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon size={19} className="mb-0.5" />
                <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* Profile Tab */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center justify-center min-h-[44px] py-1 text-slate-500 hover:text-slate-300 transition-colors select-none"
            aria-label="Open Profile & Settings"
          >
            <User size={19} className="mb-0.5" />
            <span className="text-[11px] leading-tight tracking-tight">Profile</span>
          </button>
        </div>
      </nav>

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={{
          name: "Class 12 Ranker",
          email: "student@gmail.com",
          signedIn: false,
        }}
        streak={3}
        totalCorrect={12}
        theme="dark"
        onToggleTheme={() => {
          const current = document.documentElement.getAttribute("data-theme") || "dark";
          const next = current === "dark" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", next);
          localStorage.setItem("theme", next);
        }}
        onGoogleSignIn={() => setShowProfile(false)}
        onSignOut={() => setShowProfile(false)}
        onInstallPwa={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
          }
        }}
      />
    </>
  );
}
