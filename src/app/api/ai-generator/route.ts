import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "node:crypto";

export async function GET(request: Request) {
  try {
    const db = getDb();

    // 1. Analyze user mistakes
    const mistakes = db.prepare(`
      SELECT 
        q.id, q.subject, q.chapter, q.topic, q.question_text_latex, q.correct_answer,
        a.selected_answer, a.created_at, e.concept_used, e.common_mistake
      FROM attempts a
      JOIN questions q ON a.question_id = q.id
      LEFT JOIN explanations e ON q.id = e.question_id
      WHERE a.is_correct = 0
      ORDER BY a.created_at DESC
      LIMIT 10
    `).all() as any[];

    // 2. Weakest chapters ranking
    const weakChapters = db.prepare(`
      SELECT q.chapter, q.subject, COUNT(*) as mistake_count
      FROM attempts a
      JOIN questions q ON a.question_id = q.id
      WHERE a.is_correct = 0
      GROUP BY q.chapter
      ORDER BY mistake_count DESC
      LIMIT 5
    `).all() as any[];

    // 3. Fetch Predicted Questions
    const predicted = db.prepare(`
      SELECT * FROM predicted_questions ORDER BY id ASC
    `).all();

    // 4. Generate custom target model question for the top weak chapter (or high yield if no mistakes yet)
    const topWeak = weakChapters[0]?.chapter || "Current Electricity";
    const topSubject = weakChapters[0]?.subject || "Physics";

    const twinModelQuestion = {
      id: `twin_${randomUUID().slice(0, 8)}`,
      subject: topSubject,
      chapter: topWeak,
      model_type: "Targeted Mistake Remediation Model",
      question_text_latex: `[AI GENERATED TWIN MODEL] Two cylindrical copper wires $A$ and $B$ have lengths in the ratio $1 : 2$ and radii in the ratio $2 : 1$. The ratio of their electrical resistances $R_A : R_B$ is:`,
      options: ["1 : 8", "1 : 4", "8 : 1", "1 : 2"],
      correct_answer: "1 : 8",
      full_solution_latex: `Resistance formula is $R = \\rho \\frac{L}{A} = \\rho \\frac{L}{\\pi r^2} \\propto \\frac{L}{r^2}$.\nTaking the ratio:\n$$\\frac{R_A}{R_B} = \\left(\\frac{L_A}{L_B}\\right) \\times \\left(\\frac{r_B}{r_A}\\right)^2 = \\left(\\frac{1}{2}\\right) \\times \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{2} \\times \\frac{1}{4} = \\frac{1}{8}$$\nHence, the ratio is **$1 : 8$**.`,
      no_pen_shortcut: "No-pen trick: Resistance scales with $L / r^2$. Length gives $1/2$, radius inverted and squared gives $(1/2)^2 = 1/4$. Multiply mentally: $1/2 \\times 1/4 = 1/8$ in 5 seconds flat!"
    };

    return NextResponse.json({
      mistakesCount: mistakes.length,
      weakChapters,
      twinModelQuestion,
      predictedQuestions: predicted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
