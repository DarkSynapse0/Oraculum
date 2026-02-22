/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
export interface AnalyzerClassification {
  toxic: number;
  severe_toxic: number;
  threat: number;
  identity_attack: number;
  sexual_explicit: number;
  obscene: number;
}

export interface AnalyzerOutput {
  summary: string;
  primary_classification: string;
  classifications: AnalyzerClassification;
  recommended_action: "approve" | "review" | "flag" | "remove";
  metadata: Record<string, any>;
}

function parseAnalyzerJSON(text: string): AnalyzerOutput | { error: string } {
  try {
    const match = text.match(/```json([\s\S]*?)```/);
    const clean = match ? match[1].trim() : text.trim();

    const parsed = JSON.parse(clean);

    if (!parsed || typeof parsed !== "object") {
      return { error: "Invalid JSON returned by Gemini." };
    }
    return parsed as AnalyzerOutput;
  } catch (err: any) {
    return { error: `JSON parse failed: ${err.message}` };
  }
}

function getPrompt(text: string): string {
  return `
You are an advanced toxicity, safety, and harm classifier.

Analyze the following text and return ONLY a JSON object inside a code block \`\`\`json ... \`\`\`.

TEXT TO ANALYZE:
"${text}"

Your JSON MUST follow EXACTLY this structure:

\`\`\`json
{
  "summary": "Short explanation of what the text contains.",
  "primary_classification": "one of: toxic, severe_toxic, threat, identity_attack, sexual_explicit, obscene, neutral",
  "classifications": {
    "toxic": number (0-1),
    "severe_toxic": number (0-1),
    "threat": number (0-1),
    "identity_attack": number (0-1),
    "sexual_explicit": number (0-1),
    "obscene": number (0-1)
  },
  "recommended_action": "approve | review | flag | remove",
  "metadata": {
    "confidence": number,
    "notes": "Optional system notes"
  }
}
\`\`\`

IMPORTANT RULES:
- Use realistic numeric probabilities (0–1).
- If the text is harmless or academic, mark as "neutral".
- "remove" only for highly unsafe content.
- ALWAYS return valid JSON inside a code block.
`;
}

export async function analyzeComment(
  text: string,
): Promise<AnalyzerOutput | { error: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = getPrompt(text);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const parsed = parseAnalyzerJSON(responseText);

    if ("error" in parsed) {
      console.error("Analyzer JSON parse error:", parsed.error);
      return { error: parsed.error };
    }

    return parsed;
  } catch (err: any) {
    console.error("Analyzer failed:", err.message);
    return { error: err.message };
  }
}

export async function askAcademicAssistant(question: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are Oraculum AI, an academic assistant.
Answer clearly, concisely, and academically.
If the question is unclear, ask for clarification.

Question:
${question}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}