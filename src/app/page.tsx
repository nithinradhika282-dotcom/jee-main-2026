"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LatexRenderer from "@/components/LatexRenderer";
import PracticeTimer from "@/components/PracticeTimer";
import PracticeFilterModal from "@/components/PracticeFilterModal";
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
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Compass,
  FileCheck2,
  Shuffle,
  Brain,
  Send,
  X,
  Flame,
  Target,
  Zap,
  RotateCcw,
  Volume2,
  VolumeX,
  Keyboard,
  Printer,
  SlidersHorizontal,
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

function PracticeContent() {
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // User Stats
  const [user, setUser] = useState<UserProfile | null>(null);
  const [xpToast, setXpToast] = useState<{ show: boolean; msg: string; positive: boolean }>({
    show: false,
    msg: "",
    positive: true,
  });

  // Filters State
  const [exam, setExam] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const [subject, setSubject] = useState<string>("All");
  const [chapter, setChapter] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [questionType, setQuestionType] = useState<string>("All");
  const [showUnverified, setShowUnverified] = useState<boolean>(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Search Debouncing (300ms)
  const [rawSearchInput, setRawSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(rawSearchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearchInput]);

  // Read URL search parameters on mount (e.g. from Revision page)
  useEffect(() => {
    const qChapter = searchParams.get("chapter");
    const qSubject = searchParams.get("subject");
    if (qChapter) setChapter(qChapter);
    if (qSubject) setSubject(qSubject);
  }, [searchParams]);

  // Mode Toggles
  const [noPenMode, setNoPenMode] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(true);
  const [chaptersList, setChaptersList] = useState<{ name: string; subject: string }[]>([]);

  // Active Question & Navigation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericalInput, setNumericalInput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Timer Ref (isolates 1-second ticks to prevent full-page & KaTeX re-renders)
  const secondsRef = useRef(0);
  const [timerActive, setTimerActive] = useState(true);

  // Sarthi AI Chat Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Speech TTS & Modals
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

  // Load Chapters List for Filters
  useEffect(() => {
    fetch("/api/chapters")
      .then((res) => res.json())
      .then((data) => {
        if (data.chapters) setChaptersList(data.chapters);
      })
      .catch(console.error);
  }, []);

  const resetQuestionState = useCallback(() => {
    setSelectedOption(null);
    setNumericalInput("");
    setSubmitted(false);
    setIsCorrect(null);
    setShowSolution(false);
    setBookmarked(false);
    secondsRef.current = 0;
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
    if (searchQuery) params.append("search", searchQuery);
    if (showUnverified) params.append("include_unverified", "true");
    if (shuffleMode) params.append("shuffle", "true");
    params.append("limit", "1000");
    params.append("_t", String(Date.now()));

    fetch(`/api/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const fetched = [...(data.questions || [])];
        if (shuffleMode && fetched.length > 1) {
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
  }, [exam, year, subject, chapter, difficulty, questionType, searchQuery, showUnverified, shuffleMode, resetQuestionState]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const currentQ = questions[currentIndex];
  const options: string[] = useMemo(() => {
    return currentQ?.options_json ? JSON.parse(currentQ.options_json) : [];
  }, [currentQ]);

  // Touch Swipe Handlers
  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionState();
      playSound("click");
    }
  }, [currentIndex, questions.length, resetQuestionState]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetQuestionState();
      playSound("click");
    }
  }, [currentIndex, resetQuestionState]);

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

  // Audio Speech (TTS)
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
          setChatMessages([
            {
              id: "intro",
              role: "assistant",
              message: `👋 **Namaste! I'm Sarthi, your friendly AI mentor.**\n\nNo question is silly here. I explain concepts from absolute scratch without heavy jargon.\n\nAsk me anything about **Q.${currentQ.question_number} (${currentQ.chapter})**, or tap one of the quick buttons below!`
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

  // Send message to Sarthi AI with SSE streaming
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
        time_taken_sec: secondsRef.current,
        bookmarked: bookmarked,
      }),
    }).catch(console.error);

    // Update user stats
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
        if (correct) {
          setXpToast({
            show: true,
            msg: "+20 XP! Correct! Milestone progress updated 🎯",
            positive: true,
          });
        } else {
          setXpToast({
            show: true,
            msg: "+5 XP for trying! Check the solution to master this concept.",
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
          time_taken_sec: secondsRef.current,
          bookmarked: nextVal,
        }),
      }).catch(console.error);
    }
  };

  // Count active non-default filters
  const activeFiltersCount =
    (exam !== "All" ? 1 : 0) +
    (year !== "All" ? 1 : 0) +
    (chapter !== "All" ? 1 : 0) +
    (difficulty !== "All" ? 1 : 0) +
    (questionType !== "All" ? 1 : 0) +
    (showUnverified ? 1 : 0);

  const handleResetFilters = () => {
    setExam("All");
    setYear("All");
    setSubject("All");
    setChapter("All");
    setDifficulty("All");
    setQuestionType("All");
    setShowUnverified(false);
    setRawSearchInput("");
  };

  // Keyboard Shortcuts
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
    <div className="space-y-3 pb-8">
      {/* 1. RETENTION STATS CARD (Flat, No blur or heavy gradient) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 relative">
        {xpToast.show && (
          <div
            className={`absolute inset-x-2 top-2 z-20 py-1.5 px-3 rounded-lg text-xs font-bold text-center border shadow ${
              xpToast.positive
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-amber-600 text-white border-amber-500"
            }`}
          >
            {xpToast.msg}
          </div>
        )}

        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Flame size={13} /> {user?.streak_days || 3}d Streak
            </span>
            <span className="flex items-center gap-1 font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              <Zap size={13} /> {user?.total_xp || 240} XP
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {user?.level || "Super 60 Ranker"}
          </span>
        </div>

        {/* Target 60 Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Target size={12} className="text-sky-400" /> Target: 60 Correct
            </span>
            <span className="text-sky-400 font-bold">
              {user?.total_correct || 0} / 60 ({user?.progressTo60 || 0}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(user?.progressTo60 || 0, 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. MINIMAL FILTER CONTROLS (< 3 on-screen controls) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5">
        {/* Row 1: Search + Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search keyword (e.g. Kirchhoff, Carnot)..."
              value={rawSearchInput}
              onChange={(e) => setRawSearchInput(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {rawSearchInput && (
              <button
                onClick={() => setRawSearchInput("")}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterModalOpen(true)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors ${
              activeFiltersCount > 0
                ? "bg-sky-600 text-white border-sky-500"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: Subject Chips (All / Physics / Chemistry / Mathematics) */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSubject(s);
                setChapter("All");
              }}
              className={`py-1.5 text-center font-semibold rounded-md transition-colors ${
                subject === s
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {s === "Mathematics" ? "Maths" : s}
            </button>
          ))}
        </div>

        {/* Row 3: Utility Toggles (No-Pen, Shuffle, Random Jump, Print) */}
        <div className="flex items-center justify-between gap-1.5 pt-1 text-xs">
          <button
            onClick={() => setNoPenMode(!noPenMode)}
            className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 text-[11px] border transition-colors ${
              noPenMode
                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain size={12} />
            <span>No-Pen</span>
            <span className={`text-[9px] px-1 rounded ${noPenMode ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-500"}`}>
              {noPenMode ? "ON" : "OFF"}
            </span>
          </button>

          <button
            onClick={() => setShuffleMode(!shuffleMode)}
            className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 text-[11px] border transition-colors ${
              shuffleMode
                ? "bg-sky-500/20 border-sky-500 text-sky-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shuffle size={12} />
            <span>Shuffle</span>
            <span className={`text-[9px] px-1 rounded ${shuffleMode ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-500"}`}>
              {shuffleMode ? "ON" : "OFF"}
            </span>
          </button>

          <button
            onClick={handleJumpRandom}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
            title="Jump to random question"
            aria-label="Random question"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
            title="Print practice sheet"
            aria-label="Print practice sheet"
          >
            <Printer size={13} />
          </button>
        </div>
      </div>

      {/* Filter Bottom Sheet Modal */}
      <PracticeFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        exam={exam}
        setExam={setExam}
        year={year}
        setYear={setYear}
        subject={subject}
        setSubject={setSubject}
        chapter={chapter}
        setChapter={setChapter}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        questionType={questionType}
        setQuestionType={setQuestionType}
        showUnverified={showUnverified}
        setShowUnverified={setShowUnverified}
        chaptersList={chaptersList}
        onReset={handleResetFilters}
      />

      {/* 3. MAIN QUESTION PRACTICE CARD */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-44 bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-5/6" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : !currentQ ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
          <p className="text-slate-300 font-semibold text-sm">No questions match your filter.</p>
          <p className="text-xs text-slate-500">Try selecting &quot;All Subjects&quot; or clearing search.</p>
          <button
            onClick={handleResetFilters}
            className="mt-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold inline-block"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        >
          {/* Top Bar with Tags and Timer */}
          <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {currentQ.exam_name || "JEE Main"}
              </span>

              <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                {currentQ.subject}
              </span>

              <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                {currentQ.question_type}
              </span>

              <span className="text-slate-400 text-[10px] font-mono">
                Q.{currentQ.question_number}
              </span>

              {Boolean(currentQ.needs_review) && (
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 border border-amber-500/30">
                  <AlertTriangle size={10} /> Flagged
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Question Audio Speaker */}
              <button
                onClick={handleToggleSpeakQuestion}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  speakingQ
                    ? "bg-sky-600 text-white border-sky-500"
                    : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                }`}
                title={speakingQ ? "Stop voice" : "Listen to question"}
                aria-label="Audio question narration"
              >
                {speakingQ ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              {/* Keyboard Shortcuts Guide */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors hidden sm:block"
                title="Keyboard shortcuts"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard size={13} />
              </button>

              {/* Ask Sarthi AI Tutor Button */}
              <button
                onClick={openAiChat}
                className="flex items-center gap-1 text-[11px] font-bold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 px-2 py-1 rounded-lg border border-sky-500/30 transition-colors"
                aria-label="Ask Sarthi AI"
              >
                <Sparkles size={12} className="text-sky-400" />
                <span>Ask AI</span>
              </button>

              {/* Isolated Timer Component (does not re-render question card) */}
              <PracticeTimer
                active={timerActive && !submitted}
                resetKey={currentIndex}
                onTick={(sec) => {
                  secondsRef.current = sec;
                }}
              />

              {/* Bookmark Toggle */}
              <button
                onClick={toggleBookmark}
                className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                aria-label="Bookmark question"
              >
                {bookmarked ? (
                  <BookmarkCheck size={16} className="text-amber-400" />
                ) : (
                  <Bookmark size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Chapter & Shift Subheader */}
          <div className="px-3.5 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate pr-2 font-medium text-slate-300">
              {currentQ.chapter}
              {currentQ.topic && ` • ${currentQ.topic}`}
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">
              {currentQ.exam_name || "JEE"} {currentQ.paper_year || 2026}
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

            {/* No-Pen Mental Shortcut */}
            {noPenMode && currentQ.explanation?.no_pen_trick && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Brain size={13} />
                  <span>30-Second No-Pen Mental Shortcut</span>
                </div>
                <div className="text-xs leading-relaxed text-amber-100 pl-4">
                  <LatexRenderer content={currentQ.explanation.no_pen_trick} />
                </div>
              </div>
            )}

            {/* Options List for MCQ (Min 44px tap target) */}
            {currentQ.question_type === "MCQ" && (
              <div className="space-y-2 pt-1">
                {options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOption === opt || selectedOption === letter;

                  let borderStyle = "border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-200";
                  let badgeStyle = "bg-slate-800 text-slate-400";

                  if (submitted) {
                    const letterIndexMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
                    const correctTarget = currentQ.correct_answer.trim().toLowerCase();
                    const targetIdx = letterIndexMap[correctTarget];

                    const isOfficialCorrect =
                      correctTarget === letter.toLowerCase() ||
                      correctTarget === opt.trim().toLowerCase() ||
                      (targetIdx !== undefined && idx === targetIdx);

                    if (isOfficialCorrect) {
                      borderStyle = "border-emerald-600 bg-emerald-950/40 text-emerald-200";
                      badgeStyle = "bg-emerald-600 text-white font-bold";
                    } else if (isSelected) {
                      borderStyle = "border-rose-600 bg-rose-950/40 text-rose-200";
                      badgeStyle = "bg-rose-600 text-white font-bold";
                    }
                  } else if (isSelected) {
                    borderStyle = "border-sky-500 bg-sky-950/40 text-sky-100";
                    badgeStyle = "bg-sky-600 text-white font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left p-3 min-h-[44px] rounded-xl border flex items-center gap-3 transition-colors ${borderStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 font-bold ${badgeStyle}`}>
                        {letter}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm min-w-0 overflow-x-auto leading-relaxed">
                        <LatexRenderer content={opt} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical Input Box */}
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
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors"
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

            {/* Primary Action Button (Submit Answer for MCQ) */}
            {currentQ.question_type === "MCQ" && !submitted && (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className={`w-full py-3 min-h-[44px] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
                  selectedOption
                    ? "bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                Submit & Check Answer
              </button>
            )}

            {/* Result Strip */}
            {submitted && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isCorrect
                    ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-600/40 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <XCircle size={16} className="text-rose-400" />
                  )}
                  <span className="font-semibold">
                    {isCorrect ? "Correct (+4 marks)" : "Incorrect (-1 mark)"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={openAiChat}
                    className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Ask Sarthi
                  </button>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="underline font-semibold hover:text-white"
                  >
                    {showSolution ? "Hide Solution" : "View Solution"}
                  </button>
                </div>
              </div>
            )}

            {/* Teaching Solution Section */}
            {showSolution && currentQ.explanation && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                    <Sparkles size={13} />
                    <span>Step-by-Step Solution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSpeakSolution}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 transition-colors ${
                        speakingSol
                          ? "bg-sky-600 text-white border-sky-500"
                          : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
                      }`}
                      title={speakingSol ? "Stop voice" : "Listen to full explanation"}
                    >
                      {speakingSol ? <VolumeX size={11} /> : <Volume2 size={11} />}
                      <span>{speakingSol ? "Stop" : "Listen"}</span>
                    </button>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>Official Key:</span>
                      <strong className="text-emerald-400 font-mono inline-block">
                        <LatexRenderer content={currentQ.correct_answer} />
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 1. Hint */}
                {currentQ.explanation.hint && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Lightbulb size={12} /> 1. Hint
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed pl-3">
                      <LatexRenderer content={currentQ.explanation.hint} />
                    </div>
                  </div>
                )}

                {/* 2. Approach */}
                {currentQ.explanation.approach && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                      <Compass size={12} /> 2. Approach
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed pl-3">
                      <LatexRenderer content={currentQ.explanation.approach} />
                    </div>
                  </div>
                )}

                {/* 3. Full Solution */}
                {currentQ.explanation.full_solution_latex && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <FileCheck2 size={12} /> 3. Full Derivation
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed space-y-1.5">
                      <LatexRenderer content={currentQ.explanation.full_solution_latex} />
                    </div>
                  </div>
                )}

                {/* 4. Common Mistake */}
                {currentQ.explanation.common_mistake && (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={12} /> 4. Common Mistake
                    </div>
                    <div className="text-xs text-slate-300 pl-3">
                      <LatexRenderer content={currentQ.explanation.common_mistake} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Footer (Prev / Next) */}
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg text-xs font-semibold transition-colors ${
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
              className={`flex items-center gap-1 px-4 py-2 min-h-[44px] rounded-lg text-xs font-semibold transition-colors ${
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

      {/* 4. SARTHI AI TUTOR DRAWER */}
      {aiDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 flex justify-end animate-in fade-in"
        >
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Sarthi AI Mentor</h3>
                  <p className="text-[10px] text-slate-400">Step-by-step guidance</p>
                </div>
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                aria-label="Close AI Mentor"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Starter Chips */}
            <div className="p-2 bg-slate-950/60 border-b border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <button
                onClick={() => handleSendAiMessage("Show me the Master Learning Blueprint for this concept")}
                className="px-2.5 py-1 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 whitespace-nowrap border border-sky-500/30 transition-colors font-semibold"
              >
                🗺️ Blueprint
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 1: Physical intuition from ground zero")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
              >
                🔹 Step 1: Intuition
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 2: Show me the step-by-step mathematical derivation")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
              >
                📐 Step 2: Derivation
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 3: What common trap trips up students in this chapter?")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
              >
                ⚠️ Step 3: Traps
              </button>
              <button
                onClick={() => handleSendAiMessage("Explain Step 4: Show me the 30-second no-pen mental shortcut")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700 transition-colors"
              >
                🧠 Step 4: Shortcut
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl p-3 leading-relaxed ${
                      msg.role === "user"
                        ? "bg-sky-600 text-white rounded-br-none"
                        : "bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none"
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
                  <span>Sarthi is thinking...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
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
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                aria-label="Send message"
                className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Keyboard size={16} className="text-sky-400" />
                <h3 className="font-bold text-sm text-white">Shortcuts Guide</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-xs text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span>Select Option A, B, C, D</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-sky-400 font-bold">1–4 / A–D</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span>Submit / Check Answer</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-sky-400 font-bold">Enter</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span>Next / Previous Question</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">→ / ←</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span>Toggle Hint & Solution</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">H / S</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span>Toggle No-Pen 30s Mode</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-bold">N</span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Printable Sheet Modal */}
      {showPrintModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col max-h-[90vh] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Printer size={16} className="text-sky-400" />
                <h3 className="font-bold text-sm text-white">Printable Practice Sheet</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
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

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-200">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <h2 className="font-bold text-sm text-white">ExamPrep PYQ Practice Worksheet</h2>
                <p className="text-[11px] text-slate-400">
                  {subject !== "All" ? subject : "All Subjects"} • {chapter !== "All" ? chapter : "Mixed Topics"} • {questions.slice(0, 15).length} Questions
                </p>
              </div>

              {questions.slice(0, 15).map((q, qIndex) => {
                const qOpts: string[] = q.options_json ? JSON.parse(q.options_json) : [];
                return (
                  <div key={q.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
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
                          <div key={optIdx} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] flex items-start gap-2">
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

              {/* Answer Key */}
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

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 pb-8">
          <div className="h-20 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
