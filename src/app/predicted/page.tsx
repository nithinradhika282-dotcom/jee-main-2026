"use client";

import React, { useEffect, useState } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import {
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Target,
  CheckCircle2,
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
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-800/40 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm uppercase tracking-wider">
            <BrainCircuit size={18} />
            <span>AI Question Forecasting & Patterns</span>
          </div>
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/30">
            Road to 60/75
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Our AI analyzes recurring frequency patterns, multi-year shifting distributions, and your personal mistake history to predict the highest-probability questions for your upcoming exam.
        </p>

        {/* Target 60 Milestone Banner */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
              60
            </div>
            <div>
              <div className="font-bold text-slate-100">Target: 60 Correct Questions</div>
              <div className="text-[10px] text-slate-400">Yields 240+ Marks • 99.5+ Percentile Tier</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
              <Target size={11} /> High Yield Strategy
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 animate-pulse text-xs">
          Analyzing pattern recurrences and forecast models...
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. AI Generated Twin Model Question based on Mistakes */}
          {data?.twinModelQuestion && (
            <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles size={14} />
                <span>AI Generated Twin Practice Question</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Synthesized by AI to remediate recurring weak areas in <strong>{data.twinModelQuestion.chapter}</strong>:
              </p>

              <div className="text-xs sm:text-sm text-slate-100 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                <LatexRenderer content={data.twinModelQuestion.question_text_latex} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.twinModelQuestion.options.map((opt: string, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2 text-slate-300"
                  >
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <LatexRenderer content={opt} />
                  </div>
                ))}
              </div>

              {/* Solution Accordion */}
              <div className="pt-1">
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === data.twinModelQuestion.id ? null : data.twinModelQuestion.id
                    )
                  }
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-xs font-semibold text-sky-300 flex items-center justify-center gap-1 transition-colors"
                >
                  {expandedId === data.twinModelQuestion.id ? (
                    <>Hide Model Solution <ChevronUp size={14} /></>
                  ) : (
                    <>Reveal AI Solution & Shortcut <ChevronDown size={14} /></>
                  )}
                </button>

                {expandedId === data.twinModelQuestion.id && (
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2 animate-in fade-in">
                    <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                      <span>Correct Answer:</span>
                      <LatexRenderer content={data.twinModelQuestion.correct_answer} />
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      <LatexRenderer content={data.twinModelQuestion.full_solution_latex} />
                    </div>
                    {data.twinModelQuestion.no_pen_shortcut && (
                      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-amber-400">
                          <Zap size={12} /> 🧠 30s Mental Shortcut:
                        </div>
                        <div className="text-amber-200">
                          <LatexRenderer content={data.twinModelQuestion.no_pen_shortcut} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Top Predicted Questions */}
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
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
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

                  {/* Prediction Reason Badge */}
                  <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-start gap-1.5">
                    <Award size={13} className="flex-shrink-0 mt-0.5 text-indigo-400" />
                    <span><strong>Why Predicted:</strong> {pq.prediction_reason}</span>
                  </div>

                  {/* Options */}
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

                  {/* Toggle Solution */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : pq.id)}
                    className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-semibold text-sky-400 flex items-center justify-center gap-1 transition-colors border border-slate-800"
                  >
                    {isExpanded ? (
                      <>Hide Solution <ChevronUp size={14} /></>
                    ) : (
                      <>View Detailed Solution <ChevronDown size={14} /></>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2 animate-in fade-in">
                      <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                        <span>Official Key:</span>
                        <LatexRenderer content={pq.correct_answer} />
                      </div>
                      <div className="text-slate-300 leading-relaxed">
                        <LatexRenderer content={pq.full_solution_latex} />
                      </div>
                      {pq.no_pen_shortcut && (
                        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-amber-400">
                            <Zap size={12} /> 🧠 30s Mental Shortcut:
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
