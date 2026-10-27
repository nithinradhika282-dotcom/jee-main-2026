"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ReviseSubNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Chapters", href: "/revision" },
    { label: "Formulas", href: "/formulas" },
    { label: "Cards", href: "/flashcards" },
    { label: "Predict '26", href: "/predicted" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Revise Tools"
      className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold mb-3"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={`flex-1 py-2 text-center rounded-lg min-h-[36px] flex items-center justify-center transition-colors ${
              isActive
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
