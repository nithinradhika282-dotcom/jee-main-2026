"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Zap,
  Filter,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  RotateCw,
  Flame,
  Award
} from "lucide-react";
import LatexRenderer from "@/components/LatexRenderer";
import { ALL_REVISION_DATA, RevisionChapterItem } from "@/data/allFormulasRevisionData";
import { SpeechSpeaker } from "@/lib/speech";
import { playSound } from "@/lib/audio";

export default function RevisionPage() {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [selectedClass, setSelectedClass] = useState<"All" | "11" | "12">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Filter items
  const filteredData = useMemo(() => {
    return ALL_REVISION_DATA.filter((item) => {
      const matchSubject = selectedSubject === "All" || item.subject === selectedSubject;
      const matchClass = selectedClass === "All" || item.class_level.toString() === selectedClass;
      
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.chapter.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.common_trap.toLowerCase().includes(q) ||
        item.no_pen_trick.toLowerCase().includes(q) ||
        item.key_points.some(kp => kp.toLowerCase().includes(q));

      return matchSubject && matchClass && matchSearch;
    });
  }, [selectedSubject, selectedClass, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSound("click");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (item: RevisionChapterItem) => {
    if (speakingId === item.id) {
      SpeechSpeaker.stop();
      setSpeakingId(null);
    } else {
      const script = `Revision notes for ${item.chapter}. Topic: ${item.topic}. Formula: ${item.formula_latex}. Explanation: ${item.description}. Negative marking exam warning: ${item.common_trap}. Shortcut trick: ${item.no_pen_trick}`;
      SpeechSpeaker.speak(script, () => {
        setSpeakingId(null);
      });
      setSpeakingId(item.id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedChapterId(prev => prev === id ? null : id);
    playSound("click");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-12 z-20 backdrop-blur-md bg-slate-900/90 shadow-sm">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Layers size={16} />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Complete JEE Main Revision
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase">
                    All 60 Ch
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">Physics • Chemistry • Mathematics Formula Bank</p>
              </div>
            </div>

            <Link
              href="/flashcards"
              className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-800/50"
            >
              <RotateCw size={12} />
              <span>Flashcards</span>
            </Link>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas, reactions, theorems, shortcuts..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subject Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((subj) => (
              <button
                key={subj}
                onClick={() => {
                  setSelectedSubject(subj);
                  playSound("click");
                }}
                className={`py-1.5 rounded-lg font-semibold transition-all text-center ${
                  selectedSubject === subj
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Class Filter Tabs */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <span className="text-[11px]">Filter by Class:</span>
            <div className="flex items-center gap-1">
              {(["All", "11", "12"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedClass(lvl)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${
                    selectedClass === lvl
                      ? "bg-slate-800 text-white border-sky-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {lvl === "All" ? "All Classes" : `Class ${lvl}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Revision List */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Showing {filteredData.length} of {ALL_REVISION_DATA.length} Chapters</span>
          <span className="text-[11px] text-sky-400">Tap to expand detailed sheet</span>
        </div>

        {filteredData.map((item) => {
          const isExpanded = expandedChapterId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? "bg-slate-900 border-sky-500/40 shadow-lg shadow-sky-950/20"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-3.5 cursor-pointer select-none space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                        item.subject === "Physics"
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                          : item.subject === "Chemistry"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {item.subject}
                    </span>

                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      Class {item.class_level}
                    </span>

                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold flex items-center gap-0.5">
                      <Flame size={10} className="text-rose-400" />
                      {item.high_yield_weightage} Yield
                    </span>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">{item.chapter}</h3>
                  <p className="text-[11px] text-sky-400 font-medium">{item.topic}</p>
                </div>

                {/* Compact Formula Preview (when collapsed) */}
                {!isExpanded && (
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-center text-xs text-slate-300 overflow-x-auto">
                    <LatexRenderer content={`$$${item.formula_latex}$$`} />
                  </div>
                )}
              </div>

              {/* Expanded Comprehensive Revision Sheet */}
              {isExpanded && (
                <div className="p-3.5 pt-0 border-t border-slate-800/80 space-y-3 text-xs animate-in fade-in duration-200">
                  {/* Action Bar inside Expanded Card */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-1 text-sky-400 font-bold text-xs">
                      <Zap size={14} /> Master Formula & Relation:
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(item.id, item.formula_latex)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700"
                      >
                        {copiedId === item.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedId === item.id ? "Copied" : "Copy LaTeX"}</span>
                      </button>

                      <button
                        onClick={() => handleSpeak(item)}
                        className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                          speakingId === item.id
                            ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {speakingId === item.id ? <VolumeX size={11} /> : <Volume2 size={11} />}
                        <span>{speakingId === item.id ? "Stop" : "Listen"}</span>
                      </button>
                    </div>
                  </div>

                  {/* High Quality Formula Box */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-sky-500/30 text-center text-sky-200 text-sm overflow-x-auto shadow-inner">
                    <LatexRenderer content={`$$${item.formula_latex}$$`} />
                  </div>

                  {/* Core Description */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 leading-relaxed">
                    <LatexRenderer content={item.description} />
                  </div>

                  {/* Key Takeaways & Exam Points */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-[11px] text-indigo-300 flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-400" /> High-Frequency Concept Keys:
                    </div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {item.key_points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span className="leading-relaxed">
                            <LatexRenderer content={pt} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Student Trap Alert */}
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-rose-400">
                      <AlertTriangle size={13} /> Common Student Trap & Negative Mark Warning:
                    </div>
                    <p className="text-rose-200/90 leading-relaxed pl-4">
                      <LatexRenderer content={item.common_trap} />
                    </p>
                  </div>

                  {/* 30-Second No-Pen Shortcut Trick */}
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-400">
                      <Zap size={13} /> 🧠 30-Second No-Pen Mental Shortcut:
                    </div>
                    <p className="text-amber-200/90 leading-relaxed pl-4">
                      <LatexRenderer content={item.no_pen_trick} />
                    </p>
                  </div>

                  {/* Practice Links */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/?chapter=${encodeURIComponent(item.chapter)}`}
                      className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-center text-[11px] font-semibold text-sky-300 border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Practice 65+ PYQs</span>
                      <ArrowRight size={12} />
                    </Link>

                    <Link
                      href={`/flashcards`}
                      className="py-2 px-2.5 bg-amber-950/40 hover:bg-amber-900/40 rounded-lg text-center text-[11px] font-semibold text-amber-300 border border-amber-800/50 transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCw size={12} />
                      <span>Review as Card</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-2">
            <BookOpen size={32} className="mx-auto text-slate-600" />
            <h3 className="font-bold text-white text-sm">No chapters match your search</h3>
            <p className="text-xs text-slate-400">Try searching with a broader topic name or reset the filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject("All");
                setSelectedClass("All");
              }}
              className="mt-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-semibold text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
