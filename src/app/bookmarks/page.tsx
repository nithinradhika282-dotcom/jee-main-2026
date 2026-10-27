"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import LatexRenderer from "@/components/LatexRenderer";
import { BookmarkCheck, AlertOctagon, RotateCcw, ChevronRight } from "lucide-react";

export default function BookmarksPage() {
  const [activeTab, setActiveTab] = useState<"mistakes" | "bookmarks">("mistakes");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = (filter: "mistakes" | "bookmarks") => {
    setLoading(true);
    fetch(`/api/attempt?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-4 pb-12">
      {/* Header and Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm uppercase tracking-wider">
          <BookmarkCheck size={16} />
          <span>My Revision Hub</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Review your mistakes and bookmarked questions from JEE Main 2026 practice sessions.
        </p>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("mistakes")}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "mistakes"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertOctagon size={14} /> My Mistakes
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "bookmarks"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookmarkCheck size={14} /> Saved Bookmarks
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 animate-pulse text-xs">
          Loading {activeTab}...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
          <p className="text-slate-300 font-semibold text-xs">
            {activeTab === "mistakes"
              ? "No recorded mistakes yet! Start practicing from the Home page."
              : "No bookmarked questions saved yet."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline pt-2 font-medium"
          >
            Go to Practice <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      item.subject === "Physics"
                        ? "bg-blue-500/20 text-blue-300"
                        : item.subject === "Chemistry"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {item.subject}
                  </span>
                  <span className="text-slate-400 text-[11px] font-medium truncate max-w-[150px]">
                    {item.chapter}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Question Text Preview */}
              <div className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                <LatexRenderer content={item.question_text_latex} />
              </div>

              {/* Your answer vs Correct answer */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div>
                  <div className="text-slate-500 text-[10px]">Your Answer:</div>
                  <div className="font-semibold text-rose-400 mt-0.5 truncate">
                    {item.selected_answer ? (
                      <LatexRenderer content={item.selected_answer} />
                    ) : (
                      "Not selected"
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Official Key:</div>
                  <div className="font-semibold text-emerald-400 mt-0.5 truncate">
                    <LatexRenderer content={item.correct_answer} />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-1">
                <Link
                  href={`/?subject=${encodeURIComponent(item.subject)}&chapter=${encodeURIComponent(
                    item.chapter
                  )}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  <RotateCcw size={12} /> Re-practice
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
