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
        "狼人杀是一款基于心理学和逻辑推理的经典社交桌游，分为狼人、好人两大阵营",
    },
    {
      id: "segment0513",
      path: "/test/segment0513",
      title: "每日排段(5-13)",
      type: "segment",
      settings: false,
      answerText: "蒋泽宇，字湄，号大帅逼，福建漳州人士。",
    },
    {
      id: "segment0514",
      path: "/test/segment0514",
      title: "今日排段(5-14)",
      type: "segment",
      settings: false,
      answerText:
        "蒋泽宇，字湄，号帅逼居士，福建漳州人士。坚信没苦硬吃的人生信条：放着年 薪百万的工作不干，非得贷款上班搞直播。现为京城大师赛流水数一数二的头部主播。",
    },
    {
      id: "baike",
      path: "/test/baike",
      title: "百科猜标题",
      type: "baike",
      wikiTitle: "狼人杀",
      wikiDetail:
        "狼人杀是一款基于心理学和逻辑推理的经典社交桌游，玩家分为狼人阵营与好人阵营，通过发言、投票与技能博弈判定胜负。",
    },
    {
      id: "baike-en",
      path: "/test/baike-en",
      title: "Wiki Guess (EN)",
      type: "baike-en",
      wikiTitle: "Mount Everest",
      wikiDetail:
        "Mount Everest is Earth's highest mountain above sea level, standing on the border between Nepal and China. Climbers face extreme cold, thin air, and avalanches. The first confirmed summit was reached in 1953 by Edmund Hillary and Tenzing Norgay.",
    },
    {
      id: "sentence",
      path: "/test/sentence",
      title: "造句",
      type: "sentence",
      text: "蒋泽宇在京城大师赛上展现了惊人的狼人杀实力，他与刘小怂、JY等顶级玩家的精彩对决让观众大呼过瘾。",
      usageRequired: 60,
    },
    {
      id: "sentence0519",
      path: "/test/sentence0519",
      title: "造句(5-19)",
      type: "sentence",
      text: "号外号外，杭粤联动席位争夺赛，经过多日鏖战，流水席位的争夺只剩下湄与宝玉妹妹，他们在争夺深圳决赛席位的世纪PK中，榜100不是小心心、不是热气球，而是抖音1号，湄最终以榜100抖音1号、总榜1000万流水的恐怖成绩豪取胜利，成功晋级深圳决赛！",
      usageRequired: 30,
    },
    {
      id: "segment0515",
      path: "/test/segment0515",
      title: "今日排段(5-15)",
      type: "segment",
      settings: false,
      answerText:
        "在那山的那边海的那边有个湄少男战士，他爱穿比基尼，他在抖音行乞。他号召众人齐集暮光星辰之力，他住在三千钻的星光庄园里。",
    },
  ],
  homeScreen: {
    rows: [
      { quizId: "main", coverRef: "witch" },
      { quizId: "random", coverRef: "witch" },
      { quizId: "segment", coverRef: "witch" },
      { quizId: "segment0513", coverRef: "witch" },
      { quizId: "segment0514", coverRef: "witch" },
      { quizId: "baike", coverRef: "witch" },
      { quizId: "baike-en", coverRef: "witch" },
      { quizId: "sentence", coverRef: "witch" },
      { quizId: "sentence0519", coverRef: "witch" },
      { quizId: "segment0515", coverRef: "witch" },
    ],
  },
  evaScreen: {
    rows: [{ quizId: "eva", coverRef: "eva" }],
  },
};
