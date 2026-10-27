"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Layers, BookOpen } from "lucide-react";

interface SubjectStat {
  subject: string;
  count: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
}

interface ChapterStat {
  subject: string;
  chapter: string;
  class_level: number;
  jee_weightage_notes: string | null;
  question_count: number;
  mcq_count: number;
  numerical_count: number;
}

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [chapterStats, setChapterStats] = useState<ChapterStat[]>([]);
  const [yearStats, setYearStats] = useState<{ year: number; question_count: number }[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>("All");

  useEffect(() => {
    fetch("/api/analysis")
      .then((res) => res.json())
      .then((data) => {
        setTotalQuestions(data.totalQuestions || 0);
        setSubjectStats(data.subjectStats || []);
        setChapterStats(data.chapterStats || []);
        setYearStats(data.yearStats || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredChapters = chapterStats.filter(
    (c) => activeSubject === "All" || c.subject === activeSubject
  );

  const maxQCount = Math.max(...chapterStats.map((c) => c.question_count), 1);

  return (
    <div className="space-y-4 pb-12">
      {/* Header Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm uppercase tracking-wider">
          <BarChart3 size={16} />
          <span>JEE Main 2026 Trend Analysis</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Chapter-wise question distribution across JEE Main 2026 shifts with Class 11 vs Class 12 split and high-yield topic flags.
        </p>

        {/* Subject Breakdown Cards */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-center">
          {subjectStats.map((s) => (
            <div
              key={s.subject}
              className={`p-2.5 rounded-xl border transition-all ${
                s.subject === "Physics"
                  ? "bg-blue-950/30 border-blue-800/40"
                  : s.subject === "Chemistry"
                  ? "bg-emerald-950/30 border-emerald-800/40"
                  : "bg-purple-950/30 border-purple-800/40"
              }`}
            >
              <div className="text-[11px] font-semibold text-slate-300">{s.subject}</div>
              <div className="text-base font-extrabold text-white mt-0.5">{s.count} Qs</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {s.easy_count}E • {s.medium_count}M • {s.hard_count}H
              </div>
            </div>
          ))}
        </div>

        {/* Year Distribution Row */}
        {yearStats.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] text-slate-400 mb-1.5 font-semibold">Questions by Exam Year:</div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              {yearStats.map((y) => (
                <div key={y.year} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-sky-400 font-bold">{y.year}</div>
                  <div className="text-xs font-extrabold text-white mt-0.5">{y.question_count} <span className="text-[9px] text-slate-400 font-normal">Qs</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        {["All", "Physics", "Chemistry", "Mathematics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubject(tab)}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeSubject === tab
                ? "bg-sky-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chapter Frequency List with Visual Bar Charts */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 animate-pulse text-xs">
          Calculating chapter frequencies...
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Chapter Name & Class</span>
            <span>Frequency & Weight</span>
          </div>

          {filteredChapters.map((item, idx) => {
            const percentage = Math.round((item.question_count / maxQCount) * 100);
            const isHighYield = item.question_count >= 2;

            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                      {item.chapter}
                      {isHighYield && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 flex items-center gap-0.5 font-bold">
                          <TrendingUp size={10} /> High Yield
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span className="text-sky-400">{item.subject}</span>
                      <span>•</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          item.class_level === 11
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        Class {item.class_level}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-white">
                      {item.question_count} <span className="text-[10px] text-slate-400">Qs</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.question_count * 4} Marks
                    </div>
                  </div>
                </div>

                {/* Lightweight Horizontal Bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.subject === "Physics"
                        ? "bg-blue-500"
                        : item.subject === "Chemistry"
                        ? "bg-emerald-500"
                        : "bg-purple-500"
                    }`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>

                {item.jee_weightage_notes && (
                  <p className="text-[10px] text-slate-400 leading-normal bg-slate-950/60 p-1.5 rounded border border-slate-800/40">
                    {item.jee_weightage_notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
