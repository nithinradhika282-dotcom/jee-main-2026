import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT 
        q.id, q.paper_id, q.subject, q.chapter, q.topic, q.question_number,
        q.question_type, q.question_text_latex, q.image_url, q.options_json,
        q.correct_answer, q.difficulty, q.source_page, q.needs_review,
        p.exam_date, p.shift, p.session, p.source_url,
        e.id as exp_id, e.hint, e.approach, e.full_solution_latex, e.concept_used,
        e.common_mistake, e.similar_concept_tip, e.verified_against_key, e.confidence
      FROM questions q
      JOIN papers p ON q.paper_id = p.id
      LEFT JOIN explanations e ON q.id = e.question_id
      ORDER BY e.verified_against_key ASC, q.question_number ASC
    `).all();

    return NextResponse.json({ questions: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      question_id,
      question_text_latex,
      correct_answer,
      options_json,
      needs_review,
      verified_against_key,
      confidence,
      full_solution_latex,
    } = body;

    if (!question_id) {
      return NextResponse.json({ error: "question_id is required" }, { status: 400 });
    }

    const db = getDb();

    // Update question if fields provided
    if (
      question_text_latex !== undefined ||
      correct_answer !== undefined ||
      options_json !== undefined ||
      needs_review !== undefined
    ) {
      db.prepare(`
        UPDATE questions 
        SET question_text_latex = COALESCE(?, question_text_latex),
            correct_answer = COALESCE(?, correct_answer),
            options_json = COALESCE(?, options_json),
            needs_review = COALESCE(?, needs_review)
        WHERE id = ?
      `).run(
        question_text_latex ?? null,
        correct_answer ?? null,
        options_json ?? null,
        needs_review !== undefined ? (needs_review ? 1 : 0) : null,
        question_id
      );
    }

    // Update explanation if fields provided
    if (
      verified_against_key !== undefined ||
      confidence !== undefined ||
      full_solution_latex !== undefined
    ) {
      db.prepare(`
        UPDATE explanations
        SET verified_against_key = COALESCE(?, verified_against_key),
            confidence = COALESCE(?, confidence),
            full_solution_latex = COALESCE(?, full_solution_latex)
        WHERE question_id = ?
      `).run(
        verified_against_key !== undefined ? (verified_against_key ? 1 : 0) : null,
        confidence ?? null,
        full_solution_latex ?? null,
        question_id
      );
    }

    return NextResponse.json({ success: true, message: "Question updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
