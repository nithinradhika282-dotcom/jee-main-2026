"use client";

import React, { useEffect, useState } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import ReviseSubNav from "@/components/ReviseSubNav";
import {
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from "lucide-react";

export default function PredictedQuestionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai-generator")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4 max-w-md mx-auto pb-8">
      {/* 1. Sub-Tabs Header */}
      <ReviseSubNav />

      {/* 2. Flat Prediction Strategy Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <BrainCircuit size={16} />
            <span>AI Forecasting & High-Yield Models</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Road to 60/75
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          AI analysis of recurring frequency patterns, shifting shift distributions, and mistake history to isolate high-yield questions for upcoming exams.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-44 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Twin Model Question */}
          {data?.twinModelQuestion && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <Sparkles size={13} />
                <span>AI Generated Twin Practice Question</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Targeting recurring weak areas in <strong className="text-slate-200">{data.twinModelQuestion.chapter}</strong>:
              </p>

              <div className="text-xs sm:text-sm text-slate-100 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                <LatexRenderer content={data.twinModelQuestion.question_text_latex} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.twinModelQuestion.options.map((opt: string, i: number) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300"
                  >
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <LatexRenderer content={opt} />
                  </div>
                ))}
              </div>

              {/* Solution Accordion */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === data.twinModelQuestion.id ? null : data.twinModelQuestion.id
                  )
                }
                className="w-full min-h-[44px] py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-semibold text-sky-400 flex items-center justify-center gap-1 transition-colors border border-slate-800"
              >
                {expandedId === data.twinModelQuestion.id ? (
                  <>Hide Solution <ChevronUp size={14} /></>
                ) : (
                  <>Reveal Solution & Shortcut <ChevronDown size={14} /></>
                )}
              </button>

              {expandedId === data.twinModelQuestion.id && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                    <span>Correct Answer:</span>
                    <LatexRenderer content={data.twinModelQuestion.correct_answer} />
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    <LatexRenderer content={data.twinModelQuestion.full_solution_latex} />
                  </div>
                  {data.twinModelQuestion.no_pen_shortcut && (
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-amber-400">
                        <Zap size={12} /> 30s Mental Shortcut:
                      </div>
                      <div className="text-amber-200">
                        <LatexRenderer content={data.twinModelQuestion.no_pen_shortcut} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Highest Probability Predicted Models */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-1">
              <TrendingUp size={14} className="text-sky-400" />
              <span>Highest Probability Predicted Models</span>
            </div>

            {data?.predictedQuestions?.map((pq: any) => {
              const isExpanded = expandedId === pq.id;
              const opts = pq.options_json ? JSON.parse(pq.options_json) : [];

              return (
                <div
                  key={pq.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {pq.subject}
                      </span>
                      <span className="text-slate-400 text-[11px] font-semibold">
                        {pq.chapter}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono capitalize">
                      {pq.difficulty} Level
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    <LatexRenderer content={pq.question_text_latex} />
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
                    <Award size={13} className="flex-shrink-0 mt-0.5 text-sky-400" />
                    <span><strong>Why Predicted:</strong> {pq.prediction_reason}</span>
                  </div>

                  {opts.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {opts.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300"
                        >
                          <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <LatexRenderer content={opt} />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : pq.id)}
                    className="w-full min-h-[44px] py-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-semibold text-sky-400 flex items-center justify-center gap-1 transition-colors border border-slate-800"
                  >
                    {isExpanded ? (
                      <>Hide Solution <ChevronUp size={14} /></>
                    ) : (
                      <>View Solution <ChevronDown size={14} /></>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                        <span>Official Key:</span>
                        <LatexRenderer content={pq.correct_answer} />
                      </div>
                      <div className="text-slate-300 leading-relaxed">
                        <LatexRenderer content={pq.full_solution_latex} />
                      </div>
                      {pq.no_pen_shortcut && (
                        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-300 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-amber-400">
                            <Zap size={12} /> 30s Mental Shortcut:
                          </div>
                          <div className="text-amber-200">
                            <LatexRenderer content={pq.no_pen_shortcut} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
