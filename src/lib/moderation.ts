import { analyzeComment } from "./analyzer";

export async function moderateContent({
  title,
  context,
}: {
  title: string;
  context: string;
}): Promise<{ flagged: boolean; message?: string }> {
  const fullText = `${title}\n\n${context}`;
  const analysis = await analyzeComment(fullText);

  if ("error" in analysis) {
    console.error("Moderation analysis failed:", analysis);
    return {
      flagged: false, 
      message: "Moderation service unavailable, skipping strict checks.",
    };
  }

  const riskScore =
    analysis.classifications.toxic +
    analysis.classifications.severe_toxic +
    analysis.classifications.threat +
    analysis.classifications.identity_attack +
    analysis.classifications.sexual_explicit;

  const shouldFlag =
    analysis.recommended_action === "flag" ||
    analysis.recommended_action === "remove" ||
    riskScore > 0.45;

  if (shouldFlag) {
    return {
      flagged: true,
      message: `Comment flagged under '${analysis.primary_classification}' → ${analysis.summary}`,
    };
  }

  return { flagged: false };
}
