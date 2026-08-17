/** Window to undo the last sent answer and restore the prior question. */
export const ANSWER_UNDO_WINDOW_MS = 8_000;

/** Local assistant prompt when the user edits a field from “What I’ve noted”. */
export function buildFieldCorrectionPrompt(label: string, previousValue: string): string {
  const safeLabel = String(label || "that detail").trim() || "that detail";
  const prev = String(previousValue || "").trim();
  const noted = prev ? ` Previously noted: “${prev.slice(0, 160)}”.` : "";
  return `No problem — let's update **${safeLabel}**.${noted} What's the correct answer now? Tap an option if you see choices below — or type your own.`;
}

/** Embed phrasing so chip topic rules still match correction turns. */
export function correctionChipHintForLabel(label: string): string | null {
  const l = label.trim().toLowerCase();
  if (l.includes("geographic") || l === "reach" || l.includes("location")) {
    return "Where do you mainly serve customers — locally, regionally, nationally, or globally?";
  }
  if (l.includes("website") || l === "site") {
    return "Do you have a website URL to share today — even a simple landing page or store link?";
  }
  if (l.includes("social")) {
    return "Where does your brand show up on social today? Name the platforms that matter.";
  }
  if (l.includes("audience") || l.includes("customer")) {
    return "Who do you mainly sell to — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?";
  }
  if (l.includes("industry") || l.includes("space")) {
    return "What industry or space is the business in? A plain category is perfect.";
  }
  if (l.includes("role")) {
    return "How do you think about your role here? Tap below — or type your own.";
  }
  if (l.includes("team")) {
    return "How big is your team today — including you?";
  }
  if (l.includes("year") || l.includes("operating")) {
    return "Roughly how long have you been operating?";
  }
  if (l.includes("goal") || l.includes("outcome")) {
    return "Which outcomes matter most in the next 6–12 months? Tap all that apply below.";
  }
  if (l.includes("business") && !l.includes("year")) {
    return "What's the name of your business?";
  }
  if (l === "name") {
    return "What's your first name?";
  }
  return null;
}

export function buildFieldCorrectionAssistantText(label: string, previousValue: string): string {
  const prompt = buildFieldCorrectionPrompt(label, previousValue);
  const hint = correctionChipHintForLabel(label);
  if (!hint) return prompt;
  // Append a light topic anchor so on-screen chip detect still fires.
  return `${prompt}\n\n(${hint})`;
}
