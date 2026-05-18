import { formatSurplusLabels } from "../test/hanzi-play-messages";

type SurplusCard = { char: string; surplus: number };

type SurplusHanziBannerProps = {
  cards: SurplusCard[];
  action: string;
};

export function SurplusHanziBanner({ cards, action }: SurplusHanziBannerProps) {
  if (cards.length === 0) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-700/50 dark:bg-red-950/30">
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        警告：存在多余的汉字「{formatSurplusLabels(cards).join("、")}」，请删除后再{action}
      </p>
    </div>
  );
}
