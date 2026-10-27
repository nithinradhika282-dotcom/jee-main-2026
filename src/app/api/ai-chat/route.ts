import { getDb } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question_id, message, user_id = "user_default", api_key: bodyApiKey, history: clientHistory = [] } = body;

    const headerApiKey = request.headers.get("x-gemini-api-key");
    const activeGeminiKey =
      bodyApiKey ||
      headerApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "";

    const activeGroqKey =
      process.env.GROQ_API_KEY ||
      "";

    if (!question_id || !message) {
      return new Response(JSON.stringify({ error: "question_id and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb();

    // 1. Fetch Question and Explanation context
    const qRow = db.prepare(`
      SELECT 
        q.id, q.subject, q.chapter, q.topic, q.question_number, q.question_type,
        q.question_text_latex, q.options_json, q.correct_answer, q.difficulty, q.exam_name,
        e.hint, e.approach, e.full_solution_latex, e.concept_used, e.common_mistake, e.no_pen_trick
      FROM questions q
      LEFT JOIN explanations e ON q.id = e.question_id
      WHERE q.id = ?
    `).get(question_id) as any;

    if (!qRow) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save user message to database
    const userMsgId = randomUUID();
    try {
      db.prepare(`
        INSERT INTO ai_chats (id, user_id, question_id, role, message)
        VALUES (?, ?, ?, 'user', ?)
      `).run(userMsgId, user_id, question_id, message);
    } catch (e) {
      console.warn("Could not record user message in ai_chats:", e);
    }

    // Set up Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendChunk = (text: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        };

        let fullAiResponse = "";

        const systemInstruction = `You are "Sarthi AI", an elite, empathetic, and exceptionally clear JEE educator and personal tutor.
Your student is preparing for ${qRow.exam_name || "JEE Main"} and needs concepts explained clearly from first principles.

QUESTION CONTEXT:
- Subject: ${qRow.subject}
- Chapter: ${qRow.chapter}
- Topic: ${qRow.topic || "Core Syllabus"}
- Question: ${qRow.question_text_latex}
- Options: ${qRow.options_json || "Numerical"}
- Verified Official Answer: ${qRow.correct_answer}
- Hint: ${qRow.hint || "Analyze fundamental equations"}
- Core Concept: ${qRow.concept_used || qRow.chapter}
- Detailed Solution: ${qRow.full_solution_latex || ""}
- Common Student Mistake: ${qRow.common_mistake || "Calculation or sign error"}
- 30-Second No-Pen Shortcut: ${qRow.no_pen_trick || "Dimensional elimination"}

PEDAGOGICAL & TOKEN MANAGEMENT GUIDELINES (FOLLOW STRICTLY):
1. TOKEN CONTROL & LEARNING BLUEPRINT:
   Because of token limits and to prevent overwhelming beginner students with a wall of text:
   - When introducing or asked to explain this concept:
     A) First, lay out a clear 4-Step Master Blueprint:
        - Step 1: Real-World Intuition & Core Concept (Zero jargon)
        - Step 2: Key Formula & Step-by-Step Derivation
        - Step 3: High-Frequency Exam Trap & Student Pitfalls
        - Step 4: 30-Second No-Pen Mental Shortcut
     B) Then, explain **Step 1 (and Step 2 if brief)** in thorough, conversational depth.
     C) Conclude with an invitation: "👉 Ready for Step 2/3? Tap **Next Step** below or ask me any doubt about this step!"
   - When the user asks "Next step", "Continue", or asks about a specific step (e.g. traps, shortcut, or derivation):
     Immediately jump into that specific step and explain it thoroughly with step-by-step clarity.
2. LATEX & KATEX:
   - Always enclose inline math in single dollar signs like $v = u + at$.
   - Always enclose display equations in double dollar signs like $$H = \\frac{u^2\\sin^2\\theta}{2g}$$.
   - Never write raw unescaped percent signs (write \\%).
3. Conversational warmth:
   - Treat the student with patience, encouraging words, and no condescending tone.`;

        let streamSucceeded = false;

        // --- ATTEMPT 1: GROQ HIGH-SPEED STREAMING (Fastest inference, 15ms TTFT) ---
        if (activeGroqKey) {
          try {
            const groqMessages: any[] = [
              { role: "system", content: systemInstruction }
            ];

            for (const h of clientHistory.slice(-6)) {
              groqMessages.push({
                role: h.role === "assistant" ? "assistant" : "user",
                content: h.message
              });
            }
            groqMessages.push({ role: "user", content: message });

            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${activeGroqKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "qwen/qwen3.8-27b",
                messages: groqMessages,
                temperature: 0.65,
                max_tokens: 1500,
                stream: true
              })
            });

            if (groqRes.ok && groqRes.body) {
              const reader = groqRes.body.getReader();
              const decoder = new TextDecoder("utf-8");
              let buffer = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data: ")) continue;
                  const dataPart = trimmed.slice(6);
                  if (dataPart === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(dataPart);
                    const deltaText = parsed.choices?.[0]?.delta?.content;
                    if (deltaText) {
                      fullAiResponse += deltaText;
                      sendChunk(deltaText);
                    }
                  } catch (e) {}
                }
              }

              if (fullAiResponse.trim().length > 0) {
                streamSucceeded = true;
              }
            } else {
              const errBody = await groqRes.text().catch(() => "");
              console.warn("Groq streaming returned non-ok status:", groqRes.status, errBody);
            }
          } catch (groqErr: any) {
            console.warn("Groq API stream error:", groqErr?.message);
          }
        }

        // --- ATTEMPT 2: GEMINI 3.8 FLASH STREAMING (If Groq did not succeed) ---
        if (!streamSucceeded && activeGeminiKey) {
          try {
            const ai = new GoogleGenAI({ apiKey: activeGeminiKey });

            const contents: any[] = [];
            for (const h of clientHistory.slice(-6)) {
              contents.push({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: h.message }],
              });
            }
            contents.push({
              role: "user",
              parts: [{ text: message }],
            });

            const responseStream = await ai.models.generateContentStream({
              model: "gemini-3.8-flash",
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.65,
                maxOutputTokens: 2048,
              },
            });

            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                fullAiResponse += text;
                sendChunk(text);
              }
            }

            if (fullAiResponse.trim().length > 0) {
              streamSucceeded = true;
            }
          } catch (geminiErr: any) {
            console.warn("Gemini stream error:", geminiErr?.message);
          }
        }

        // --- ATTEMPT 3: PEDAGOGICAL FALLBACK (Zero failure guarantee) ---
        if (!streamSucceeded) {
          await streamPedagogicalResponse(qRow, message, sendChunk, (text) => (fullAiResponse += text));
        }

        // Save AI reply to database
        try {
          const aiMsgId = randomUUID();
          db.prepare(`
            INSERT INTO ai_chats (id, user_id, question_id, role, message)
            VALUES (?, ?, ?, 'assistant', ?)
          `).run(aiMsgId, user_id, question_id, fullAiResponse);
        } catch (e) {
          console.warn("Could not save AI reply to database:", e);
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Fallback high-yield pedagogical response if upstream AI is temporarily unreachable
async function streamPedagogicalResponse(
  q: any,
  userMessage: string,
  sendChunk: (txt: string) => void,
  recordText: (txt: string) => void
) {
  const lower = userMessage.toLowerCase();
  let generated = "";

  if (lower.includes("plan") || lower.includes("scratch") || lower.includes("zero") || lower.includes("basics") || lower.includes("beginner") || lower.includes("explain")) {
    generated = `### 🌟 Sarthi AI Master Learning Blueprint: **${q.chapter}**\n\n` +
      `Here is our 4-step roadmap to master this concept from ground zero:\n\n` +
      `* **Step 1:** Core Physical Intuition & What Nature is Doing\n` +
      `* **Step 2:** Key Mathematical Formulation & Step-by-Step Derivation\n` +
      `* **Step 3:** High-Frequency Exam Trap (Where students lose marks)\n` +
      `* **Step 4:** 30-Second No-Pen Mental Shortcut\n\n` +
      `---\n\n` +
      `### 🔹 Step 1: Physical Intuition & Core Concept\n\n` +
      `In **${q.subject}**, whenever we study **${q.topic || q.chapter}**, we are observing a conservation law in action:\n` +
      `> *${q.hint || "Focus on the fundamental relationship between the physical parameters."}*\n\n` +
      `Think of it simply: before writing formulas, ask what cause produces what effect. In this question, the key concept is **${q.concept_used || q.chapter}**.\n\n` +
      `👉 *Ready to derive the formula in Step 2? Tap **Next Step** below or ask me any question about Step 1!*`;
  } else if (lower.includes("step 2") || lower.includes("derivation") || lower.includes("formula") || lower.includes("math")) {
    generated = `### 🔹 Step 2: Mathematical Formulation & Derivation\n\n` +
      `Now that we understand the physical intuition, let's look at the mathematical formulation:\n\n` +
      `1. **Governing Principle:**\n` +
      `   ${q.approach}\n\n` +
      `2. **Applying the Conditions:**\n` +
      `   ${q.full_solution_latex || "Substitute the given boundary parameters into the governing formula."}\n\n` +
      `3. **Target Result:**\n` +
      `   The verified answer is: **$${q.correct_answer}$**.\n\n` +
      `👉 *Ready to see where 70% of students lose negative marks? Tap **Step 3: Exam Traps** or reply 'Next'!*`;
  } else if (lower.includes("step 3") || lower.includes("mistake") || lower.includes("trap") || lower.includes("wrong")) {
    generated = `### ⚠️ Step 3: High-Frequency Exam Trap & Pitfall\n\n` +
      `Almost 70% of JEE aspirants lose negative marks on this exact problem because:\n` +
      `> **${q.common_mistake || "They rush through algebraic cancellations or forget sign conventions."}**\n\n` +
      `**How the Top 1% Solves It Cleanly:**\n` +
      `Always write the basic definition first, then substitute. Never skip intermediate vector/sign conventions!\n\n` +
      `👉 *Ready for the rapid solving trick? Tap **Step 4: 30s Mental Shortcut** or reply 'Next'!*`;
  } else if (lower.includes("step 4") || lower.includes("no pen") || lower.includes("shortcut") || lower.includes("trick") || lower.includes("fast")) {
    generated = `### 🧠 Step 4: 30-Second No-Pen Mental Shortcut\n\n` +
      `${q.no_pen_trick || "Check dimensional homogeneity across options or test boundary values (0 and infinity) in your head."}\n\n` +
      `By eliminating options with incorrect units or inconsistent physical behavior, you can verify **$${q.correct_answer}$** in under 30 seconds without wasting scrap paper!\n\n` +
      `🎉 **Congratulations! You have completed all 4 steps of this concept blueprint.** Feel free to ask any doubt or pick another question!`;
  } else {
    generated = `### 🎓 Sarthi AI Step-by-Step Guidance:\n\n` +
      `Let's analyze this **${q.subject}** problem from **${q.chapter}**:\n\n` +
      `1. **Physical Intuition:**\n` +
      `   ${q.approach}\n\n` +
      `2. **Formula & Calculation:**\n` +
      `   ${q.hint}\n\n` +
      `3. **Official Result:**\n` +
      `   The verified answer is **$${q.correct_answer}$**.\n\n` +
      `Would you like to review **Step 1 (Basics)**, **Step 2 (Derivation)**, **Step 3 (Exam Traps)**, or **Step 4 (30s Shortcut)**?`;
  }

  const chunks = generated.split(/(?<=\n| )/);
  for (const part of chunks) {
    sendChunk(part);
    recordText(part);
    await new Promise((r) => setTimeout(r, 12));
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const question_id = searchParams.get("question_id");

    if (!question_id) {
      return new Response(JSON.stringify({ error: "question_id required" }), { status: 400 });
    }

    const db = getDb();
    const history = db.prepare(`
      SELECT id, user_id, question_id, role, message, created_at
      FROM ai_chats
      WHERE question_id = ?
      ORDER BY created_at ASC
    `).all(question_id);

    return new Response(JSON.stringify({ history }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
