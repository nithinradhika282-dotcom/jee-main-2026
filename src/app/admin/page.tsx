"use client";

import React, { useEffect, useState } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import {
  Settings,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function AdminReviewPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    question_text_latex: string;
    correct_answer: string;
    full_solution_latex: string;
    verified_against_key: boolean;
    confidence: string;
  }>({
    question_text_latex: "",
    correct_answer: "",
    full_solution_latex: "",
    verified_against_key: true,
    confidence: "high",
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchQuestions = () => {
    setLoading(true);
    fetch("/api/admin/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleStartEdit = (q: any) => {
    setEditingId(q.id);
    setEditForm({
      question_text_latex: q.question_text_latex,
      correct_answer: q.correct_answer,
      full_solution_latex: q.full_solution_latex || "",
      verified_against_key: Boolean(q.verified_against_key),
      confidence: q.confidence || "high",
    });
  };

  const handleSaveEdit = async (questionId: string) => {
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          ...editForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Saved successfully!");
        setEditingId(null);
        fetchQuestions();
        setTimeout(() => setSaveStatus(null), 2500);
      } else {
        setSaveStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  const flaggedCount = questions.filter((q) => !q.verified_against_key).length;
  const verifiedCount = questions.length - flaggedCount;

  return (
    <div className="space-y-4 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm uppercase tracking-wider">
            <Settings size={16} />
            <span>Review & Verification Audit</span>
          </div>

          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Admin Mode
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Verify extracted questions and solutions against the official final NTA answer key. Flagged or dropped questions can be corrected and approved here.
        </p>

        {/* Audit Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 font-semibold">
              <CheckCircle2 size={12} /> Verified Against Key
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">{verifiedCount}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <div className="text-[10px] text-amber-400 flex items-center justify-center gap-1 font-semibold">
              <ShieldAlert size={12} /> Flagged for Review
            </div>
            <div className="text-base font-extrabold text-amber-300 mt-0.5">{flaggedCount}</div>
          </div>
        </div>

        {saveStatus && (
          <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/80 text-xs text-sky-300 text-center font-medium animate-pulse">
            {saveStatus}
          </div>
        )}
      </div>

      {/* Questions Audit List */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 animate-pulse text-xs">
          Loading audit database...
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isEditing = editingId === q.id;
            const isFlagged = !q.verified_against_key;

            return (
              <div
                key={q.id}
                className={`bg-slate-900 rounded-xl p-3.5 border transition-all shadow-md space-y-3 ${
                  isFlagged
                    ? "border-amber-500/50 bg-amber-950/10"
                    : "border-slate-800"
                }`}
              >
                {/* Meta Top Bar */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        q.subject === "Physics"
                          ? "bg-blue-500/20 text-blue-300"
                          : q.subject === "Chemistry"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {q.subject}
                    </span>
                    <span className="text-slate-400 text-[11px] font-semibold">
                      Q.{q.question_number} ({q.question_type})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isFlagged ? (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle size={11} /> Unverified / Dropped
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    )}

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(q)}
                        className="p-1 text-slate-400 hover:text-sky-400 transition-colors"
                        title="Edit question text and verification"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Content View or Edit Mode */}
                {isEditing ? (
                  <div className="space-y-3 pt-1 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold">
                        Question Text (LaTeX):
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.question_text_latex}
                        onChange={(e) =>
                          setEditForm({ ...editForm, question_text_latex: e.target.value })
                        }
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:border-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-semibold">
                          Official Correct Answer:
                        </label>
                        <input
                          type="text"
                          value={editForm.correct_answer}
                          onChange={(e) =>
                            setEditForm({ ...editForm, correct_answer: e.target.value })
                          }
                          className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-semibold">
                          Confidence Level:
                        </label>
                        <select
                          value={editForm.confidence}
                          onChange={(e) =>
                            setEditForm({ ...editForm, confidence: e.target.value })
                          }
                          className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={editForm.verified_against_key}
                          onChange={(e) =>
                            setEditForm({ ...editForm, verified_against_key: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-sky-600 focus:ring-0"
                        />
                        <span>Mark as Verified Against Key</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <X size={13} /> Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(q.id)}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Save size={13} /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-200 leading-relaxed">
                      <LatexRenderer content={q.question_text_latex} />
                    </div>

                    <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div className="text-slate-400 flex items-center gap-1">
                        <span>Official Answer Key:</span>
                        <span className="text-emerald-400 font-semibold font-mono">
                          <LatexRenderer content={q.correct_answer} />
                        </span>
                      </div>
                      <span className="text-slate-500 text-[10px]">
                        Page {q.source_page || "1"}
                      </span>
                    </div>

                    {q.hint && (
                      <div className="text-[11px] text-slate-400 border-l-2 border-slate-700 pl-2">
                        <span className="text-slate-500 font-semibold">Approach summary:</span> {q.approach}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
