import { shuffle } from "./quiz-config";

export function shuffledAnswerChars(answer: string): string {
  const g = Array.from(answer);
  if (g.length === 0) return "";
  return shuffle(g).join("");
}
