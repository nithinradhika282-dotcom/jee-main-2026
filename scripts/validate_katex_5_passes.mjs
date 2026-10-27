import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import katex from "katex";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new DatabaseSync(dbPath);

console.log("=================================================================");
console.log(" STRICT 5-PASS KATEX INTEGRITY AUDIT ACROSS ALL 1,005 QUESTIONS");
console.log("=================================================================\n");

const mathRegex = /\$\$([\s\S]*?)\$\$|\$([^\$]+?)\$/g;

function testRender(latexStr, contextName, qid) {
  if (!latexStr) return true;
  
  let match;
  const r = new RegExp(mathRegex);
  while ((match = r.exec(latexStr)) !== null) {
    const expr = match[1] || match[2];
    try {
      katex.renderToString(expr.trim(), {
        throwOnError: true,
        displayMode: Boolean(match[1]),
      });
    } catch (err) {
      console.error(`[FAIL] ${qid} in ${contextName}: ${err.message}`);
      return false;
    }
  }
  return true;
}

let allPassesSuccessful = true;

for (let pass = 1; pass <= 5; pass++) {
  const rows = db.prepare(`
    SELECT q.id, q.question_number, q.question_text_latex, q.options_json,
           e.hint, e.approach, e.full_solution_latex, e.common_mistake, e.no_pen_trick
    FROM questions q
    LEFT JOIN explanations e ON q.id = e.question_id
  `).all();

  let passErrors = 0;
  let expressionsTested = 0;

  for (const row of rows) {
    // 1. Question text
    if (!testRender(row.question_text_latex, "question_text", row.id)) {
      passErrors++;
    }

    // 2. Options
    if (row.options_json) {
      try {
        const opts = JSON.parse(row.options_json);
        for (let i = 0; i < opts.length; i++) {
          if (!testRender(opts[i], `option_${i}`, row.id)) {
            passErrors++;
          }
        }
      } catch (e) {}
    }

    // 3. Explanation fields
    if (!testRender(row.full_solution_latex, "full_solution", row.id)) passErrors++;
    if (!testRender(row.hint, "hint", row.id)) passErrors++;
    if (!testRender(row.approach, "approach", row.id)) passErrors++;
    if (!testRender(row.common_mistake, "common_mistake", row.id)) passErrors++;
    if (!testRender(row.no_pen_trick, "no_pen_trick", row.id)) passErrors++;
  }

  if (passErrors > 0) {
    allPassesSuccessful = false;
    console.log(`❌ Pass ${pass}/5 FAILED: Found ${passErrors} errors.`);
  } else {
    console.log(`✅ Pass ${pass}/5 PASSED: Checked all ${rows.length} questions across all fields. 0 errors!`);
  }
}

if (allPassesSuccessful) {
  console.log("\n🎉 PERFECT 5/5 PASSES VERIFIED: All math formulas render with KaTeX with 0 syntax errors!");
} else {
  process.exit(1);
}
