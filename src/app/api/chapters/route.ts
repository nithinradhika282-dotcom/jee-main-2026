import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    const db = getDb();

    let sql = `
      SELECT c.id, c.subject, c.name, c.class_level, c.jee_weightage_notes,
             COUNT(q.id) as question_count
      FROM chapters c
      LEFT JOIN questions q ON c.name = q.chapter
    `;

    const params: string[] = [];
    if (subject) {
      sql += ` WHERE c.subject = ?`;
      params.push(subject);
    }

    sql += ` GROUP BY c.id ORDER BY c.subject, c.class_level, c.name`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);

    return NextResponse.json({ chapters: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
