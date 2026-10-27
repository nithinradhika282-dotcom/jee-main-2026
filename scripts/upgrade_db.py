import sqlite3
import os
import uuid
import json

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db")

def upgrade():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'JEE Aspirant',
        streak_days INTEGER NOT NULL DEFAULT 1,
        last_active_date TEXT,
        total_xp INTEGER NOT NULL DEFAULT 120,
        target_questions_correct INTEGER NOT NULL DEFAULT 60,
        level TEXT NOT NULL DEFAULT 'Rank Aspirant'
    );
    """)

    # Ensure a default user exists
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO users (id, name, streak_days, last_active_date, total_xp, target_questions_correct, level)
        VALUES ('user_default', 'Class 12 Ranker', 3, '2026-10-27', 240, 60, 'Target: 60/75 Correct (240+ Marks)')
        """)

    # 2. Create ai_chats table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_chats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'user_default',
        question_id TEXT NOT NULL,
        role TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    """)

    # 3. Create predicted_questions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predicted_questions (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        chapter TEXT NOT NULL,
        question_text_latex TEXT NOT NULL,
        options_json TEXT,
        correct_answer TEXT NOT NULL,
        prediction_reason TEXT NOT NULL,
        full_solution_latex TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'medium'
    );
    """)

    # 4. Add columns to explanations if not present
    cursor.execute("PRAGMA table_info(explanations)")
    columns = [col[1] for col in cursor.fetchall()]
    if "no_pen_trick" not in columns:
        cursor.execute("ALTER TABLE explanations ADD COLUMN no_pen_trick TEXT;")
        print("Added no_pen_trick column to explanations.")
    if "similar_model_question" not in columns:
        cursor.execute("ALTER TABLE explanations ADD COLUMN similar_model_question TEXT;")
        print("Added similar_model_question column to explanations.")

    # 5. Populate default no_pen_tricks for existing explanations
    cursor.execute("""
    UPDATE explanations 
    SET no_pen_trick = 'Look at the dimension or extreme boundary values: Eliminating non-matching units immediately narrows down to the correct option in under 20 seconds without writing anything.'
    WHERE no_pen_trick IS NULL;
    """)

    conn.commit()
    conn.close()
    print("Database upgrade complete! Users, AI chats, predicted questions, and No-Pen tricks enabled.")

if __name__ == "__main__":
    upgrade()
