import sqlite3 from "node:sqlite";
import fs from "node:fs";

const groqKey = process.env.GROQ_API_KEY || "";

async function generateChapterQuestions(subject, chapter, count = 5) {
  const prompt = `You are a Senior IIT JEE Faculty member. Generate ${count} authentic, challenging JEE Main previous year questions (PYQs) for the chapter "${chapter}" in ${subject}.
Rules:
1. Every math expression must use proper LaTeX ($...$ for inline, $$...$$ for display).
2. Options must be an array of exactly 4 choices (A, B, C, D), properly formatted in LaTeX.
3. Correct answer must be exactly "A", "B", "C", or "D".
4. Include pedagogical hint, approach, full step-by-step solution, common student mistake, and a 30-second no-pen mental shortcut.
5. Return ONLY a valid JSON object with the key "questions":
{
  "questions": [
    {
      "topic": "Specific Topic Name",
      "difficulty": "medium",
      "question_type": "MCQ",
      "qtext": "LaTeX question text",
      "options": ["$Option A$", "$Option B$", "$Option C$", "$Option D$"],
      "corr": "A",
      "hint": "Pedagogical hint",
      "approach": "First principles approach",
      "solution": "Step by step solution in LaTeX",
      "mistake": "Common trap",
      "no_pen": "30-second shortcut"
    }
  ]
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + groqKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen/qwen3.8-27b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  const parsed = JSON.parse(json.choices[0].message.content);
  return parsed.questions || [];
}

async function run() {
  console.log("Testing generation for Continuity and Differentiability...");
  const questions = await generateChapterQuestions("Mathematics", "Continuity and Differentiability", 3);
  console.log(`Generated ${questions.length} questions!`);
  console.log("Sample Question 1:");
  console.log(JSON.stringify(questions[0], null, 2));
}

run().catch(console.error);
