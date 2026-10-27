import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    // Summary counts
    const totalQuestions = (db.prepare("SELECT COUNT(*) as cnt FROM questions").get() as any).cnt;
    const totalPapers = (db.prepare("SELECT COUNT(*) as cnt FROM papers").get() as any).cnt;

    // Subject breakdown
    const subjectStats = db.prepare(`
      SELECT subject, COUNT(*) as count,
             SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy_count,
             SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium_count,
             SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard_count
      FROM questions
      GROUP BY subject
    `).all();

    // Chapter-wise breakdown across subjects with Class 11 vs 12
    const chapterStats = db.prepare(`
      SELECT 
        c.subject, 
        c.name as chapter, 
        c.class_level, 
        c.jee_weightage_notes,
        COUNT(q.id) as question_count,
        SUM(CASE WHEN q.question_type = 'MCQ' THEN 1 ELSE 0 END) as mcq_count,
        SUM(CASE WHEN q.question_type = 'NUMERICAL' THEN 1 ELSE 0 END) as numerical_count
      FROM chapters c
      LEFT JOIN questions q ON c.name = q.chapter
      GROUP BY c.id
      ORDER BY question_count DESC, c.subject ASC
    `).all();

    // Class 11 vs 12 breakdown
    const classDistribution = db.prepare(`
      SELECT 
        c.class_level,
        COUNT(q.id) as question_count
      FROM chapters c
      LEFT JOIN questions q ON c.name = q.chapter
      GROUP BY c.class_level
    `).all();

    // Year breakdown
    const yearStats = db.prepare(`
      SELECT p.year, COUNT(q.id) as question_count
      FROM questions q
      JOIN papers p ON q.paper_id = p.id
      GROUP BY p.year
      ORDER BY p.year DESC
    `).all();

    return NextResponse.json({
      totalQuestions,
      totalPapers,
      subjectStats,
      chapterStats,
      classDistribution,
      yearStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
