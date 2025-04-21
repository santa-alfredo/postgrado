import { useState, useCallback } from "react";

export function useSpellcheck() {
  const [suggestion, setSuggestion] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const checkSpelling = useCallback(async (text: string) => {
    console.log("text", text);
    setIsChecking(true);

    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text,
          language: "es",
        }),
      });

      const data = await res.json();

      let corrected = text;
      let offsetShift = 0;

      for (const match of data.matches) {
        const from = match.offset + offsetShift;
        const to = from + match.length;
        const replacement = match.replacements?.[0]?.value;

        if (replacement) {
          corrected =
            corrected.slice(0, from) + replacement + corrected.slice(to);
          offsetShift += replacement.length - match.length;
        }
      }

      // Solo sugerimos si es distinto al original
      if (corrected !== text) {
        setSuggestion(corrected);
      } else {
        setSuggestion("");
      }
    } catch (err) {
      console.error("Spellcheck error:", err);
    }

    setIsChecking(false);
  }, []);

  return { suggestion, isChecking, checkSpelling };
}
