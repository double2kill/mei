import type { QuizType } from "./type";

export const quizTypeLabels: Record<QuizType, string> = {
  fixed: "女巫的毒药",
  random: "女巫的毒药",
  segment: "排段",
  sentence: "造句",
  baike: "百科",
  "baike-en": "百科(英)",
};

export const quizTypeStyles: Record<QuizType, string> = {
  fixed: "bg-blue-100 text-blue-700",
  random: "bg-blue-100 text-blue-700",
  segment: "bg-purple-100 text-purple-700",
  sentence: "bg-orange-100 text-orange-700",
  baike: "bg-teal-100 text-teal-700",
  "baike-en": "bg-teal-100 text-teal-800",
};
