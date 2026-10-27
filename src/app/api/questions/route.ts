import { NextResponse } from "next/server";
import { getDb, Question } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const exam = searchParams.get("exam");
    const subject = searchParams.get("subject");
    const year = searchParams.get("year");
    const chapter = searchParams.get("chapter");
    const difficulty = searchParams.get("difficulty");
    const question_type = searchParams.get("question_type");
    const session = searchParams.get("session");
    const shift = searchParams.get("shift");
    const search = searchParams.get("search");
    const shuffle = searchParams.get("shuffle") === "true";
    const include_unverified = searchParams.get("include_unverified") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const db = getDb();

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (id) {
      conditions.push("q.id = ?");
      params.push(id);
    }
    if (exam && exam !== "All") {
      conditions.push("(q.exam_name = ? OR p.exam_name = ?)");
      params.push(exam, exam);
    }
    if (subject) {
      conditions.push("q.subject = ?");
      params.push(subject);
    }
    if (year && year !== "All") {
      conditions.push("p.year = ?");
      params.push(parseInt(year, 10));
    }
    if (chapter) {
      conditions.push("q.chapter = ?");
      params.push(chapter);
    }
    if (difficulty) {
      conditions.push("q.difficulty = ?");
      params.push(difficulty);
    }
    if (question_type) {
      conditions.push("q.question_type = ?");
      params.push(question_type);
    }
    if (session) {
      conditions.push("p.session = ?");
      params.push(parseInt(session, 10));
    }
    if (shift) {
      conditions.push("p.shift = ?");
      params.push(parseInt(shift, 10));
    }
    if (search) {
      conditions.push("(q.question_text_latex LIKE ? OR q.topic LIKE ? OR q.chapter LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    // Filter unverified questions unless requested
    if (!include_unverified) {
      conditions.push("(e.verified_against_key = 1 OR e.verified_against_key IS NULL)");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM questions q
      JOIN papers p ON q.paper_id = p.id
      LEFT JOIN explanations e ON q.id = e.question_id
      ${whereClause}
    `;
    const countStmt = db.prepare(countSql);
    const totalRow = countStmt.get(...params) as { total: number };
    const total = totalRow ? totalRow.total : 0;

    // Data query with explanation and paper details
    const dataSql = `
      SELECT 
        q.id, q.paper_id, q.subject, q.chapter, q.topic, q.question_number,
        q.question_type, q.question_text_latex, q.image_url, q.options_json,
        q.correct_answer, q.marks_correct, q.marks_negative, q.difficulty, q.source_page, q.needs_review, q.exam_name,
        p.year as paper_year, p.exam_date as paper_date, p.shift as paper_shift, p.session as paper_session, p.source_url,
        e.id as exp_id, e.hint, e.approach, e.full_solution_latex, e.concept_used,
        e.common_mistake, e.similar_concept_tip, e.verified_against_key, e.confidence,
        e.no_pen_trick, e.similar_model_question
      FROM questions q
      JOIN papers p ON q.paper_id = p.id
      LEFT JOIN explanations e ON q.id = e.question_id
      ${whereClause}
      ORDER BY ${shuffle ? "RANDOM()" : "p.year DESC, q.question_number ASC"}
      LIMIT ? OFFSET ?
    `;

    const dataStmt = db.prepare(dataSql);
    const rows = dataStmt.all(...params, limit, offset) as any[];

    const questions: Question[] = rows.map((row) => ({
      id: row.id,
      paper_id: row.paper_id,
      subject: row.subject,
      chapter: row.chapter,
      topic: row.topic,
      question_number: row.question_number,
      question_type: row.question_type,
      question_text_latex: row.question_text_latex,
      image_url: row.image_url,
      options_json: row.options_json,
      correct_answer: row.correct_answer,
      marks_correct: row.marks_correct,
      marks_negative: row.marks_negative,
      difficulty: row.difficulty,
      source_page: row.source_page,
      needs_review: Boolean(row.needs_review),
      exam_name: row.exam_name || "JEE Main",
      paper_year: row.paper_year,
      paper_date: row.paper_date,
      paper_shift: row.paper_shift,
      paper_session: row.paper_session,
      source_url: row.source_url,
      explanation: row.exp_id
        ? {
            id: row.exp_id,
            question_id: row.id,
            hint: row.hint,
            approach: row.approach,
            full_solution_latex: row.full_solution_latex,
            concept_used: row.concept_used,
            common_mistake: row.common_mistake,
            similar_concept_tip: row.similar_concept_tip,
            verified_against_key: Boolean(row.verified_against_key),
            confidence: row.confidence,
            no_pen_trick: row.no_pen_trick,
            similar_model_question: row.similar_model_question,
          }
        : undefined,
    }));

    return NextResponse.json(
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        questions,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
