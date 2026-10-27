"use client";

import React from "react";
import { X, RotateCcw, Check, Filter } from "lucide-react";

interface PracticeFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: string;
  setExam: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  chapter: string;
  setChapter: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  questionType: string;
  setQuestionType: (v: string) => void;
  showUnverified: boolean;
  setShowUnverified: (v: boolean) => void;
  chaptersList: { name: string; subject: string }[];
  onReset: () => void;
}

export default function PracticeFilterModal({
  isOpen,
  onClose,
  exam,
  setExam,
  year,
  setYear,
  subject,
  setSubject,
  chapter,
  setChapter,
  difficulty,
  setDifficulty,
  questionType,
  setQuestionType,
  showUnverified,
  setShowUnverified,
  chaptersList,
  onReset,
}: PracticeFilterModalProps) {
  if (!isOpen) return null;

  const filteredChapters = chaptersList.filter(
    (c) => subject === "All" || c.subject === subject
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter Questions"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-sky-400" />
            <h3 className="text-sm font-bold text-white">Filter Questions</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Exam Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Exam Target</label>
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Exams (JEE, EAMCET, BITSAT, VITEEE)</option>
              <option value="JEE Main">JEE Main</option>
              <option value="TS EAMCET">TS EAMCET</option>
              <option value="BITSAT">BITSAT</option>
              <option value="VITEEE">VITEEE</option>
              <option value="MathonGo JEE Main">MathonGo JEE Main</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Paper Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Years (2002–2026)</option>
              <option value="2026">2026 (All Official Shifts)</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
              <option value="2015">2015</option>
              <option value="2008">2008</option>
            </select>
          </div>

          {/* Chapter Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300">Chapter</label>
              {subject !== "All" && (
                <span className="text-[10px] text-sky-400 font-medium">Filtered by {subject}</span>
              )}
            </div>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Chapters</option>
              {filteredChapters.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {subject === "All" ? `(${c.subject})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty & Question Type Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Question Format</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Formats</option>
                <option value="MCQ">MCQ (Single Choice)</option>
                <option value="NUMERICAL">Numerical Value</option>
              </select>
            </div>
          </div>

          {/* Unverified Questions Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-200 block">Include Flagged Questions</span>
              <span className="text-[10px] text-slate-400">Questions pending manual verification</span>
            </div>
            <button
              type="button"
              onClick={() => setShowUnverified(!showUnverified)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                showUnverified ? "bg-sky-600" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  showUnverified ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check size={14} /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
