import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question_id, selected_answer, is_correct, time_taken_sec, bookmarked } = body;

    if (!question_id) {
      return NextResponse.json({ error: "question_id is required" }, { status: 400 });
    }

    const db = getDb();
    const id = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO attempts (id, question_id, selected_answer, is_correct, time_taken_sec, bookmarked)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      question_id,
      selected_answer !== undefined ? String(selected_answer) : null,
      is_correct !== undefined ? (is_correct ? 1 : 0) : null,
      time_taken_sec || 0,
      bookmarked ? 1 : 0
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // 'mistakes' or 'bookmarks'

    const db = getDb();

    let sql = `
      SELECT 
        a.id as attempt_id, a.selected_answer, a.is_correct, a.time_taken_sec, a.created_at, a.bookmarked,
        q.id as question_id, q.subject, q.chapter, q.topic, q.question_number, q.question_type,
        q.question_text_latex, q.image_url, q.options_json, q.correct_answer, q.difficulty,
        p.exam_date, p.shift, p.session,
        e.hint, e.approach, e.full_solution_latex, e.concept_used, e.common_mistake
      FROM attempts a
      JOIN questions q ON a.question_id = q.id
      JOIN papers p ON q.paper_id = p.id
      LEFT JOIN explanations e ON q.id = e.question_id
    `;

    if (filter === "mistakes") {
      sql += ` WHERE a.is_correct = 0`;
    } else if (filter === "bookmarks") {
      sql += ` WHERE a.bookmarked = 1`;
    }

    sql += ` ORDER BY a.created_at DESC LIMIT 100`;

    const rows = db.prepare(sql).all();
    return NextResponse.json({ items: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
