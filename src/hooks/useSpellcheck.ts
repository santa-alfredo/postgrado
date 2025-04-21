import { useState } from "react";

interface SpellCheckResult {
  correctedText: string;
  suggestions: string;
}

export function useSpellcheck() {
  const [suggestions, setSuggestions] = useState<string>("");

  async function checkSpelling(text: string): Promise<SpellCheckResult> {
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text,
        language: "es",
      }),
    });

    const data = await response.json();

    let corrected = text;
    let offsetShift = 0;

    for (const match of data.matches) {
      const from = match.offset + offsetShift;
      const to = from + match.length;
      const replacement = match.replacements?.[0]?.value;

      if (replacement) {
        corrected = corrected.slice(0, from) + replacement + corrected.slice(to);
        offsetShift += replacement.length - match.length;
      }
    }

    const result: SpellCheckResult = {
      correctedText: corrected,
      suggestions: corrected !== text ? `Quizás quisiste decir: ${corrected}` : ""
    };

    setSuggestions(result.suggestions);
    return result;
  }

  return {
    suggestions,
    checkSpelling
  };
}
