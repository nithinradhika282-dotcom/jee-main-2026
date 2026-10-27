"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import ReviseSubNav from "@/components/ReviseSubNav";
import {
  Search,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Zap,
  Filter,
  AlertTriangle,
  Lightbulb,
  Check,
  Copy,
  Layers,
  ArrowRight
} from "lucide-react";
import LatexRenderer from "@/components/LatexRenderer";
import { ALL_REVISION_DATA, RevisionChapterItem } from "@/data/allFormulasRevisionData";
import { SpeechSpeaker } from "@/lib/speech";

const ITEMS_PER_PAGE = 15;

// Memoized Lightweight Chapter Row (NO KaTeX in list)
const ChapterRow = React.memo(function ChapterRow({
  item,
  onSelect,
}: {
  item: RevisionChapterItem;
  onSelect: (item: RevisionChapterItem) => void;
}) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:bg-slate-800/80 transition text-left min-h-[48px]"
      aria-label={`Open revision for ${item.chapter}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        {/* Yield indicator dot */}
        {item.high_yield_weightage === "Very High" ? (
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Very High Yield" />
        ) : item.high_yield_weightage === "High" ? (
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="High Yield" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-transparent shrink-0" />
        )}

        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{item.chapter}</p>
          <p className="text-xs text-slate-400 truncate">{item.topic}</p>
        </div>
      </div>

      <ChevronRight size={16} className="text-slate-500 shrink-0" />
    </button>
  );
});

export default function RevisionPage() {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [selectedClass, setSelectedClass] = useState<"All" | "11" | "12">("All");
  const [showClassModal, setShowClassModal] = useState(false);

  // Debounced search state
  const [rawSearch, setRawSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination & Selected Chapter Modal
  const [currentPage, setCurrentPage] = useState(1);
  const [activeChapter, setActiveChapter] = useState<RevisionChapterItem | null>(null);

  // Audio speech & Copy state inside Modal
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // 300ms Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(rawSearch.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  // Filter items
  const filteredData = useMemo(() => {
    return ALL_REVISION_DATA.filter((item) => {
      const matchSubject = selectedSubject === "All" || item.subject === selectedSubject;
      const matchClass = selectedClass === "All" || item.class_level.toString() === selectedClass;

      const q = debouncedSearch;
      const matchSearch =
        !q ||
        item.chapter.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.common_trap.toLowerCase().includes(q) ||
        item.no_pen_trick.toLowerCase().includes(q);

      return matchSubject && matchClass && matchSearch;
    });
  }, [selectedSubject, selectedClass, debouncedSearch]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

  // Current page items (only 10-15 in DOM)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Group paginated items by subject if "All" is active
  const groupedPaginated = useMemo(() => {
    if (selectedSubject !== "All") {
      return [{ subject: selectedSubject, items: paginatedData }];
    }
    const groups: { [key: string]: RevisionChapterItem[] } = {};
    for (const item of paginatedData) {
      if (!groups[item.subject]) groups[item.subject] = [];
      groups[item.subject].push(item);
    }
    return Object.keys(groups).map((s) => ({ subject: s, items: groups[s] }));
  }, [paginatedData, selectedSubject]);

  const handleSelectChapter = useCallback((item: RevisionChapterItem) => {
    setActiveChapter(item);
    setSpeaking(false);
    SpeechSpeaker.stop();
  }, []);

  const handleSpeakActive = () => {
    if (!activeChapter) return;
    if (speaking) {
      SpeechSpeaker.stop();
      setSpeaking(false);
    } else {
      const script = `${activeChapter.chapter}. Formula: ${activeChapter.formula_latex}. Note: ${activeChapter.description}. Exam trap: ${activeChapter.common_trap}. Shortcut: ${activeChapter.no_pen_trick}`;
      SpeechSpeaker.speak(script, () => setSpeaking(false));
      setSpeaking(true);
    }
  };

  const handleCopyFormula = () => {
    if (!activeChapter) return;
    navigator.clipboard.writeText(activeChapter.formula_latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* 1. TOP SEGMENTED SUB-TABS (Revise Section) */}
      <ReviseSubNav />

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Debounced Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Search chapters, topics..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              aria-label="Search revision chapters"
            />
            {rawSearch && (
              <button
                onClick={() => setRawSearch("")}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs p-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Class Filter Button */}
          <button
            onClick={() => setShowClassModal(true)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition min-h-[38px] ${
              selectedClass !== "All"
                ? "bg-sky-600/15 border-sky-500 text-sky-400"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
            aria-label="Filter by class"
          >
            <Filter size={13} />
            <span>{selectedClass === "All" ? "Class" : `Cl. ${selectedClass}`}</span>
          </button>
        </div>

        {/* 3. ROW OF SUBJECT CHIPS (Max 4 Chips) */}
        <div className="grid grid-cols-4 gap-1.5">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((subj) => (
            <button
              key={subj}
              onClick={() => {
                setSelectedSubject(subj);
                setCurrentPage(1);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition text-center border ${
                selectedSubject === subj
                  ? "bg-slate-800 border-sky-500 text-sky-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {subj === "Mathematics" ? "Maths" : subj}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CHAPTERS LIST (LIGHTWEIGHT ROWS ONLY) */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
            No chapters match your search or filter.
          </div>
        ) : (
          groupedPaginated.map((group) => (
            <div key={group.subject} className="space-y-1.5">
              {selectedSubject === "All" && (
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1 pt-1">
                  <span>{group.subject}</span>
                  <span className="text-[11px] text-slate-500">{group.items.length} Ch</span>
                </div>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <ChapterRow key={item.id} item={item} onSelect={handleSelectChapter} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. PAGINATION CONTROLS (Only 15 in DOM) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 disabled:opacity-40 disabled:pointer-events-none min-h-[40px]"
          >
            Previous
          </button>
          <span className="font-semibold text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 disabled:opacity-40 disabled:pointer-events-none min-h-[40px]"
          >
            Next
          </button>
        </div>
      )}

      {/* 6. CLASS FILTER MODAL */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowClassModal(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-4 shadow-xl z-10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Filter by Class Level</h3>
              <button
                onClick={() => setShowClassModal(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5">
              {(["All", "11", "12"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedClass(lvl);
                    setCurrentPage(1);
                    setShowClassModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition min-h-[44px] ${
                    selectedClass === lvl
                      ? "bg-sky-600/15 border-sky-500 text-sky-400"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span>{lvl === "All" ? "All Classes (11 & 12)" : `Class ${lvl} Only`}</span>
                  {selectedClass === lvl && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. CHAPTER DETAIL BOTTOM SHEET / MODAL (KATEX RENDERS ONLY HERE) */}
      {activeChapter && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => {
              setActiveChapter(null);
              SpeechSpeaker.stop();
            }}
          />
          <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-4 shadow-xl z-10 max-h-[88vh] overflow-y-auto no-scrollbar space-y-3">
            {/* Top Handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
                  <span>{activeChapter.subject}</span>
                  <span>•</span>
                  <span>Class {activeChapter.class_level}</span>
                  {activeChapter.high_yield_weightage === "Very High" && (
                    <>
                      <span>•</span>
                      <span className="text-rose-400 font-semibold">High Yield</span>
                    </>
                  )}
                </div>
                <h2 className="text-base font-semibold text-white">{activeChapter.chapter}</h2>
                <p className="text-xs text-sky-400 font-medium">{activeChapter.topic}</p>
              </div>

              <button
                onClick={() => {
                  setActiveChapter(null);
                  SpeechSpeaker.stop();
                }}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition"
                aria-label="Close chapter sheet"
              >
                <X size={18} />
              </button>
            </div>

            {/* Master Formula (KaTeX Rendered on demand) */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-400 flex items-center gap-1">
                  <Zap size={13} /> Master Formula:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSpeakActive}
                    className="p-1 text-slate-400 hover:text-white rounded transition"
                    title="Audio narration"
                  >
                    {speaking ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} />}
                  </button>
                  <button
                    onClick={handleCopyFormula}
                    className="p-1 text-slate-400 hover:text-white rounded transition"
                    title="Copy formula"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="text-center overflow-x-auto py-1">
                <LatexRenderer content={`$$${activeChapter.formula_latex}$$`} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-900">
                <LatexRenderer content={activeChapter.description} />
              </p>
            </div>

            {/* 30-Second Mental Shortcut */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <p className="font-semibold text-amber-400 flex items-center gap-1">
                <Lightbulb size={13} /> 30-Second Shortcut Trick:
              </p>
              <div className="text-slate-300 leading-relaxed">
                <LatexRenderer content={activeChapter.no_pen_trick} />
              </div>
            </div>

            {/* Common Exam Trap */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <p className="font-semibold text-rose-400 flex items-center gap-1">
                <AlertTriangle size={13} /> Negative Marking Trap:
              </p>
              <div className="text-slate-300 leading-relaxed">
                <LatexRenderer content={activeChapter.common_trap} />
              </div>
            </div>

            {/* Key Points */}
            {activeChapter.key_points && activeChapter.key_points.length > 0 && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-200">Key Points & Rules:</p>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {activeChapter.key_points.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <LatexRenderer content={pt} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Primary Action Button: Practice this chapter */}
            <Link
              href={`/?chapter=${encodeURIComponent(activeChapter.chapter)}&subject=${encodeURIComponent(activeChapter.subject)}`}
              onClick={() => {
                setActiveChapter(null);
                SpeechSpeaker.stop();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition shadow-sm min-h-[44px]"
            >
              <span>Practice Questions for this Chapter</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
