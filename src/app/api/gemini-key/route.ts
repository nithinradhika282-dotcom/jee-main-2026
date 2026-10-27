import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  return NextResponse.json({
    configured: hasGemini || hasGroq,
    hasGemini,
    hasGroq,
    activeEngine: hasGroq ? "Groq (Ultra-Fast 15ms)" : hasGemini ? "Google Gemini" : "Built-in"
  });
}

export async function POST(request: Request) {
  try {
    const { api_key, key_type } = await request.json();
    if (!api_key || typeof api_key !== "string" || api_key.trim().length < 8) {
      return NextResponse.json(
        { error: "Invalid API key format. Please provide a valid Gemini or Groq API key." },
        { status: 400 }
      );
    }

    const cleanKey = api_key.trim();
    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const isGroq = cleanKey.startsWith("gsk_") || key_type === "groq";

    if (isGroq) {
      process.env.GROQ_API_KEY = cleanKey;
      if (envContent.includes("GROQ_API_KEY=")) {
        envContent = envContent.replace(/GROQ_API_KEY=.*(\r?\n|$)/, `GROQ_API_KEY="${cleanKey}"$1`);
      } else {
        envContent += `\nGROQ_API_KEY="${cleanKey}"\n`;
      }
    } else {
      process.env.GEMINI_API_KEY = cleanKey;
      if (envContent.includes("GEMINI_API_KEY=")) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*(\r?\n|$)/, `GEMINI_API_KEY="${cleanKey}"$1`);
      } else {
        envContent += `\nGEMINI_API_KEY="${cleanKey}"\n`;
      }
    }

    fs.writeFileSync(envPath, envContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: `${isGroq ? "Groq" : "Gemini"} API Key saved and activated successfully!`,
      isGroq
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
