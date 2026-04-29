import { loadQuizConfig } from "../test/quiz-config";
import { QuizPlayView } from "./QuizPlayView";

export function TestPage() {
  return (
    <QuizPlayView getRoundConfig={loadQuizConfig} settingsTo="/test/settings" />
  );
}
