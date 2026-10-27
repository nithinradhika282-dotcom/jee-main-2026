"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  Lightbulb,
  Check,
  Copy,
  Filter,
  Zap,
  AlertTriangle,
} from "lucide-react";
import LatexRenderer from "@/components/LatexRenderer";
import ReviseSubNav from "@/components/ReviseSubNav";
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
      : ALL_REVISION_DATA.filter((i) => i.subject === selectedSubject);
    return Array.from(new Set(subset.map((i) => i.chapter))).sort();
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

  const handleShuffle = useCallback(() => {
    if (deck.length > 1) {
      const randIdx = Math.floor(Math.random() * deck.length);
      setCurrentIndex(randIdx);
      setIsFlipped(false);
      playSound("click");
    }
  }, [deck.length]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  // Mark as Mastered
  const handleMarkMastered = (id: string) => {
    playSound("correct");
    if (!masteredIds.includes(id)) {
      const next = [...masteredIds, id];
      setMasteredIds(next);
      localStorage.setItem("jee_flashcards_mastered", JSON.stringify(next));
    }
    if (revisionIds.includes(id)) {
      const nextR = revisionIds.filter((x) => x !== id);
      setRevisionIds(nextR);
      localStorage.setItem("jee_flashcards_revision", JSON.stringify(nextR));
    }
    if (currentIndex < deck.length - 1) {
      handleNext();
    }
  };

  // Mark for Revision
  const handleMarkRevision = (id: string) => {
    playSound("wrong");
    if (!revisionIds.includes(id)) {
      const next = [...revisionIds, id];
      setRevisionIds(next);
      localStorage.setItem("jee_flashcards_revision", JSON.stringify(next));
    }
    if (masteredIds.includes(id)) {
      const nextM = masteredIds.filter((x) => x !== id);
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

  const totalMasteredInDeck = deck.filter((c) => masteredIds.includes(c.id)).length;
  const masteryPercentage = deck.length > 0 ? Math.round((totalMasteredInDeck / deck.length) * 100) : 0;

  return (
    <div className="space-y-4 max-w-md mx-auto pb-8">
      {/* 1. Sub-Tabs Header */}
      <ReviseSubNav />

      {/* 2. Controls & Subject Chips */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((subj) => (
            <button
              key={subj}
              onClick={() => {
                setSelectedSubject(subj);
                setSelectedChapter("All");
                playSound("click");
              }}
              className={`py-1.5 rounded-md font-semibold text-center transition-colors ${
                selectedSubject === subj
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {subj === "Mathematics" ? "Maths" : subj}
            </button>
          ))}
        </div>

        {/* Chapter Filter Dropdown & Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
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

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Card {deck.length > 0 ? currentIndex + 1 : 0} of {deck.length}</span>
            <span className="font-semibold text-emerald-400">
              {totalMasteredInDeck} / {deck.length} Mastered ({masteryPercentage}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Flashcard */}
      {currentCard ? (
        <div className="space-y-3">
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none min-h-[300px] rounded-xl bg-slate-900 border border-slate-800 p-4 transition-colors hover:border-slate-700 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 text-[10px]">
                  {currentCard.subject}
                </span>
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
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

            {/* Body */}
            <div className="my-auto py-3">
              {!isFlipped ? (
                // FRONT
                <div className="space-y-3 text-center">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold">
                    {currentCard.topic}
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
                    What is the formula and key condition for{" "}
                    <span className="text-sky-400">
                      {currentCard.topic}
                    </span>
                    ?
                  </h2>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left space-y-1 max-w-sm mx-auto">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb size={11} className="text-amber-400" /> Focus Points:
                    </div>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                      <li>Mathematical formulation</li>
                      <li>Constraint conditions</li>
                      <li>Common negative marking trap</li>
                    </ul>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium pt-1">
                    Tap card to reveal formula & trick
                  </p>
                </div>
              ) : (
                // BACK
                <div className="space-y-2.5 text-left">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sky-400">
                      <Zap size={13} /> Core Formula:
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(currentCard.formula_latex);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-center text-sky-200 text-xs overflow-x-auto">
                    <LatexRenderer content={`$$${currentCard.formula_latex}$$`} />
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <LatexRenderer content={currentCard.description} />
                  </div>

                  {currentCard.common_trap && (
                    <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[11px] text-rose-300 space-y-0.5">
                      <div className="font-bold flex items-center gap-1 text-rose-400">
                        <AlertTriangle size={11} /> Exam Trap:
                      </div>
                      <p className="text-rose-200/90 leading-relaxed pl-3">
                        <LatexRenderer content={currentCard.common_trap} />
                      </p>
                    </div>
                  )}

                  {currentCard.no_pen_trick && (
                    <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-300 space-y-0.5">
                      <div className="font-bold flex items-center gap-1 text-amber-400">
                        <Zap size={11} /> 30-Second No-Pen Trick:
                      </div>
                      <p className="text-amber-200/90 leading-relaxed pl-3">
                        <LatexRenderer content={currentCard.no_pen_trick} />
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-800 text-slate-400">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAudio(currentCard);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                  speaking
                    ? "bg-sky-600 text-white border-sky-500"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                }`}
              >
                {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{speaking ? "Stop" : "Listen"}</span>
              </button>

              <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <RotateCw size={11} className={isFlipped ? "rotate-180 transition-transform" : ""} />
                <span>{isFlipped ? "Back" : "Front"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Min 44px tap target) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleMarkRevision(currentCard.id)}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                isCurrentRevision
                  ? "bg-rose-600 text-white border-rose-500"
                  : "bg-slate-900 hover:bg-slate-800 text-rose-400 border-slate-800"
              }`}
            >
              <XCircle size={15} />
              <span>Need Revision</span>
            </button>

            <button
              onClick={() => handleMarkMastered(currentCard.id)}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                isCurrentMastered
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800"
              }`}
            >
              <CheckCircle size={15} />
              <span>Mastered It</span>
            </button>
          </div>

          {/* Prev / Shuffle / Next */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="flex-1 min-h-[44px] py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <button
              onClick={handleShuffle}
              title="Shuffle"
              aria-label="Shuffle cards"
              className="min-h-[44px] px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
            >
              <Shuffle size={15} />
            </button>

            <button
              disabled={currentIndex === deck.length - 1}
              onClick={handleNext}
              className="flex-1 min-h-[44px] py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="font-bold text-white text-sm">No flashcards found</h3>
          <p className="text-xs text-slate-400">Try changing the chapter or subject filter.</p>
        </div>
      )}
    </div>
  );
}
