# JEE Main PYQ Mastery Platform (Mobile-First)

A mobile-first, high-retention practice platform engineered for Class 12 students aiming to clear JEE Main with **60+ questions correct (240+ marks / 99.5+ percentile)**.

---

## 🌟 Key Features

1. **Target 60 Correct / 240+ Marks Mission**:
   - Psychological motivation loop: daily streaks (🔥), XP progression (⚡), and dynamic rank tiers (*Super 60 Ranker*, *Top 0.5% IITian Tier*).
   - Live target progress bar tracking correct attempts toward the 60-question milestone.

2. **🧠 No-Pen Mode (Learn Without Pen & Paper)**:
   - Dedicated toggle mode designed for mobile study on the go.
   - Teaches students how to eliminate wrong options in 30 seconds using dimensional analysis, boundary conditions ($x \to 0$, $x \to \infty$), symmetry, and order of magnitude estimation.

3. **🤖 Sarthi AI - Beginner Concept Mentor**:
   - Built-in interactive doubt resolution drawer on every question.
   - Instructed specifically for beginners: explains from scratch using intuitive real-life analogies, breaks down common student traps, and avoids unnecessary jargon.
   - Persists chat conversations to the SQLite database (`ai_chats` table).

4. **🔀 Dynamic Question Shuffling**:
   - Randomizes question order across years and chapters (`ORDER BY RANDOM()`) to simulate real exam variety.

5. **🔮 AI Question Forecasting & Twin Practice Models (`/predicted`)**:
   - Discovers recurring question patterns across shifts.
   - Generates twin practice questions targeted directly at the student's weakest chapters based on their mistake history.

6. **Ultra-Fast In-Memory KaTeX Math Rendering**:
   - Sub-millisecond math formula rendering using in-memory LRU caching across question bodies, options, official keys, approach summaries, and common mistakes.

7. **Multi-Year Database Scope (322+ Questions)**:
   - **2026**: 109 questions (All latest sessions and shifts)
   - **2025**: 66 questions
   - **2024**: 64 questions
   - **2023**: 66 questions
   - **Historical (2002–2022 & 2019)**: 17 curated foundational Easy/Medium questions.

---

##  stack

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS (Mobile-First), Lucide Icons, KaTeX.
- **Backend & Database**: Next.js Route Handlers, SQLite locally via Node native `node:sqlite` (`DatabaseSync`), Prisma schema ready for Supabase / PostgreSQL.
- **AI Endpoints**: `/api/ai-chat` (Sarthi beginner tutor), `/api/ai-generator` (mistake analysis & twin generator), `/api/user` (streaks & XP), `/api/questions` (filtering & shuffling).

---

## 🚀 Quick Setup Instructions

### 1. Prerequisites
- **Node.js**: v20 or newer (built and tested on Node v24)
- **Python**: 3.10+ (for database ingestion scripts)

### 2. Run Locally
```bash
# Navigate to the project directory
cd C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026

# Start production server (already pre-built)
npx next start -p 3000

# OR start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile or desktop browser.

---

## ⚖️ Mandatory Legal & Disclaimer Footer

> **Questions are from official NTA papers. Explanations are AI-generated and may contain errors. Verify with your teacher.**
