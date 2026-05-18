type SurplusCard = { char: string; surplus: number };

export function formatSurplusLabels(cards: SurplusCard[]): string[] {
  return cards.map((item) =>
    item.surplus > 1 ? `${item.char}×${item.surplus}` : item.char,
  );
}

export function surplusSubmitMessage(
  cards: SurplusCard[],
  action: string,
): string {
  return `存在多余的汉字「${formatSurplusLabels(cards).join("、")}」，请删除后再${action}`;
}

export function surplusCharMessage(char: string, surplus: number): string {
  return surplus > 1
    ? `「${char}」已多写 ${surplus} 个，请从输入框删除`
    : `「${char}」已多写，请从输入框删除`;
}
