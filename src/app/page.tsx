"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import { Question } from "@/lib/db";
import confetti from "canvas-confetti";
import { playSound } from "@/lib/audio";
import { SpeechSpeaker } from "@/lib/speech";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Timer,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Compass,
  FileCheck2,
  Shuffle,
  Brain,
  MessageSquare,
  Send,
  X,
  Flame,
  Award,
  Target,
  Zap,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  Keyboard,
  Printer,
  Check
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  streak_days: number;
  total_xp: number;
  level: string;
  total_correct: number;
  total_attempts: number;
  today_attempts: number;
  accuracy: number;
  progressTo60: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // User Psychology & Retention State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [xpToast, setXpToast] = useState<{ show: boolean; msg: string; positive: boolean }>({
    show: false,
    msg: "",
    positive: true,
  });

  // Filters & Modes
  const [exam, setExam] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const [subject, setSubject] = useState<string>("All");
  const [chapter, setChapter] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [questionType, setQuestionType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showUnverified, setShowUnverified] = useState<boolean>(false);
  const [noPenMode, setNoPenMode] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(true);
  const [chaptersList, setChaptersList] = useState<{ name: string; subject: string }[]>([]);

  // Navigation & Current Question
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericalInput, setNumericalInput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Timer
  const [timerActive, setTimerActive] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Sarthi AI Chat Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Audio Speech (TTS) & Shortcuts & Print State
  const [speakingQ, setSpeakingQ] = useState(false);
  const [speakingSol, setSpeakingSol] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const touchStartRef = useRef<number | null>(null);

  // Load User Stats
  const loadUserStats = useCallback(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((err) => console.error("Error loading user:", err));
  }, []);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Load Chapters List for Filter
  useEffect(() => {
    fetch("/api/chapters")
      .then((res) => res.json())
      .then((data) => {
        if (data.chapters) setChaptersList(data.chapters);
      })
      .catch((err) => console.error(err));
  }, []);

  const resetQuestionState = useCallback(() => {
    setSelectedOption(null);
    setNumericalInput("");
    setSubmitted(false);
    setIsCorrect(null);
    setShowSolution(false);
    setBookmarked(false);
    setSeconds(0);
    SpeechSpeaker.stop();
    setSpeakingQ(false);
    setSpeakingSol(false);
  }, []);

  // Fetch Questions
  const fetchQuestions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (exam !== "All") params.append("exam", exam);
    if (year !== "All") params.append("year", year);
    if (subject !== "All") params.append("subject", subject);
    if (chapter !== "All") params.append("chapter", chapter);
    if (difficulty !== "All") params.append("difficulty", difficulty.toLowerCase());
    if (questionType !== "All") params.append("question_type", questionType);
    if (searchQuery.trim()) params.append("search", searchQuery.trim());
    if (showUnverified) params.append("include_unverified", "true");
    if (shuffleMode) params.append("shuffle", "true");
    params.append("limit", "1000");
    params.append("_t", String(Date.now()));

    fetch(`/api/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const fetched = [...(data.questions || [])];
        if (shuffleMode && fetched.length > 1) {
          // Robust Fisher-Yates shuffle to guarantee a different starting question on every load
          for (let i = fetched.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fetched[i], fetched[j]] = [fetched[j], fetched[i]];
          }
        }
        setQuestions(fetched);
        setTotalCount(data.total || 0);
        setCurrentIndex(0);
        resetQuestionState();
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [exam, year, subject, chapter, difficulty, questionType, searchQuery, showUnverified, shuffleMode]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerActive && !submitted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, submitted]);

  // Scroll to bottom of AI chat
  useEffect(() => {
    if (aiDrawerOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, aiDrawerOpen]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionState();
      playSound("click");
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetQuestionState();
      playSound("click");
    }
  }, [currentIndex]);

  const handleToggleSpeakQuestion = () => {
    if (speakingQ) {
      SpeechSpeaker.stop();
      setSpeakingQ(false);
    } else if (currentQ) {
      SpeechSpeaker.stop();
      setSpeakingSol(false);
      const text = `Question ${currentQ.question_number}. In ${currentQ.subject}, chapter ${currentQ.chapter}. ${currentQ.question_text_latex}`;
      SpeechSpeaker.speak(text, () => setSpeakingQ(false));
      setSpeakingQ(true);
    }
  };

  const handleToggleSpeakSolution = () => {
    if (speakingSol) {
      SpeechSpeaker.stop();
      setSpeakingSol(false);
    } else if (currentQ?.explanation) {
      SpeechSpeaker.stop();
      setSpeakingQ(false);
      const exp = currentQ.explanation;
      const text = `Solution for question ${currentQ.question_number}. Approach: ${exp.approach || ""}. Full solution: ${exp.full_solution_latex || ""}. Common mistake: ${exp.common_mistake || ""}`;
      SpeechSpeaker.speak(text, () => setSpeakingSol(false));
      setSpeakingSol(true);
    }
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    touchStartRef.current = null;
    if (diff > 60) {
      handleNext();
    } else if (diff < -60) {
      handlePrev();
    }
  };

  const handleJumpRandom = () => {
    if (questions.length > 1) {
      let randIdx = Math.floor(Math.random() * questions.length);
      if (randIdx === currentIndex) {
        randIdx = (currentIndex + 1) % questions.length;
      }
      setCurrentIndex(randIdx);
      resetQuestionState();
    }
  };

  const currentQ = questions[currentIndex];

  // Open Sarthi AI Drawer & Load Chat History
  const openAiChat = () => {
    if (!currentQ) return;
    setAiDrawerOpen(true);
    setChatLoading(true);

    fetch(`/api/ai-chat?question_id=${currentQ.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.history && data.history.length > 0) {
          setChatMessages(data.history);
        } else {
          // Initialize welcoming greeting
          setChatMessages([
            {
              id: "intro",
              role: "assistant",
              message: `👋 **Namaste! I'm Sarthi, your friendly AI mentor.**\n\nNo question is silly here. I'm specially instructed to explain concepts from absolute scratch without heavy jargon.\n\nAsk me anything about **Q.${currentQ.question_number} (${currentQ.chapter})**, or tap one of the quick buttons below!`
            }
          ]);
        }
        setChatLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setChatLoading(false);
      });
  };

  // Send message to Sarthi AI with real-time SSE streaming
  const handleSendAiMessage = async (msgToSend?: string) => {
    const text = (msgToSend || chatInput).trim();
    if (!text || !currentQ || chatLoading) return;

    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: "user",
      message: text,
    };

    const tempAiMsgId = `ai_${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: tempAiMsgId,
      role: "assistant",
      message: "",
    };

    setChatMessages((prev) => [...prev, tempUserMsg, initialAiMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const activeKey = localStorage.getItem("gemini_api_key") || "";
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": activeKey,
        },
        body: JSON.stringify({
          question_id: currentQ.id,
          message: text,
          history: chatMessages.slice(-6),
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAiMsgId ? { ...msg, message: accumulated } : msg
                  )
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiMsgId
            ? { ...msg, message: "⚠️ Connection interrupted. Please try again." }
            : msg
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Submit Answer & Update Gamification
  const handleSubmitAnswer = () => {
    if (!currentQ || submitted) return;

    let ans = "";
    if (currentQ.question_type === "MCQ") {
      if (!selectedOption) return;
      ans = selectedOption;
    } else {
      if (!numericalInput.trim()) return;
      ans = numericalInput.trim();
    }

    const correctTarget = currentQ.correct_answer.trim().toLowerCase();
    const userAns = ans.trim().toLowerCase();

    let correct = false;
    if (currentQ.question_type === "NUMERICAL") {
      const numTarget = parseFloat(correctTarget);
      const numUser = parseFloat(userAns);
      if (!isNaN(numTarget) && !isNaN(numUser)) {
        correct = Math.abs(numTarget - numUser) < 0.05;
      } else {
        correct = userAns === correctTarget;
      }
    } else {
      // For MCQ: matches either option text, index letter (A, B, C, D), or option text at letter index
      const selectedIdx = options.findIndex((o) => o === selectedOption);
      const selectedLetter = selectedIdx >= 0 ? String.fromCharCode(65 + selectedIdx).toLowerCase() : "";
      const letterIndexMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
      const targetIdx = letterIndexMap[correctTarget];
      const targetOptionText =
        targetIdx !== undefined && options[targetIdx]
          ? options[targetIdx].trim().toLowerCase()
          : "";

      correct =
        userAns === correctTarget ||
        selectedLetter === correctTarget ||
        (targetOptionText !== "" && userAns === targetOptionText);
    }

    setIsCorrect(correct);
    setSubmitted(true);
    setShowSolution(true);

    if (correct) {
      playSound("correct");
      if ((user?.streak_days || 0) % 3 === 0 || (user?.total_correct || 0) % 10 === 0) {
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
          playSound("streak");
        } catch {}
      }
    } else {
      playSound("wrong");
    }

    // Save attempt to database
    fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: currentQ.id,
        selected_answer: ans,
        is_correct: correct,
        time_taken_sec: seconds,
        bookmarked: bookmarked,
      }),
    }).catch(console.error);

    // Update user stats & streak & XP
    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_correct: correct,
        xp_gain: 20,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        loadUserStats();
        // Trigger celebratory toast
        if (correct) {
          setXpToast({
            show: true,
            msg: "+20 XP! Correct! Milestone progress updated 🎯",
            positive: true,
          });
        } else {
          setXpToast({
            show: true,
            msg: "+5 XP for trying! Check the common mistake below to master this concept.",
            positive: false,
          });
        }
        setTimeout(() => setXpToast({ show: false, msg: "", positive: true }), 3500);
      })
      .catch(console.error);
  };

  const toggleBookmark = () => {
    const nextVal = !bookmarked;
    setBookmarked(nextVal);
    if (currentQ) {
      fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: currentQ.id,
          selected_answer: selectedOption || numericalInput || null,
          is_correct: isCorrect,
          time_taken_sec: seconds,
          bookmarked: nextVal,
        }),
      }).catch(console.error);
    }
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const options: string[] = currentQ?.options_json ? JSON.parse(currentQ.options_json) : [];

  // Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const tagName = activeEl?.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1" || e.key === "a" || e.key === "A") {
        if (options[0] && !submitted) setSelectedOption(options[0]);
      } else if (e.key === "2" || e.key === "b" || e.key === "B") {
        if (options[1] && !submitted) setSelectedOption(options[1]);
      } else if (e.key === "3" || e.key === "c" || e.key === "C") {
        if (options[2] && !submitted) setSelectedOption(options[2]);
      } else if (e.key === "4" || e.key === "d" || e.key === "D") {
        if (options[3] && !submitted) setSelectedOption(options[3]);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!submitted) {
          handleSubmitAnswer();
        } else {
          handleNext();
        }
      } else if (e.key === "h" || e.key === "H" || e.key === "s" || e.key === "S") {
        setShowSolution((prev) => !prev);
      } else if (e.key === "n" || e.key === "N") {
        setNoPenMode((prev) => !prev);
      } else if (e.key === "?") {
        setShowShortcutsModal((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitted, options, handleNext, handlePrev, handleSubmitAnswer]);

  return (
    <div className="space-y-3.5 pb-16">
      {/* 1. PSYCHOLOGY & RETENTION BANNER (Streaks, XP, Road to 60 Correct) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/50 rounded-xl p-3 shadow-lg relative overflow-hidden">
        {xpToast.show && (
          <div
            className={`absolute inset-x-2 top-2 z-20 py-1.5 px-3 rounded-lg text-xs font-bold text-center animate-bounce shadow-md ${
              xpToast.positive
                ? "bg-emerald-500 text-slate-950 border border-emerald-400"
                : "bg-amber-500 text-slate-950 border border-amber-400"
            }`}
          >
            {xpToast.msg}
          </div>
        )}

        <div className="flex items-center justify-between text-xs pb-2 border-b border-indigo-900/40">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Flame size={14} className="animate-pulse" />
              <span>{user?.streak_days || 3} Day Streak</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              <Zap size={13} />
              <span>{user?.total_xp || 240} XP</span>
            </div>
          </div>

          <div className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {user?.level || "Super 60 Ranker"}
          </div>
        </div>

        {/* Road to 60 Correct Questions (240+ Marks) Target Bar */}
        <div className="pt-2 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-200 flex items-center gap-1">
              <Target size={12} className="text-emerald-400" />
              <span>Target: 60 Correct Questions</span>
            </span>
            <span className="text-emerald-400 font-bold">
              {user?.total_correct || 0} / 60 ({user?.progressTo60 || 0}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(user?.progressTo60 || 0, 5)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Accuracy: {user?.accuracy || 0}%</span>
            <span className="text-emerald-400 font-medium">Goal: 240+ Marks (99.5+ %ile)</span>
          </div>
        </div>
      </div>

      {/* 2. MODE SWITCHES: No-Pen Mode & Shuffle Controls */}
      <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
        {/* No-Pen Mode Toggle */}
        <button
          onClick={() => setNoPenMode(!noPenMode)}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all text-xs border ${
            noPenMode
              ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/20"
              : "bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
          title="Learn questions without pen and paper via mental elimination"
        >
          <Brain size={14} className={noPenMode ? "text-amber-400" : ""} />
          <span>No-Pen Mode</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
              noPenMode ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            {noPenMode ? "ON" : "OFF"}
          </span>
        </button>

        {/* Shuffle Mode Toggle */}
        <button
          onClick={() => setShuffleMode(!shuffleMode)}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all text-xs border ${
            shuffleMode
              ? "bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm shadow-sky-500/20"
              : "bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
          title="Randomize question sequence across all years"
        >
          <Shuffle size={14} className={shuffleMode ? "text-sky-400" : ""} />
          <span>Shuffle</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
              shuffleMode ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            {shuffleMode ? "ON" : "OFF"}
          </span>
        </button>

        {/* Quick Random Jump Button */}
        <button
          onClick={handleJumpRandom}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          title="Jump to a random question"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* 3. FILTERS CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search topic or keyword (e.g. Kirchhoff, Carnot, Matrix)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={() => setShowUnverified(!showUnverified)}
            title="Toggle unverified questions"
            className={`px-2 py-1.5 text-xs rounded-lg border flex items-center gap-1 transition-colors ${
              showUnverified
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {showUnverified ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Exam</label>
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md py-1 px-1.5 text-slate-300 focus:border-sky-500 font-semibold truncate"
            >
              <option value="All">All Exams (1,005 Qs)</option>
              <option value="JEE Main">JEE Main</option>
              <option value="TS EAMCET">TS EAMCET</option>
              <option value="BITSAT">BITSAT</option>
              <option value="VITEEE">VITEEE</option>
              <option value="MathonGo JEE Main">MathonGo JEE</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md py-1 px-1.5 text-slate-300 focus:border-sky-500 font-semibold"
            >
              <option value="All">All Years (2002–2026)</option>
              <option value="2026">2026 (All Shifts)</option>
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

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setChapter("All");
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-md py-1 px-1.5 text-slate-300 focus:border-sky-500 font-semibold"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Chapter</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md py-1 px-1.5 text-slate-300 focus:border-sky-500 truncate"
            >
              <option value="All">All Chapters</option>
              {chaptersList
                .filter((c) => subject === "All" || c.subject === subject)
                .map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md py-1 px-1.5 text-slate-300 focus:border-sky-500"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy (High Accuracy)</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md py-1 px-1.5 text-slate-300 focus:border-sky-500"
            >
              <option value="All">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="NUMERICAL">Numerical</option>
            </select>
          </div>
        </div>

        {/* Counter Strip */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span>
              Database: <strong className="text-sky-400">{totalCount}</strong> questions
            </span>
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-[10px] transition-colors"
              title="Print or export current question practice sheet"
            >
              <Printer size={11} /> Print Sheet
            </button>
          </div>
          {questions.length > 0 && (
            <span>
              Question <strong className="text-white">{currentIndex + 1}</strong> of{" "}
              {questions.length}
            </span>
          )}
        </div>
      </div>

      {/* 4. MAIN QUESTION PRACTICE CARD */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 animate-pulse text-xs">
          Loading questions & LaTeX formulas...
        </div>
      ) : !currentQ ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
          <p className="text-slate-300 font-semibold text-sm">No questions match your filter.</p>
          <p className="text-xs text-slate-500">Try selecting &quot;All Subjects&quot; or clearing search.</p>
        </div>
      ) : (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden transition-all"
        >
          {/* Top Bar with Tags and Timer */}
          <div className="bg-slate-950/90 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Exam Badge */}
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                  currentQ.exam_name === "TS EAMCET"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : currentQ.exam_name === "BITSAT"
                    ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30"
                    : currentQ.exam_name === "VITEEE"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : currentQ.exam_name === "MathonGo JEE Main"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                }`}
              >
                {currentQ.exam_name || "JEE Main"}
              </span>

              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  currentQ.subject === "Physics"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : currentQ.subject === "Chemistry"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                }`}
              >
                {currentQ.subject}
              </span>

              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                {currentQ.question_type}
              </span>

              <span className="text-slate-400 text-[11px] font-mono">
                Q.{currentQ.question_number}
              </span>

              {currentQ.explanation?.verified_against_key === false && (
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 border border-amber-500/30">
                  <AlertTriangle size={11} /> Flagged
                </span>
              )}

              {Boolean(currentQ.needs_review) && (
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 border border-amber-500/30">
                  <AlertTriangle size={11} /> Needs Review
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Question Audio Speaker */}
              <button
                onClick={handleToggleSpeakQuestion}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  speakingQ
                    ? "bg-indigo-600 text-white border-indigo-500 animate-pulse"
                    : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                }`}
                title={speakingQ ? "Stop voice" : "Listen to question aloud"}
              >
                {speakingQ ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              {/* Keyboard Shortcuts Guide */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors hidden sm:block"
                title="Keyboard shortcuts (1-4, Enter, Arrows, ?, H, S)"
              >
                <Keyboard size={14} />
              </button>

              {/* Ask Sarthi AI Tutor Button */}
              <button
                onClick={openAiChat}
                className="flex items-center gap-1 text-[11px] font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 px-2 py-1 rounded-lg border border-indigo-500/40 transition-colors shadow-sm"
              >
                <Sparkles size={13} className="text-indigo-400" />
                <span>Ask AI</span>
              </button>

              {/* Timer Pill */}
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="flex items-center gap-1 text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 px-2 py-0.5 rounded border border-slate-700"
              >
                <Timer size={12} className={timerActive && !submitted ? "animate-pulse" : ""} />
                <span>{formatTime(seconds)}</span>
              </button>

              {/* Bookmark Toggle */}
              <button
                onClick={toggleBookmark}
                className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                aria-label="Bookmark question"
              >
                {bookmarked ? (
                  <BookmarkCheck size={18} className="text-amber-400" />
                ) : (
                  <Bookmark size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Chapter / Shift Subheader */}
          <div className="px-3.5 py-2 bg-slate-950/50 border-b border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate pr-2">
              <strong className="text-slate-200">{currentQ.chapter}</strong>
              {currentQ.topic && ` • ${currentQ.topic}`}
            </span>
            <span className="text-[10px] bg-slate-800/90 text-sky-300 font-semibold px-2 py-0.5 rounded whitespace-nowrap border border-slate-700">
              {currentQ.exam_name || "JEE"} {currentQ.paper_year || 2026} • {currentQ.paper_date || "Official"} (Shift {currentQ.paper_shift || 1})
            </span>
          </div>

          {/* Question Body */}
          <div className="p-4 space-y-4">
            <div className="text-sm sm:text-base leading-relaxed text-slate-100 font-sans">
              <LatexRenderer content={currentQ.question_text_latex} />
            </div>

            {/* Embedded Diagram if present */}
            {currentQ.image_url && (
              <div className="my-3 p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-center">
                <img
                  src={currentQ.image_url}
                  alt={`Diagram for Question ${currentQ.question_number}`}
                  className="max-h-56 max-w-full object-contain rounded"
                />
              </div>
            )}

            {/* 🧠 NO-PEN MODE HIGHLIGHT CARD (Solve in 30 Seconds without paper) */}
            {noPenMode && currentQ.explanation?.no_pen_trick && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-amber-200 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wide">
                  <Brain size={14} className="text-amber-400" />
                  <span>30-Second No-Pen Mental Shortcut</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 ml-auto">
                    Mental Elimination
                  </span>
                </div>
                <div className="text-xs leading-relaxed text-amber-100 pl-4">
                  <LatexRenderer content={currentQ.explanation.no_pen_trick} />
                </div>
              </div>
            )}

            {/* Needs Review Notice Banner */}
            {Boolean(currentQ.needs_review) && (
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                <span>
                  {!currentQ.image_url &&
                  (currentQ.question_text_latex.toLowerCase().includes("figure") ||
                    currentQ.question_text_latex.toLowerCase().includes("shown") ||
                    currentQ.question_text_latex.toLowerCase().includes("diagram"))
                    ? "Notice: This question references a figure/diagram that is flagged for review."
                    : "Notice: Original source options are flagged for manual review."}
                </span>
              </div>
            )}

            {/* Options List for MCQ */}
            {currentQ.question_type === "MCQ" && (
              <div className="space-y-2.5 pt-1">
                {options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = selectedOption === opt || selectedOption === letter;

                  let borderStyle = "border-slate-800 bg-slate-950/70 hover:border-slate-700";
                  let badgeStyle = "bg-slate-800 text-slate-300";

                  if (submitted) {
                    const letterIndexMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
                    const correctTarget = currentQ.correct_answer.trim().toLowerCase();
                    const targetIdx = letterIndexMap[correctTarget];

                    const isOfficialCorrect =
                      correctTarget === letter.toLowerCase() ||
                      correctTarget === opt.trim().toLowerCase() ||
                      (targetIdx !== undefined && idx === targetIdx);

                    if (isOfficialCorrect) {
                      borderStyle = "border-emerald-500/80 bg-emerald-950/40 text-emerald-200";
                      badgeStyle = "bg-emerald-500 text-slate-950 font-bold";
                    } else if (isSelected) {
                      borderStyle = "border-rose-500/80 bg-rose-950/40 text-rose-200";
                      badgeStyle = "bg-rose-500 text-white font-bold";
                    }
                  } else if (isSelected) {
                    borderStyle = "border-sky-500 bg-sky-950/40 text-sky-200";
                    badgeStyle = "bg-sky-500 text-slate-950 font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all break-words ${borderStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${badgeStyle}`}
                      >
                        {letter}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm pt-0.5 min-w-0 overflow-x-auto leading-relaxed">
                        <LatexRenderer content={opt} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical Input Box for NUMERICAL */}
            {currentQ.question_type === "NUMERICAL" && (
              <div className="pt-2 space-y-2">
                <label className="text-xs text-slate-400 block font-medium">
                  Enter your numerical answer:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 18, 0.6, 1.2"
                    disabled={submitted}
                    value={numericalInput}
                    onChange={(e) => setNumericalInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                  />
                  {!submitted && (
                    <button
                      onClick={handleSubmitAnswer}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Submit
                    </button>
                  )}
                </div>

                {submitted && (
                  <div className="text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-400">Official NTA Answer:</span>
                    <span className="text-sky-400 font-mono font-bold text-sm">
                      <LatexRenderer content={`$${currentQ.correct_answer}$`} />
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button for MCQ */}
            {currentQ.question_type === "MCQ" && !submitted && (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                  selectedOption
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                Submit & Check Answer
              </button>
            )}

            {/* Result Strip */}
            {submitted && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
                  isCorrect
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  ) : (
                    <XCircle size={18} className="text-rose-400" />
                  )}
                  <span className="font-semibold">
                    {isCorrect ? "Correct! (+4 marks • 240+ Track)" : "Incorrect (-1 mark)"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={openAiChat}
                    className="text-xs font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 underline"
                  >
                    <Sparkles size={12} /> Discuss with AI
                  </button>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="underline font-semibold hover:text-white"
                  >
                    {showSolution ? "Hide Teaching Solution" : "View Teaching Solution"}
                  </button>
                </div>
              </div>
            )}

            {/* Teaching Solution Section (Hint -> Approach -> Step-by-Step -> Concept -> Mistake) */}
            {showSolution && currentQ.explanation && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Teaching-Style Explanation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSpeakSolution}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                        speakingSol
                          ? "bg-indigo-600 text-white border-indigo-500 animate-pulse"
                          : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
                      }`}
                      title={speakingSol ? "Stop voice" : "Listen to full explanation"}
                    >
                      {speakingSol ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      <span>{speakingSol ? "Stop Voice" : "Listen"}</span>
                    </button>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>Official Key:</span>
                      <strong className="text-emerald-400 font-mono inline-block">
                        <LatexRenderer content={currentQ.correct_answer} />
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 1. Hint (no spoiler) */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Lightbulb size={13} /> 1. Hint (Think on your own first)
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed pl-4">
                    <LatexRenderer content={currentQ.explanation.hint} />
                  </div>
                </div>

                {/* 2. Approach (what to think first) */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                    <Compass size={13} /> 2. Approach (First Principles)
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed pl-4">
                    <LatexRenderer content={currentQ.explanation.approach} />
                  </div>
                </div>

                {/* 3. Full Step-by-Step Solution */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <FileCheck2 size={13} /> 3. Full Step-by-Step Solution
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed space-y-2">
                    <LatexRenderer content={currentQ.explanation.full_solution_latex} />
                  </div>
                </div>

                {/* 4. Concept Used */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    <HelpCircle size={13} /> 4. Concept Used
                  </div>
                  <div className="text-xs text-slate-300 pl-4">
                    <LatexRenderer content={currentQ.explanation.concept_used} />
                  </div>
                </div>

                {/* 5. Common Student Mistake */}
                {currentQ.explanation.common_mistake && (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={13} /> 5. Common Student Mistake
                    </div>
                    <div className="text-xs text-slate-300 pl-4">
                      <LatexRenderer content={currentQ.explanation.common_mistake} />
                    </div>
                  </div>
                )}

                {/* 6. No-Pen Mental Shortcut in Solution */}
                {currentQ.explanation.no_pen_trick && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Brain size={13} /> 6. 30-Second No-Pen Mental Shortcut
                    </div>
                    <div className="text-xs text-slate-300 pl-4">
                      <LatexRenderer content={currentQ.explanation.no_pen_trick} />
                    </div>
                  </div>
                )}

                {/* 7. Similar Concept Tip */}
                {currentQ.explanation.similar_concept_tip && (
                  <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-900/40 text-[11px] text-sky-300 flex items-start gap-2">
                    <Sparkles size={13} className="flex-shrink-0 mt-0.5 text-sky-400" />
                    <div className="flex-1">
                      <LatexRenderer content={currentQ.explanation.similar_concept_tip} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Footer (Prev / Next) */}
          <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentIndex === 0
                  ? "text-slate-600 cursor-not-allowed"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} / {questions.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentIndex >= questions.length - 1
                  ? "text-slate-600 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-500 text-white"
              }`}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 5. SARTHI AI TUTOR CHAT DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Sarthi AI Beginner Mentor
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30">
                      Online
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Explains from scratch • No question is silly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Doubt Starter Chips - 4-Step Blueprint */}
            <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <button
                onClick={() => handleSendAiMessage("Show me the Master Learning Blueprint for this concept")}
                className="px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 whitespace-nowrap border border-indigo-500/30 transition-colors flex items-center gap-1 font-bold"
              >
                🗺️ Master Plan
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 1: Physical intuition from ground zero")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-300 whitespace-nowrap border border-slate-700 transition-colors flex items-center gap-1"
              >
                🔹 Step 1: Intuition
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 2: Show me the step-by-step mathematical derivation")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 whitespace-nowrap border border-slate-700 transition-colors flex items-center gap-1"
              >
                📐 Step 2: Derivation
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 3: What common trap trips up students in this chapter?")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-300 whitespace-nowrap border border-slate-700 transition-colors flex items-center gap-1"
              >
                ⚠️ Step 3: Traps
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 4: Show me the 30-second no-pen mental shortcut")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 whitespace-nowrap border border-slate-700 transition-colors flex items-center gap-1"
              >
                🧠 Step 4: 30s Shortcut
              </button>
              <button
                onClick={() => handleSendAiMessage("Next step, please continue the explanation")}
                className="px-3 py-1 rounded-full bg-sky-600 hover:bg-sky-500 text-white whitespace-nowrap transition-colors flex items-center gap-1 font-bold shadow-sm"
              >
                ⏭️ Next Step
              </button>
            </div>

            {/* Chat Messages List */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                      msg.role === "user"
                        ? "bg-sky-600 text-white rounded-br-none"
                        : "bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <LatexRenderer content={msg.message} />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    {msg.role === "user" ? "You" : "Sarthi AI"}
                  </span>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  <span>Sarthi is thinking simply...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Sarthi anything about this question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Keyboard size={18} className="text-sky-400" />
                <h3 className="font-bold text-sm text-white">Keyboard & Touch Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-xs text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>Select Option A, B, C, D</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300 text-[11px] font-bold">1, 2, 3, 4 / A, B, C, D</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>Submit / Check Answer</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-sky-300 text-[11px] font-bold">Enter</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>Next / Previous Question</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 text-[11px] font-bold">→ / ←</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>Toggle Hint & Solution</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300 text-[11px] font-bold">H / S</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>Toggle No-Pen 30s Mode</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-300 text-[11px] font-bold">N</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>Mobile Touch Swipe</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 text-[11px] font-bold">Swipe Left / Right</span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Printable Practice Sheet Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-sky-400" />
                <h3 className="font-bold text-sm text-white">Printable Question Practice Sheet</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-xs text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Content Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-200">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <h2 className="font-bold text-sm text-white">ExamPrep PYQ Practice Worksheet</h2>
                <p className="text-[11px] text-slate-400">
                  {subject !== "All" ? subject : "All Subjects"} • {chapter !== "All" ? chapter : "Mixed Topics"} • {questions.slice(0, 15).length} Questions
                </p>
              </div>

              {questions.slice(0, 15).map((q, qIndex) => {
                const qOpts: string[] = q.options_json ? JSON.parse(q.options_json) : [];
                return (
                  <div key={q.id} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-sky-400">Question {qIndex + 1}</span>
                      <span>{q.subject} • {q.chapter}</span>
                    </div>
                    <div className="text-slate-100 font-medium leading-relaxed">
                      <LatexRenderer content={q.question_text_latex} />
                    </div>
                    {qOpts.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {qOpts.map((opt, optIdx) => (
                          <div key={optIdx} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] flex items-start gap-2">
                            <span className="font-bold text-slate-400">{String.fromCharCode(65 + optIdx)}.</span>
                            <div className="flex-1">
                              <LatexRenderer content={opt} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Answer Key Table */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-xs text-amber-400">Answer Key:</h4>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-center text-xs">
                  {questions.slice(0, 15).map((q, idx) => (
                    <div key={q.id} className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Q{idx + 1}</div>
                      <div className="font-bold text-emerald-400">{q.correct_answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}