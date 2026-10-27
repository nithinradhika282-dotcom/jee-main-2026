"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  Sparkles,
  BookOpen,
  Zap,
  AlertTriangle,
  Lightbulb,
  Check,
  Copy,
  Filter,
  Flame,
  ArrowRight
} from "lucide-react";
import LatexRenderer from "@/components/LatexRenderer";
import { ALL_REVISION_DATA, RevisionChapterItem } from "@/data/allFormulasRevisionData";
import { SpeechSpeaker } from "@/lib/speech";
import { playSound } from "@/lib/audio";

export default function FlashcardsPage() {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [selectedChapter, setSelectedChapter] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Stored state for mastered card IDs
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [revisionIds, setRevisionIds] = useState<string[]>([]);

  // Load saved mastery from localStorage
  useEffect(() => {
    try {
      const savedM = localStorage.getItem("jee_flashcards_mastered");
      if (savedM) setMasteredIds(JSON.parse(savedM));
      const savedR = localStorage.getItem("jee_flashcards_revision");
      if (savedR) setRevisionIds(JSON.parse(savedR));
    } catch (e) {}
  }, []);

  // Filter cards by subject and chapter
  const deck = useMemo(() => {
    return ALL_REVISION_DATA.filter((item) => {
      const matchSubj = selectedSubject === "All" || item.subject === selectedSubject;
      const matchChap = selectedChapter === "All" || item.chapter === selectedChapter;
      return matchSubj && matchChap;
    });
  }, [selectedSubject, selectedChapter]);

  // Distinct chapters for dropdown filter
  const availableChapters = useMemo(() => {
    const subset = selectedSubject === "All" 
      ? ALL_REVISION_DATA 
      : ALL_REVISION_DATA.filter(i => i.subject === selectedSubject);
    return Array.from(new Set(subset.map(i => i.chapter))).sort();
  }, [selectedSubject]);

  // Reset index when deck changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    if (speaking) {
      SpeechSpeaker.stop();
      setSpeaking(false);
    }
  }, [selectedSubject, selectedChapter]);

  const currentCard: RevisionChapterItem | undefined = deck[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      playSound("click");
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      playSound("click");
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    playSound("click");
  }, []);

  // Keyboard navigation: Space = Flip, ArrowLeft = Prev, ArrowRight = Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  // Shuffle deck
  const handleShuffle = () => {
    playSound("click");
    if (deck.length > 1) {
      const randomIdx = Math.floor(Math.random() * deck.length);
      setCurrentIndex(randomIdx);
      setIsFlipped(false);
    }
  };

  // Mark as Mastered
  const handleMarkMastered = (id: string) => {
    playSound("correct");
    if (!masteredIds.includes(id)) {
      const next = [...masteredIds, id];
      setMasteredIds(next);
      localStorage.setItem("jee_flashcards_mastered", JSON.stringify(next));
    }
    // Remove from revision if present
    if (revisionIds.includes(id)) {
      const nextR = revisionIds.filter(x => x !== id);
      setRevisionIds(nextR);
      localStorage.setItem("jee_flashcards_revision", JSON.stringify(nextR));
    }
    if (currentIndex < deck.length - 1) {
      handleNext();
    }
  };

  // Mark as Need Revision
  const handleMarkRevision = (id: string) => {
    playSound("wrong");
    if (!revisionIds.includes(id)) {
      const next = [...revisionIds, id];
      setRevisionIds(next);
      localStorage.setItem("jee_flashcards_revision", JSON.stringify(next));
    }
    // Remove from mastered if present
    if (masteredIds.includes(id)) {
      const nextM = masteredIds.filter(x => x !== id);
      setMasteredIds(nextM);
      localStorage.setItem("jee_flashcards_mastered", JSON.stringify(nextM));
    }
    if (currentIndex < deck.length - 1) {
      handleNext();
    }
  };

  // Audio speech narration
  const handleAudio = (card: RevisionChapterItem) => {
    if (speaking) {
      SpeechSpeaker.stop();
      setSpeaking(false);
    } else {
      const script = `${card.chapter}. Topic: ${card.topic}. Key formula: ${card.formula_latex}. Explanation: ${card.description}. High frequency exam trap: ${card.common_trap}. Shortcut trick: ${card.no_pen_trick}`;
      SpeechSpeaker.speak(script, () => setSpeaking(false));
      setSpeaking(true);
    }
  };

  const handleCopy = (latex: string) => {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    playSound("click");
    setTimeout(() => setCopied(false), 2000);
  };

  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;
  const isCurrentRevision = currentCard ? revisionIds.includes(currentCard.id) : false;

  const totalMasteredInDeck = deck.filter(c => masteredIds.includes(c.id)).length;
  const masteryPercentage = deck.length > 0 ? Math.round((totalMasteredInDeck / deck.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-12 z-20 backdrop-blur-md bg-slate-900/90 shadow-sm">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md">
                <RotateCw size={16} />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Flashcard Mastery Hub
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase">
                    3D Recall
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">All 60 JEE Main chapters • Active Spaced Recall</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/revision"
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700"
              >
                <span>Revision Hub</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Subject Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((subj) => (
              <button
                key={subj}
                onClick={() => {
                  setSelectedSubject(subj);
                  setSelectedChapter("All");
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

          {/* Chapter Filter Dropdown & Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-slate-400 flex-shrink-0" />
              <select
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  playSound("click");
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Chapters ({availableChapters.length} Chapters)</option>
                {availableChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Deck Progress Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Card {deck.length > 0 ? currentIndex + 1 : 0} of {deck.length}</span>
              <span className="font-semibold text-emerald-400">
                {totalMasteredInDeck} / {deck.length} Mastered ({masteryPercentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        {currentCard ? (
          <div className="space-y-4">
            {/* The 3D Flip Card */}
            <div
              onClick={handleFlip}
              className="cursor-pointer select-none relative min-h-[340px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl transition-all duration-300 hover:border-slate-700 active:scale-[0.99] flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                      currentCard.subject === "Physics"
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                        : currentCard.subject === "Chemistry"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {currentCard.subject}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[170px]">
                    {currentCard.chapter}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  {isCurrentMastered && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      Mastered
                    </span>
                  )}
                  {isCurrentRevision && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                      Review Later
                    </span>
                  )}
                  <span className="text-slate-500 font-mono">
                    #{currentIndex + 1}
                  </span>
                </div>
              </div>

              {/* Card Body (Front vs Back) */}
              <div className="my-auto py-4">
                {!isFlipped ? (
                  // FRONT OF CARD
                  <div className="space-y-4 text-center animate-in fade-in duration-200">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                      <Sparkles size={13} className="text-indigo-400" />
                      <span>{currentCard.topic}</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white leading-snug px-2">
                      What is the formula and key condition for{" "}
                      <span className="text-sky-400 underline decoration-sky-500/40 underline-offset-4">
                        {currentCard.topic}
                      </span>
                      ?
                    </h2>

                    <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-left space-y-1.5 max-w-sm mx-auto">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Lightbulb size={12} className="text-amber-400" /> Key Focus Questions:
                      </div>
                      <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                        <li>What is the standard mathematical relation?</li>
                        <li>Under what exact constraints does it hold true?</li>
                        <li>What is the most common exam trap to avoid?</li>
                      </ul>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">
                      👆 Tap card or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Space</kbd> to reveal formula & trick
                    </p>
                  </div>
                ) : (
                  // BACK OF CARD (REVEALED FORMULA & TRICK)
                  <div className="space-y-3.5 text-left animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sky-400">
                        <Zap size={14} /> Core Formula:
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(currentCard.formula_latex);
                        }}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Formula KaTeX Box */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-sky-500/30 text-center text-sky-200 text-sm overflow-x-auto shadow-inner">
                      <LatexRenderer content={`$$${currentCard.formula_latex}$$`} />
                    </div>

                    {/* Explanation */}
                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                      <LatexRenderer content={currentCard.description} />
                    </div>

                    {/* Exam Trap Alert */}
                    <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[11px] text-rose-300 space-y-0.5">
                      <div className="font-bold flex items-center gap-1 text-rose-400">
                        <AlertTriangle size={12} /> High-Frequency Exam Trap:
                      </div>
                      <p className="text-rose-200/90 leading-relaxed pl-4">
                        <LatexRenderer content={currentCard.common_trap} />
                      </p>
                    </div>

                    {/* 30-Second Mental Trick */}
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-300 space-y-0.5">
                      <div className="font-bold flex items-center gap-1 text-amber-400">
                        <Zap size={12} /> 🧠 30-Second No-Pen Trick:
                      </div>
                      <p className="text-amber-200/90 leading-relaxed pl-4">
                        <LatexRenderer content={currentCard.no_pen_trick} />
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 text-slate-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAudio(currentCard);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                    speaking
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{speaking ? "Stop Audio" : "Listen"}</span>
                </button>

                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <RotateCw size={12} className={isFlipped ? "rotate-180 transition-transform" : ""} />
                  <span>{isFlipped ? "Back View" : "Front View"}</span>
                </div>
              </div>
            </div>

            {/* Navigation & Action Bar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMarkRevision(currentCard.id)}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  isCurrentRevision
                    ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/30"
                    : "bg-slate-900 hover:bg-rose-950/30 text-rose-400 border-slate-800 hover:border-rose-800"
                }`}
              >
                <XCircle size={15} />
                <span>Need Revision</span>
              </button>

              <button
                onClick={() => handleMarkMastered(currentCard.id)}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  isCurrentMastered
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30"
                    : "bg-slate-900 hover:bg-emerald-950/30 text-emerald-400 border-slate-800 hover:border-emerald-800"
                }`}
              >
                <CheckCircle size={15} />
                <span>Mastered It</span>
              </button>
            </div>

            {/* Next / Previous & Shuffle Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                onClick={handleShuffle}
                title="Shuffle Flashcards"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
              >
                <Shuffle size={15} />
              </button>

              <button
                disabled={currentIndex === deck.length - 1}
                onClick={handleNext}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3 bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <BookOpen size={36} className="mx-auto text-slate-600" />
            <h3 className="font-bold text-white text-sm">No flashcards found</h3>
            <p className="text-xs text-slate-400">Try changing the chapter or subject filter above.</p>
            <button
              onClick={() => {
                setSelectedSubject("All");
                setSelectedChapter("All");
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
