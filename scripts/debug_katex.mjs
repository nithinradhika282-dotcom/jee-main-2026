import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import katex from "katex";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new DatabaseSync(dbPath);

const rows = db.prepare(`
  SELECT q.id, q.question_number, q.question_text_latex, q.options_json,
         e.hint, e.approach, e.full_solution_latex, e.common_mistake, e.no_pen_trick
  FROM questions q
  LEFT JOIN explanations e ON q.id = e.question_id
`).all();

const mathRegex = /\$\$([\s\S]*?)\$\$|\$([^\$]+?)\$/g;

let count = 0;
const errorTypes = new Map();

for (const row of rows) {
  const fields = [
    ["question_text", row.question_text_latex],
    ["solution", row.full_solution_latex],
    ["hint", row.hint],
    ["approach", row.approach],
    ["no_pen_trick", row.no_pen_trick]
  ];
  if (row.options_json) {
    try {
      const opts = JSON.parse(row.options_json);
      opts.forEach((o, i) => fields.push([`opt_${i}`, o]));
    } catch(e) {}
  }
  for (const [name, text] of fields) {
    if (!text) continue;
    let match;
    const r = new RegExp(mathRegex);
    while ((match = r.exec(text)) !== null) {
      const expr = match[1] || match[2];
      try {
        katex.renderToString(expr.trim(), { throwOnError: true, displayMode: Boolean(match[1]) });
      } catch (err) {
        count++;
        const msg = err.message;
        errorTypes.set(msg, (errorTypes.get(msg) || 0) + 1);
        if (count <= 15) {
          console.log(`[${row.id} - ${name}]: ${msg}\n  Expr: "${expr}"\n`);
        }
      }
    }
  }
}

console.log(`Total KaTeX errors found: ${count}`);
console.log("\nError summary by message:");
for (const [msg, cnt] of errorTypes.entries()) {
  console.log(`  ${cnt}x: ${msg}`);
}
