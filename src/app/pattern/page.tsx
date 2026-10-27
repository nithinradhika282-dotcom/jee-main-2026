"use client";

import React, { useEffect, useState } from "react";
import { PatternInfo } from "@/lib/db";
import { FileText, Clock, Award, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

export default function PatternPage() {
  const [patterns, setPatterns] = useState<PatternInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pattern")
      .then((res) => res.json())
      .then((data) => {
        if (data.patterns) {
          setPatterns(data.patterns);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm uppercase tracking-wider">
          <FileText size={16} />
          <span>JEE Main 2026 Official Exam Pattern</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Extracted directly from the official NTA JEE (Main) 2026 Information Bulletin for Paper 1 (B.E. / B.Tech).
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
              <Clock size={11} /> Duration
            </div>
            <div className="font-bold text-sky-400 mt-0.5">3 Hours</div>
            <div className="text-[10px] text-slate-500">(180 mins)</div>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
              <Award size={11} /> Total Marks
            </div>
            <div className="font-bold text-emerald-400 mt-0.5">300 Marks</div>
            <div className="text-[10px] text-slate-500">75 Questions</div>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
              <ShieldCheck size={11} /> Marking
            </div>
            <div className="font-bold text-indigo-400 mt-0.5">+4 / -1</div>
            <div className="text-[10px] text-slate-500">Both Sections</div>
          </div>
        </div>
      </div>

      {/* Pattern Table Cards */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 animate-pulse text-xs">
          Loading official pattern from database...
        </div>
      ) : (
        <div className="space-y-3">
          {patterns.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.section.includes("Physics")
                        ? "bg-blue-400"
                        : item.section.includes("Chemistry")
                        ? "bg-emerald-400"
                        : "bg-purple-400"
                    }`}
                  />
                  {item.section}
                </span>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    item.question_type === "MCQ"
                      ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  }`}
                >
                  {item.question_type}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400">Questions</div>
                  <div className="font-bold text-slate-200 mt-0.5">{item.count}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Correct</div>
                  <div className="font-bold text-emerald-400 mt-0.5">+{item.marks_correct}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Incorrect</div>
                  <div className="font-bold text-rose-400 mt-0.5">-{item.marks_negative}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Max Marks</div>
                  <div className="font-bold text-sky-400 mt-0.5">
                    {item.count * item.marks_correct}
                  </div>
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-800/50">
                  {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Official Guidelines Alert */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
        <div className="font-bold text-slate-200 flex items-center gap-1.5">
          <AlertCircle size={15} className="text-amber-400" />
          <span>Crucial NTA 2026 Rules for Students</span>
        </div>
        <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
          <li>
            <strong>Negative Marking in Section B:</strong> Incorrect answers in Section B (Numerical value questions) carry a penalty of <strong>-1 mark</strong>.
          </li>
          <li>
            <strong>Numerical Rounding:</strong> Numerical questions should be answered rounded off to the nearest integer or exact decimal as specified in the question prompt.
          </li>
          <li>
            <strong>Dropped Questions:</strong> If any question is dropped by NTA after review, full marks (+4) are credited to all candidates who appeared for that shift.
          </li>
        </ul>
      </div>
    </div>
  );
}
