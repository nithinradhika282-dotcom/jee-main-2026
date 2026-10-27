import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new DatabaseSync(dbPath);

console.log("Replacing \\text{______} and unescaped underscores with \\underline{\\hspace{1cm}}...");

function fixBlanks(text) {
  if (!text) return text;
  let clean = text;

  // Replace \text{______} with \underline{\hspace{1cm}}
  clean = clean.replace(/\\text\{_{2,}\}/g, "\\underline{\\hspace{1cm}}");
  clean = clean.replace(/\\text\{_\}/g, "\\underline{\\hspace{1cm}}");

  // Inside math blocks, replace any leftover unescaped underscores like ______
  clean = clean.replace(/\$\$([\s\S]*?)\$\$|\$([^\$]+?)\$/g, (mathMatch, d1, d2) => {
    const isBlock = Boolean(d1);
    let inner = d1 || d2;
    inner = inner.replace(/_{2,}/g, "\\underline{\\hspace{1cm}}");
    return isBlock ? `$$${inner}$$` : `$${inner}$`;
  });

  return clean;
}

const rows = db.prepare(`
  SELECT q.id, q.question_number, q.question_text_latex, q.options_json,
         e.hint, e.approach, e.full_solution_latex, e.common_mistake, e.no_pen_trick
  FROM questions q
  LEFT JOIN explanations e ON q.id = e.question_id
`).all();

let qCount = 0;
let eCount = 0;

for (const row of rows) {
  let qNeeds = false;
  const newQ = fixBlanks(row.question_text_latex);
  if (newQ !== row.question_text_latex) qNeeds = true;

  let newOpts = row.options_json;
  if (row.options_json) {
    try {
      const opts = JSON.parse(row.options_json);
      const fixedOpts = opts.map(fixBlanks);
      if (JSON.stringify(fixedOpts) !== row.options_json) {
        newOpts = JSON.stringify(fixedOpts);
        qNeeds = true;
      }
    } catch(e) {}
  }

  if (qNeeds) {
    db.prepare("UPDATE questions SET question_text_latex = ?, options_json = ? WHERE id = ?").run(newQ, newOpts, row.id);
    qCount++;
  }

  let eNeeds = false;
  const newSol = fixBlanks(row.full_solution_latex);
  const newHint = fixBlanks(row.hint);
  const newApp = fixBlanks(row.approach);
  const newMis = fixBlanks(row.common_mistake);
  const newNoPen = fixBlanks(row.no_pen_trick);

  if (
    newSol !== row.full_solution_latex ||
    newHint !== row.hint ||
    newApp !== row.approach ||
    newMis !== row.common_mistake ||
    newNoPen !== row.no_pen_trick
  ) {
    eNeeds = true;
  }

  if (eNeeds) {
    db.prepare(`
      UPDATE explanations
      SET full_solution_latex = ?, hint = ?, approach = ?, common_mistake = ?, no_pen_trick = ?
      WHERE question_id = ?
    `).run(newSol, newHint, newApp, newMis, newNoPen, row.id);
    eCount++;
  }
}

console.log(`Updated ${qCount} questions and ${eCount} explanations.`);
