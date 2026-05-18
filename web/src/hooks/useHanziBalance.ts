import { useMemo } from "react";
import {
  hanziShortageVsAnswer,
  hanziSurplusVsAnswer,
} from "../test/segment-config";

export function useHanziBalance(
  answerText: string,
  draft: string,
  cardOrderSource: string,
) {
  const shortageCards = useMemo(
    () => hanziShortageVsAnswer(answerText, draft, cardOrderSource),
    [answerText, draft, cardOrderSource],
  );

  const surplusCards = useMemo(
    () => hanziSurplusVsAnswer(answerText, draft),
    [answerText, draft],
  );

  const hanziBalanced =
    shortageCards.length === 0 && surplusCards.length === 0;

  return { shortageCards, surplusCards, hanziBalanced };
}
