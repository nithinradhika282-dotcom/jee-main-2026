"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Timer,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BarChart2,
  Clock,
  ArrowRight,
  Award,
  BookOpen,
  HelpCircle,
  Grid,
  Check,
  Zap,
  Volume2,
  VolumeX
} from "lucide-react";
import confetti from "canvas-confetti";
import LatexRenderer from "@/components/LatexRenderer";
import { SpeechSpeaker } from "@/lib/speech";
import { playSound } from "@/lib/audio";

interface QuestionItem {
  id: string;
  subject: string;
  chapter: string;
  topic?: string;
  question_number?: number;
  question_type: string;
  question_text_latex: string;
  image_url?: string | null;
  options_json?: string;
  correct_answer: string;
  marks_correct: number;
  marks_negative: number;
  difficulty?: string;
  exp_id?: string;
  hint?: string;
  approach?: string;
  full_solution_latex?: string;
  concept_used?: string;
  common_mistake?: string;
  no_pen_trick?: string;
}

type QuestionStatus = "not_visited" | "not_answered" | "answered" | "marked_for_review" | "answered_and_marked";

interface UserResponse {
  selectedAnswer: string | null;
  status: QuestionStatus;
  timeSpentSec: number;
}

interface TestPreset {
  id: string;
  title: string;
  exam: string;
  questionCount: number;
  timeMinutes: number;
  marksCorrect: number;
  marksNegative: number;
  description: string;
}

const TEST_PRESETS: TestPreset[] = [
  {
    id: "jee_quick",
    title: "JEE Main 30-Q Speed Mock",
    exam: "JEE Main",
    questionCount: 30,
    timeMinutes: 60,
    marksCorrect: 4,
    marksNegative: 1,
    description: "10 Physics + 10 Chemistry + 10 Mathematics. 60 Minutes. Official +4/-1 pattern."
  },
  {
    id: "jee_full",
    title: "Full JEE Main Simulator",
    exam: "JEE Main",
    questionCount: 60,
    timeMinutes: 120,
    marksCorrect: 4,
    marksNegative: 1,
    description: "20 Physics + 20 Chemistry + 20 Mathematics. 120 Minutes real-time exam pacing."
  },
  {
    id: "bitsat_speed",
    title: "BITSAT 45-Min Speed Sprint",
    exam: "BITSAT",
    questionCount: 33,
    timeMinutes: 45,
    marksCorrect: 3,
    marksNegative: 1,
    description: "33 Questions in 45 Minutes (Calculated from official 130 Qs in 180 Mins: 45/180 × 130 = 32.5 ≈ 33 Qs). +3/-1 pattern, Max: 99 Marks."
  },
  {
    id: "bitsat_full",
    title: "Full BITSAT Exam Simulator",
    exam: "BITSAT",
    questionCount: 130,
    timeMinutes: 180,
    marksCorrect: 3,
    marksNegative: 1,
    description: "130 Questions in 180 Minutes (Full Official Pattern: 30 Phys + 30 Chem + 40 Math + 30 Eng/LR). +3/-1 pattern, Max: 390 Marks."
  },
  {
    id: "eamcet_sprint",
    title: "TS EAMCET / VITEEE Sprint",
    exam: "TS EAMCET",
    questionCount: 40,
    timeMinutes: 40,
    marksCorrect: 1,
    marksNegative: 0,
    description: "40 Questions in 40 Minutes. No negative marking (+1 for correct, 0 for wrong)."
  }
];

export default function MockTestPage() {
  const [testState, setTestState] = useState<"idle" | "in_progress" | "submitted">("idle");
  const [selectedPreset, setSelectedPreset] = useState<TestPreset>(TEST_PRESETS[0]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<{ [qId: string]: UserResponse }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<string>("All");
  const [speaking, setSpeaking] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions for selected test
  const startTest = async (preset: TestPreset) => {
    setSelectedPreset(preset);
    setLoading(true);
    try {
      // Fetch shuffled questions for the chosen exam
      let url = `/api/questions?limit=${preset.questionCount}&shuffle=true&_t=${Date.now()}`;
      if (preset.exam && preset.exam !== "All") {
        url += `&exam=${encodeURIComponent(preset.exam)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      let loaded: QuestionItem[] = [...(data.questions || [])];

      // Fallback: if fewer questions than requested are returned, fetch general questions
      if (loaded.length < preset.questionCount) {
        const fallbackRes = await fetch(`/api/questions?limit=${preset.questionCount}&shuffle=true&_t=${Date.now()}`);
        const fallbackData = await fallbackRes.json();
        loaded = [...(fallbackData.questions || [])];
      }

      // In-memory Fisher-Yates shuffle
      for (let i = loaded.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [loaded[i], loaded[j]] = [loaded[j], loaded[i]];
      }

      if (loaded.length === 0) {
        alert("Failed to load mock questions. Please try again.");
        setLoading(false);
        return;
      }

      setQuestions(loaded);

      // Initialize responses state
      const initialResp: { [qId: string]: UserResponse } = {};
      loaded.forEach((q, idx) => {
        initialResp[q.id] = {
          selectedAnswer: null,
          status: idx === 0 ? "not_answered" : "not_visited",
          timeSpentSec: 0
        };
      });
      setUserResponses(initialResp);

      setCurrentIndex(0);
      setTimeLeft(preset.timeMinutes * 60);
      setTestState("in_progress");
      setIsPaused(false);
      playSound("click");
    } catch (e) {
      alert("Error starting mock test. Check network.");
    } finally {
      setLoading(false);
    }
  };

  // Submit test and calculate score
  const handleSubmitTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowSubmitModal(false);
    setTestState("submitted");

    // Blast celebratory confetti if test attempted
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      playSound("streak");
    } catch {}
  };

  // Timer countdown
  useEffect(() => {
    if (testState === "in_progress" && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });

        // Accumulate time on current question
        if (questions[currentIndex]) {
          const currentId = questions[currentIndex].id;
          setUserResponses((prev) => ({
            ...prev,
            [currentId]: {
              ...prev[currentId],
              timeSpentSec: (prev[currentId]?.timeSpentSec || 0) + 1
            }
          }));
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState, isPaused, currentIndex, questions]);

  const currentQ = questions[currentIndex];
  const currentResp = currentQ ? userResponses[currentQ.id] : null;

  // Options parsing
  const parsedOptions = useMemo(() => {
    if (!currentQ || !currentQ.options_json) return [];
    try {
      return JSON.parse(currentQ.options_json);
    } catch {
      return [];
    }
  }, [currentQ]);

  // Handle option pick
  const handleSelectOption = (opt: string) => {
    if (!currentQ) return;
    playSound("click");
    setUserResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedAnswer: opt,
        status:
          prev[currentQ.id].status === "marked_for_review" ||
          prev[currentQ.id].status === "answered_and_marked"
            ? "answered_and_marked"
            : "answered"
      }
    }));
  };

  // Clear answer
  const handleClearResponse = () => {
    if (!currentQ) return;
    playSound("click");
    setUserResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedAnswer: null,
        status: "not_answered"
      }
    }));
  };

  // Mark for review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQ) return;
    playSound("click");
    const hasAnswer = Boolean(userResponses[currentQ.id]?.selectedAnswer);
    setUserResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        status: hasAnswer ? "answered_and_marked" : "marked_for_review"
      }
    }));
    goToNextQuestion();
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (!currentQ) return;
    playSound("click");
    const hasAnswer = Boolean(userResponses[currentQ.id]?.selectedAnswer);
    setUserResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        status: hasAnswer ? "answered" : "not_answered"
      }
    }));
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextQ = questions[nextIdx];
      // If next question was not visited, update to not_answered
      setUserResponses((prev) => {
        if (prev[nextQ.id]?.status === "not_visited") {
          return {
            ...prev,
            [nextQ.id]: { ...prev[nextQ.id], status: "not_answered" }
          };
        }
        return prev;
      });
      setCurrentIndex(nextIdx);
    }
  };

  const goToPrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const jumpToQuestion = (idx: number) => {
    const targetQ = questions[idx];
    setUserResponses((prev) => {
      if (prev[targetQ.id]?.status === "not_visited") {
        return {
          ...prev,
          [targetQ.id]: { ...prev[targetQ.id], status: "not_answered" }
        };
      }
      return prev;
    });
    setCurrentIndex(idx);
    setShowPalette(false);
  };

  // Compute test metrics
  const scoreReport = useMemo(() => {
    if (testState !== "submitted") return null;

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalMarks = 0;
    const maxMarks = questions.length * selectedPreset.marksCorrect;

    const subjectStats: {
      [sub: string]: { correct: number; incorrect: number; unattempted: number; score: number };
    } = {};

    questions.forEach((q) => {
      const resp = userResponses[q.id];
      const sub = q.subject || "General";
      if (!subjectStats[sub]) {
        subjectStats[sub] = { correct: 0, incorrect: 0, unattempted: 0, score: 0 };
      }

      if (!resp || !resp.selectedAnswer) {
        unattemptedCount++;
        subjectStats[sub].unattempted++;
      } else {
        const isCorrect =
          String(resp.selectedAnswer).trim().toLowerCase() ===
          String(q.correct_answer).trim().toLowerCase();

        if (isCorrect) {
          correctCount++;
          totalMarks += selectedPreset.marksCorrect;
          subjectStats[sub].correct++;
          subjectStats[sub].score += selectedPreset.marksCorrect;
        } else {
          incorrectCount++;
          totalMarks -= selectedPreset.marksNegative;
          subjectStats[sub].incorrect++;
          subjectStats[sub].score -= selectedPreset.marksNegative;
        }
      }
    });

    const attempted = correctCount + incorrectCount;
    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

    // Percentile estimation based on score percentage
    const scoreFraction = Math.max(0, totalMarks / maxMarks);
    let estimatedPercentile = 50;
    if (scoreFraction >= 0.85) estimatedPercentile = 99.8;
    else if (scoreFraction >= 0.70) estimatedPercentile = 99.1;
    else if (scoreFraction >= 0.55) estimatedPercentile = 97.5;
    else if (scoreFraction >= 0.40) estimatedPercentile = 94.2;
    else if (scoreFraction >= 0.25) estimatedPercentile = 86.0;
    else if (scoreFraction >= 0.15) estimatedPercentile = 72.0;
    else estimatedPercentile = Math.max(10, Math.round(scoreFraction * 400));

    return {
      correctCount,
      incorrectCount,
      unattemptedCount,
      totalMarks,
      maxMarks,
      accuracy,
      estimatedPercentile,
      subjectStats
    };
  }, [testState, questions, userResponses, selectedPreset]);

  // Format seconds to MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Question speech trigger
  const handleToggleSpeech = () => {
    if (speaking) {
      SpeechSpeaker.stop();
      setSpeaking(false);
    } else if (currentQ) {
      const script = `Question ${currentIndex + 1}. In ${currentQ.subject}, chapter ${currentQ.chapter}. ${currentQ.question_text_latex}`;
      SpeechSpeaker.speak(script, () => setSpeaking(false));
      setSpeaking(true);
    }
  };

  // ================= 1. IDLE SELECTION VIEW =================
  if (testState === "idle") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-6">
          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Timer size={13} /> Official Exam Engine
            </div>
            <h1 className="text-xl font-black text-white">Full-Length Timed Mock Tests</h1>
            <p className="text-xs text-slate-400">
              Simulate actual JEE Main, BITSAT, TS EAMCET & VITEEE time pressure. Real +4/-1 scoring, NTA question palette, and instant percentile analytics.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" /> Select Test Format:
          </h2>

          <div className="space-y-3">
            {TEST_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    playSound("click");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-slate-900 border-sky-500 ring-1 ring-sky-500/50 shadow-lg shadow-sky-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          {preset.exam}
                        </span>
                        <span className="text-xs font-bold text-white">{preset.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{preset.description}</p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "border-sky-500 bg-sky-500 text-white" : "border-slate-700"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock size={12} className="text-amber-400" /> {preset.timeMinutes} mins
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <HelpCircle size={12} className="text-indigo-400" /> {preset.questionCount} Questions
                    </span>
                    <span className="font-bold text-emerald-400">
                      +{preset.marksCorrect} / -{preset.marksNegative}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Instructions Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Rules & Exam Strategy:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>Each correct answer earns <strong className="text-emerald-400">+{selectedPreset.marksCorrect} marks</strong>.</li>
              <li>Incorrect answers deduct <strong className="text-rose-400">-{selectedPreset.marksNegative} marks</strong>.</li>
              <li>Use the question palette to quickly jump and flag questions for review.</li>
              <li>KaTeX formulas render instantly without delay on mobile.</li>
            </ul>
          </div>

          {/* Start Test CTA */}
          <button
            onClick={() => startTest(selectedPreset)}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Preparing Mock Test...
              </span>
            ) : (
              <>
                <Play size={16} fill="white" /> Start {selectedPreset.title}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ================= 2. ACTIVE TEST IN-PROGRESS VIEW =================
  if (testState === "in_progress") {
    const currentStatus = currentResp?.status || "not_visited";
    const answeredCount = Object.values(userResponses).filter((r) => r.status === "answered" || r.status === "answered_and_marked").length;
    const markedCount = Object.values(userResponses).filter((r) => r.status === "marked_for_review" || r.status === "answered_and_marked").length;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        {/* Sticky Exam Top Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2.5 sticky top-0 z-30 shadow-md">
          <div className="max-w-md mx-auto flex items-center justify-between">
            {/* Question Counter & Palette Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPalette(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
                title="Open question palette"
              >
                <Grid size={15} />
                <span>
                  Q {currentIndex + 1}/{questions.length}
                </span>
              </button>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Ans: <span className="text-emerald-400 font-bold">{answeredCount}</span>
              </div>
            </div>

            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${
                timeLeft < 300
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-slate-800/90 text-amber-300 border-amber-500/30"
              }`}
            >
              <Timer size={14} className={timeLeft < 300 ? "text-rose-400" : "text-amber-400"} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Question Palette Drawer Modal */}
        {showPalette && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Grid size={16} className="text-sky-400" /> Question Palette
                </h3>
                <button
                  onClick={() => setShowPalette(false)}
                  className="text-xs text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Answered ({answeredCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-500" /> Marked for Review ({markedCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500" /> Not Answered
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-700" /> Not Visited
                </div>
              </div>

              {/* Grid of Question Numbers */}
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
                {questions.map((q, idx) => {
                  const status = userResponses[q.id]?.status || "not_visited";
                  let bg = "bg-slate-800 text-slate-300 border-slate-700";
                  if (status === "answered") bg = "bg-emerald-600 text-white border-emerald-500 font-bold";
                  else if (status === "marked_for_review") bg = "bg-purple-600 text-white border-purple-500 font-bold";
                  else if (status === "answered_and_marked") bg = "bg-purple-600 text-emerald-300 border-emerald-400 font-bold ring-1 ring-emerald-400";
                  else if (status === "not_answered") bg = "bg-rose-600 text-white border-rose-500";

                  if (idx === currentIndex) {
                    bg += " ring-2 ring-sky-400 shadow-md";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(idx)}
                      className={`h-9 rounded-lg border text-xs flex items-center justify-center transition-transform active:scale-95 ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowPalette(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close Palette
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle size={22} />
                <h3 className="font-bold text-base text-white">Submit Test?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You still have <strong className="text-amber-400">{formatTime(timeLeft)}</strong> left.
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Total Questions:</span>
                  <span className="font-bold text-white">{questions.length}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Answered:</span>
                  <span className="font-bold">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Marked for Review:</span>
                  <span className="font-bold">{markedCount}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Unanswered:</span>
                  <span className="font-bold">{questions.length - answeredCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Resume Test
                </button>
                <button
                  onClick={handleSubmitTest}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                >
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Question Content */}
        <div className="max-w-md mx-auto w-full px-4 py-4 space-y-4 flex-1">
          {currentQ ? (
            <div className="space-y-4">
              {/* Question Header & Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {currentQ.subject}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {currentQ.chapter}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    +{selectedPreset.marksCorrect} / -{selectedPreset.marksNegative}
                  </span>
                </div>

                {/* Voice Speaker Button */}
                <button
                  onClick={handleToggleSpeech}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    speaking
                      ? "bg-indigo-600 text-white border-indigo-500 animate-pulse"
                      : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                  }`}
                  title="Listen to question"
                >
                  {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              {/* Question Text */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 leading-relaxed shadow-sm space-y-3">
                <div className="font-medium">
                  <LatexRenderer latex={currentQ.question_text_latex} />
                </div>

                {/* Diagram / Image if present */}
                {currentQ.image_url && (
                  <div className="my-2 p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
                    <img
                      src={currentQ.image_url}
                      alt="Question Diagram"
                      className="max-h-48 rounded object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Options Selection (MCQ) */}
              <div className="space-y-2">
                {parsedOptions.map((opt: string, idx: number) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = currentResp?.selectedAnswer === letter;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(letter)}
                      className={`p-3 min-h-[44px] rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "bg-sky-500/15 border-sky-500 text-white ring-1 ring-sky-500/50"
                          : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-200"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border mt-0.5 ${
                          isSelected
                            ? "bg-sky-500 border-sky-400 text-white"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}
                      >
                        {letter}
                      </div>
                      <div className="text-xs pt-0.5 flex-1 leading-snug">
                        <LatexRenderer latex={opt} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Loading question...</div>
          )}
        </div>

        {/* Bottom Exam Action Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-3 sticky bottom-0 z-30 shadow-lg">
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearResponse}
                disabled={!currentResp?.selectedAnswer}
                className="px-3 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleMarkForReviewAndNext}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors"
              >
                Review & Next
              </button>
              <button
                onClick={handleSaveAndNext}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
              >
                Save & Next
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <button
                onClick={goToPrevQuestion}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={goToNextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 hover:text-white disabled:opacity-30"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. SUBMITTED SCORECARD & ANALYTICAL REPORT =================
  if (testState === "submitted" && scoreReport) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        {/* Report Top Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-6">
          <div className="max-w-md mx-auto space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Award size={14} className="text-emerald-400" /> Exam Finished Successfully
            </div>
            <h1 className="text-2xl font-black text-white">{selectedPreset.title} Scorecard</h1>
            <p className="text-xs text-slate-400">
              Complete diagnostic performance report with verified step-by-step solutions & KaTeX math.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-5 space-y-4">
          {/* Main Score & Percentile Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4 text-center">
            <div className="space-y-1">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Score</div>
              <div className="text-4xl font-black text-white flex items-center justify-center gap-1">
                <span className="text-sky-400">{scoreReport.totalMarks}</span>
                <span className="text-base text-slate-500 font-normal">/ {scoreReport.maxMarks}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Est. Percentile</div>
                <div className="text-lg font-black text-amber-300">{scoreReport.estimatedPercentile}%ile</div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</div>
                <div className="text-lg font-black text-emerald-400">{scoreReport.accuracy}%</div>
              </div>
            </div>

            {/* Quick breakdown pills */}
            <div className="flex items-center justify-around text-xs pt-1 text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>{scoreReport.correctCount} Correct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={14} className="text-rose-400" />
                <span>{scoreReport.incorrectCount} Wrong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle size={14} className="text-slate-400" />
                <span>{scoreReport.unattemptedCount} Skipped</span>
              </div>
            </div>
          </div>

          {/* Subject Breakdown Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-sky-400" /> Subject-wise Breakdown
            </h3>
            <div className="space-y-2">
              {Object.entries(scoreReport.subjectStats).map(([sub, stats]) => (
                <div key={sub} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{sub}</div>
                    <div className="text-[10px] text-slate-400">
                      {stats.correct} Correct • {stats.incorrect} Wrong • {stats.unattempted} Skipped
                    </div>
                  </div>
                  <div className="font-black text-sky-400 text-sm">
                    {stats.score} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retake & Practice Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTestState("idle")}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} /> Retake Test
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-colors"
            >
              Practice Mode <ArrowRight size={14} />
            </Link>
          </div>

          {/* Detailed Question Review Section */}
          <div className="pt-3 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <BookOpen size={16} className="text-amber-400" /> Detailed Solutions & Explanations:
            </h3>

            {questions.map((q, idx) => {
              const resp = userResponses[q.id];
              const selected = resp?.selectedAnswer;
              const isCorrect =
                selected &&
                String(selected).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
              const isUnattempted = !selected;

              let cardBorder = "border-slate-800";
              let badge = (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                  Unattempted
                </span>
              );

              if (!isUnattempted) {
                if (isCorrect) {
                  cardBorder = "border-emerald-500/40";
                  badge = (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Correct (+{selectedPreset.marksCorrect})
                    </span>
                  );
                } else {
                  cardBorder = "border-rose-500/40";
                  badge = (
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-bold flex items-center gap-1">
                      <XCircle size={11} /> Incorrect (-{selectedPreset.marksNegative})
                    </span>
                  );
                }
              }

              return (
                <div
                  key={q.id}
                  className={`bg-slate-900/90 border ${cardBorder} rounded-2xl p-4 space-y-3 shadow-sm`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-300">Question {idx + 1}</span>
                    {badge}
                  </div>

                  {/* Question Text */}
                  <div className="text-xs text-slate-200">
                    <LatexRenderer latex={currentQ ? q.question_text_latex : ""} />
                  </div>

                  {/* Student Answer vs Official Key */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Your Answer: </span>
                      <strong className={isCorrect ? "text-emerald-400" : isUnattempted ? "text-slate-400" : "text-rose-400"}>
                        {selected ? `Option ${selected}` : "None"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Correct Key: </span>
                      <strong className="text-emerald-400">Option {q.correct_answer}</strong>
                    </div>
                  </div>

                  {/* Step by step solution */}
                  {q.full_solution_latex && (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                        Step-by-Step Solution:
                      </div>
                      <LatexRenderer latex={q.full_solution_latex} />
                    </div>
                  )}

                  {/* 30s shortcut if present */}
                  {q.no_pen_trick && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                      <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 text-[10px] uppercase block">
                          30-Second Mental Shortcut:
                        </strong>
                        <LatexRenderer latex={q.no_pen_trick} />
                      </div>
                    </div>
                  )}

                  {/* Ask Sarthi AI Link */}
                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/ai-tutor?question_id=${q.id}`}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      <Sparkles size={12} /> Discuss this concept with AI Tutor <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
