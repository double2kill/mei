import { useCallback, useState } from "react";
import {
  clampRandomPoisonCount,
  loadRandomPoisonCount,
  maxRandomPoisonCount,
  saveRandomPoisonCount,
  thunderRandomRoundConfig,
} from "../test/quiz-config";
import { QuizPlayView } from "./QuizPlayView";

export function RandomThunderPage() {
  const [poisonCount, setPoisonCount] = useState(loadRandomPoisonCount);
  const [roundRefreshSignal, setRoundRefreshSignal] = useState(0);
  const getRoundConfig = useCallback(
    () => thunderRandomRoundConfig(poisonCount),
    [poisonCount],
  );
  const maxPoison = maxRandomPoisonCount();
  const onSaveToolbar = () => {
    saveRandomPoisonCount(poisonCount);
    setRoundRefreshSignal((n) => n + 1);
  };
  return (
    <QuizPlayView
      getRoundConfig={getRoundConfig}
      roundRefreshSignal={roundRefreshSignal}
      toolbar={
        <div className="flex w-full flex-wrap items-center gap-2 font-medium">
          <label className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-zinc-600 dark:text-zinc-400">
              毒药数量
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={maxPoison}
              value={poisonCount}
              onChange={(e) =>
                setPoisonCount(clampRandomPoisonCount(Number(e.target.value)))
              }
              className="min-h-10 w-20 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-center text-base tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
          <button
            type="button"
            onClick={onSaveToolbar}
            className="touch-manipulation min-h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white active:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            保存
          </button>
          <span className="text-zinc-500 dark:text-zinc-500">
            保存后重新随机毒药位置
          </span>
        </div>
      }
    />
  );
}
