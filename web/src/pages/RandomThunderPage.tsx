import { thunderRandomRoundConfig } from "../test/quiz-config";
import { QuizPlayView } from "./QuizPlayView";

export function RandomThunderPage() {
  return <QuizPlayView getRoundConfig={thunderRandomRoundConfig} />;
}
