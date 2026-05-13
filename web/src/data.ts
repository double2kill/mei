import type { AppContent } from "./type";

const base =
  typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";

export const defaultCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-witch.png";

export const evaCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "eva-witch.png";

export const appContent: AppContent = {
  version: 1,
  quizzes: [
    {
      id: "main",
      path: "/test/main",
      title: "女巫的毒药",
      type: "fixed",
      settings: true,
    },
    {
      id: "random",
      path: "/test/random",
      title: "女巫的毒药（随机版）",
      type: "random",
    },
    {
      id: "eva",
      path: "/test/eva",
      title: "Eva(云上小师赛)",
      type: "random",
    },
    {
      id: "segment",
      path: "/test/segment",
      title: "每日排段(5-12)",
      type: "segment",
      settings: true,
      answerText:
        "狼人杀是一款基于心理学和逻辑推理的经典社交桌游，分为狼人、好人两大阵营。",
    },
    {
      id: "segment0513",
      path: "/test/segment0513",
      title: "每日排段(5-13)",
      type: "segment",
      settings: false,
      answerText: "蒋泽宇，字湄，号大帅逼，福建漳州人士。",
    },
  ],
  homeScreen: {
    rows: [
      { quizId: "main", coverRef: "witch" },
      { quizId: "random", coverRef: "witch" },
      { quizId: "segment", coverRef: "witch" },
      { quizId: "segment0513", coverRef: "witch" },
    ],
  },
  evaScreen: {
    rows: [{ quizId: "eva", coverRef: "eva" }],
  },
};
