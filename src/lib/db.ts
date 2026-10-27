import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

let dbInstance: DatabaseSync | null = null;

function resolveDbPath(): string {
  const localDbPath = path.join(process.cwd(), "prisma", "dev.db");

  // In serverless environments (Vercel, AWS Lambda, Netlify), the root filesystem is read-only.
  // We copy the bundled SQLite database to /tmp/dev.db to allow both reads and writes seamlessly.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(localDbPath)) {
        fs.copyFileSync(localDbPath, tmpDbPath);
      }
    }
    return tmpDbPath;
  }

  return localDbPath;
}

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const targetPath = resolveDbPath();
    dbInstance = new DatabaseSync(targetPath);
    // Ensure foreign keys are enabled
    dbInstance.exec("PRAGMA foreign_keys = ON;");
  }
  return dbInstance;
}

export interface Paper {
  id: string;
  year: number;
  session: number;
  exam_date: string;
  shift: number;
  source_url: string;
  total_marks: number;
}

export interface Question {
  id: string;
  paper_id: string;
  subject: string;
  chapter: string;
  topic: string | null;
  question_number: number;
  question_type: "MCQ" | "NUMERICAL";
  question_text_latex: string;
  image_url: string | null;
  options_json: string | null;
  correct_answer: string;
  marks_correct: number;
  marks_negative: number;
  difficulty: "easy" | "medium" | "hard";
  source_page: number | null;
  needs_review?: boolean | number;
  exam_name?: string;
  paper_year?: number;
  paper_date?: string;
  paper_shift?: number;
  paper_session?: number;
  source_url?: string;
  explanation?: Explanation;
}

export interface Explanation {
  id: string;
  question_id: string;
  hint: string;
  approach: string;
  full_solution_latex: string;
  concept_used: string;
  common_mistake: string | null;
  similar_concept_tip: string | null;
  verified_against_key: boolean | number;
  confidence: "low" | "medium" | "high";
  no_pen_trick?: string | null;
  similar_model_question?: string | null;
}

export interface Chapter {
  id: string;
  subject: string;
  name: string;
  class_level: 11 | 12;
  jee_weightage_notes: string | null;
}

export interface PatternInfo {
  id: string;
  year: number;
  section: string;
  question_type: string;
  count: number;
  marks_correct: number;
  marks_negative: number;
  duration_minutes: number;
  notes: string | null;
}

export interface Attempt {
  id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean | number | null;
  time_taken_sec: number;
  created_at: string;
  bookmarked: boolean | number;
}

export interface User {
  id: string;
  name: string;
  streak_days: number;
  last_active_date: string;
  total_xp: number;
  target_questions_correct: number;
  level: string;
}

export interface AiChat {
  id: string;
  user_id: string;
  question_id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

export interface PredictedQuestion {
  id: string;
  subject: string;
  chapter: string;
  question_text_latex: string;
  options_json: string | null;
  correct_answer: string;
  prediction_reason: string;
  full_solution_latex: string;
  difficulty: string;
}
