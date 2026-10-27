"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Shuffle,
  Send,
  Brain,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ExternalLink,
  RotateCcw,
  Bot,
  Zap
} from "lucide-react";
import LatexRenderer from "@/components/LatexRenderer";
import { Question } from "@/lib/db";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
}

export default function AiTutorPage() {
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [loadingQ, setLoadingQ] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [showQuestionCard, setShowQuestionCard] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [activeEngine, setActiveEngine] = useState("Groq ⚡ (15ms Ultra-Fast)");

  // Detect active AI engine from server
  useEffect(() => {
    fetch("/api/gemini-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeEngine) {
          setActiveEngine(data.activeEngine);
        }
      })
      .catch(() => {});
  }, []);

  // Load question and restore chat history (Persistence on refresh)
  const loadQuestionAndChatHistory = useCallback(
    async (targetQid?: string, subj = selectedSubject) => {
      setLoadingQ(true);
      try {
        let qidToFetch = targetQid;

        // On refresh or first load, check URL params or localStorage
        if (!qidToFetch && typeof window !== "undefined") {
          const urlParam = new URLSearchParams(window.location.search).get("question_id");
          const savedParam = localStorage.getItem("sarthi_active_qid");
          qidToFetch = urlParam || savedParam || undefined;
        }

        let q: Question | null = null;

        // If an ID exists, fetch that specific question
        if (qidToFetch) {
          const res = await fetch(`/api/questions?id=${encodeURIComponent(qidToFetch)}&limit=1`);
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            q = data.questions[0];
          }
        }

        // If question not found or none specified, pick a random question
        if (!q) {
          const params = new URLSearchParams();
          if (subj !== "All") params.append("subject", subj);
          params.append("shuffle", "true");
          params.append("limit", "1");

          const res = await fetch(`/api/questions?${params.toString()}`);
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            q = data.questions[0];
          }
        }

        if (q) {
          setCurrentQ(q);
          if (typeof window !== "undefined") {
            localStorage.setItem("sarthi_active_qid", q.id);
          }

          // Fetch persisted chat history from database
          const historyRes = await fetch(`/api/ai-chat?question_id=${q.id}`);
          const historyData = await historyRes.json();

          if (historyData.history && historyData.history.length > 0) {
            setMessages(historyData.history);
          } else {
            // If no previous chat, show welcoming 4-Step Blueprint
            startInitialAiDiscussion(q);
          }
        }
      } catch (err) {
        console.error("Error loading question & chat history:", err);
      } finally {
        setLoadingQ(false);
      }
    },
    [selectedSubject]
  );

  useEffect(() => {
    loadQuestionAndChatHistory();
  }, [loadQuestionAndChatHistory]);

  // Handle picking a new random question
  const handleShuffleNewQuestion = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sarthi_active_qid");
      window.history.replaceState(null, "", window.location.pathname);
    }
    loadQuestionAndChatHistory(undefined, selectedSubject);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Initial AI concept introduction with token-safe blueprint
  const startInitialAiDiscussion = (q: Question) => {
    const introMsg: ChatMessage = {
      id: `intro_${Date.now()}`,
      role: "assistant",
      message: `👋 **Namaste! I'm Sarthi AI, your personal JEE concept mentor.**\n\nI'm teaching you **${q.subject}** (Chapter: **${q.chapter}**).\n\nBecause of token limits and to make sure you never get overwhelmed with a wall of text, we will learn in **4 bite-sized, logical steps**:\n\n* 🔹 **Step 1:** Ground-Zero Physical/Chemical Intuition (Zero jargon)\n* 📐 **Step 2:** Mathematical Formulation & Step-by-Step Derivation\n* ⚠️ **Step 3:** High-Frequency Exam Trap (Where 70% lose negative marks)\n* 🧠 **Step 4:** 30-Second No-Pen Mental Shortcut\n\nTap **"🗺️ Master Blueprint"** or **"🔹 Step 1: Intuition"** below to begin, or ask any doubt! 🚀`,
    };
    setMessages([introMsg]);
  };

  // Send message and stream line-by-line
  const handleSendMessage = async (msgToSend?: string) => {
    const text = (msgToSend || input).trim();
    if (!text || !currentQ || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      message: text,
    };

    const tempAiMsgId = `ai_${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: tempAiMsgId,
      role: "assistant",
      message: "",
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: currentQ.id,
          message: text,
          history: messages.slice(-6),
        }),
      });

      if (!res.body) {
        throw new Error("No response body received from server");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
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
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAiMsgId ? { ...msg, message: accumulated } : msg
                  )
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      console.error("Streaming error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiMsgId
            ? { ...msg, message: `⚠️ An error occurred while streaming response: ${err.message}` }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };


  let optionsList: string[] = [];
  if (currentQ?.options_json) {
    try {
      optionsList = JSON.parse(currentQ.options_json);
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. TOP HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-12 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold flex items-center gap-1.5 text-white">
                Sarthi AI Concept Tutor
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Zap size={11} className="text-emerald-400" /> {activeEngine}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Token-controlled 4-step learning plan • Chat restored on refresh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pick Random Question Button */}
            <button
              onClick={handleShuffleNewQuestion}
              disabled={loadingQ}
              className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Shuffle size={13} className={loadingQ ? "animate-spin" : ""} />
              <span>New Question</span>
            </button>
          </div>
        </div>

        {/* Subject Filter Chips */}
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 pt-2 text-xs overflow-x-auto">
          <span className="text-[11px] text-slate-400 mr-1">Subject:</span>
          {["All", "Physics", "Chemistry", "Mathematics"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSelectedSubject(s);
                handleShuffleNewQuestion();
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                selectedSubject === s
                  ? "bg-sky-500 border-sky-400 text-white shadow-sm shadow-sky-500/30"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN SPLIT INTERFACE */}
      <div className="max-w-4xl mx-auto w-full p-3 sm:p-4 flex-1 flex flex-col md:flex-row gap-4">
        {/* LEFT: Current Question Card */}
        <div className="md:w-5/12 flex flex-col gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            {/* Header with Accordion toggle */}
            <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-400">
                  {currentQ?.subject || "Physics"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Q.{currentQ?.question_number || 1}
                </span>
              </div>
              <button
                onClick={() => setShowQuestionCard(!showQuestionCard)}
                className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
              >
                <span>{showQuestionCard ? "Collapse" : "Expand"}</span>
                {showQuestionCard ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Chapter Details Subheader */}
            <div className="px-3.5 py-1.5 bg-slate-950/40 border-b border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-semibold text-slate-200 truncate">
                {currentQ?.chapter || "Loading Chapter..."}
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                {currentQ?.difficulty || "Medium"}
              </span>
            </div>

            {/* Question Body */}
            {showQuestionCard && (
              <div className="p-3.5 space-y-3 text-xs sm:text-sm">
                {loadingQ ? (
                  <div className="py-8 text-center text-slate-500 animate-pulse text-xs">
                    Loading question & conversation...
                  </div>
                ) : currentQ ? (
                  <>
                    <div className="text-slate-100 leading-relaxed font-sans">
                      <LatexRenderer content={currentQ.question_text_latex} />
                    </div>

                    {/* Diagram if available */}
                    {currentQ.image_url && (
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-center">
                        <img
                          src={currentQ.image_url}
                          alt="Diagram for this question"
                          className="max-h-44 object-contain rounded"
                        />
                      </div>
                    )}

                    {/* Options Preview */}
                    {currentQ.question_type === "MCQ" && optionsList.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {optionsList.map((opt, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start gap-2 text-xs"
                          >
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <div className="flex-1 overflow-x-auto text-slate-200">
                              <LatexRenderer content={opt} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer Key & Concept pill */}
                    <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-between text-[11px] text-indigo-300">
                      <span className="flex items-center gap-1">
                        <span>Official Key:</span>
                        <strong className="text-white inline-block">
                          <LatexRenderer content={currentQ.correct_answer} />
                        </strong>
                      </span>
                      <span className="text-slate-400">Type: {currentQ.question_type}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 py-4 text-center">No question selected.</div>
                )}
              </div>
            )}
          </div>

          {/* Quick Tip Card */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-sky-400">
              <Lightbulb size={14} />
              <span>Token-Safe Learning Plan</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Sarthi AI breaks explanations into a 4-step blueprint so you never hit token cutoffs or get overwhelmed. Use the <strong>Next Step</strong> button to progress step-by-step!
            </p>
          </div>
        </div>

        {/* RIGHT / MAIN: Interactive ChatGPT-Style Chat Window */}
        <div className="md:w-7/12 flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl min-h-[500px]">
          {/* Chat Window Header */}
          <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400 animate-pulse" />
              <span className="font-bold text-slate-200">Live Concept Discussion</span>
              <span className="text-[10px] text-slate-500 font-mono">({messages.length} messages)</span>
            </div>
            {isStreaming && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Streaming response...
              </span>
            )}
          </div>

          {/* Chat Messages Container */}
          <div
            ref={chatScrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[520px] text-xs sm:text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white rounded-tr-none font-medium"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  <LatexRenderer content={msg.message} />
                </div>
              </div>
            ))}

            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
                <Sparkles size={13} className="animate-spin text-indigo-400" />
                <span>Sarthi AI is formulating concept breakdown...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips for Token-Safe Step-by-Step Learning */}
          <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSendMessage("Show me the Master Learning Blueprint for this concept")}
              disabled={isStreaming}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors disabled:opacity-50 font-bold"
            >
              🗺️ Master Blueprint
            </button>
            <button
              onClick={() => handleSendMessage("Explain Step 1: Physical intuition from ground zero")}
              disabled={isStreaming}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              🔹 Step 1: Intuition
            </button>
            <button
              onClick={() => handleSendMessage("Explain Step 2: Show me the step-by-step mathematical derivation")}
              disabled={isStreaming}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              📐 Step 2: Derivation
            </button>
            <button
              onClick={() => handleSendMessage("Explain Step 3: What common trap trips up students in this chapter?")}
              disabled={isStreaming}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              ⚠️ Step 3: Exam Traps
            </button>
            <button
              onClick={() => handleSendMessage("Explain Step 4: Show me the 30-second no-pen mental shortcut")}
              disabled={isStreaming}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              🧠 Step 4: 30s Shortcut
            </button>
            <button
              onClick={() => handleSendMessage("Next step, please continue the explanation")}
              disabled={isStreaming}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors disabled:opacity-50 shadow-sm"
            >
              ⏭️ Next Step
            </button>
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Sarthi anything about this concept or reply 'Next'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
