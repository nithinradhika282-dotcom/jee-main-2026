import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE id = 'user_default'").get() as any;

    // Calculate total correct questions
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct,
        SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today_attempts
      FROM attempts
    `).get() as any;

    const totalAttempts = stats?.total_attempts || 0;
    const totalCorrect = stats?.total_correct || 0;
    const todayAttempts = stats?.today_attempts || 0;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Target road: 60 questions correct
    const target = user?.target_questions_correct || 60;
    const progressTo60 = Math.min(Math.round((totalCorrect / target) * 100), 100);

    return NextResponse.json({
      user: {
        ...user,
        total_correct: totalCorrect,
        total_attempts: totalAttempts,
        today_attempts: todayAttempts,
        accuracy,
        progressTo60,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const db = getDb();

    // Check if it's a Google Login event
    if (body.google_login) {
      const { name = "Google User", email, avatar_url } = body;
      db.prepare(`
        UPDATE users
        SET name = ?
        WHERE id = 'user_default'
      `).run(name);

      const user = db.prepare("SELECT * FROM users WHERE id = 'user_default'").get() as any;
      return NextResponse.json({
        success: true,
        user: {
          ...user,
          email,
          avatar_url,
        },
      });
    }

    const { xp_gain = 20, is_correct } = body;
    const today = new Date().toISOString().split("T")[0];

    // Fetch user
    const user = db.prepare("SELECT * FROM users WHERE id = 'user_default'").get() as any;

    let newStreak = user.streak_days;
    if (user.last_active_date !== today) {
      newStreak += 1;
    }

    const newXp = user.total_xp + (is_correct ? xp_gain : 5);

    // Determine Rank Badge
    let newLevel = "JEE Novice";
    if (newXp > 500) newLevel = "Top 0.5% IITian Tier";
    else if (newXp > 300) newLevel = "Super 60 Ranker";
    else if (newXp > 150) newLevel = "High Precision Solver";
    else if (newXp > 50) newLevel = "Consistent Aspirant";

    db.prepare(`
      UPDATE users
      SET streak_days = ?,
          last_active_date = ?,
          total_xp = ?,
          level = ?
      WHERE id = 'user_default'
    `).run(newStreak, today, newXp, newLevel);

    return NextResponse.json({
      success: true,
      streak_days: newStreak,
      total_xp: newXp,
      level: newLevel,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
