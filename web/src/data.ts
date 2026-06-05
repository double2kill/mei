import type { AppContent } from "./type";

const base =
  typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";

export const defaultCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-witch.png";

export const evaCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "eva-witch.png";

export const meiWarriorCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-warrior.png";

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
      id: "baike0605",
      path: "/test/baike0605",
      title: "百科猜标题(6-5)",
      type: "baike",
      wikiTitle: "蝴蝶结",
      wikiDetail: [
        "蝴蝶结是一种常见的装饰结，因打结后两侧对称、形似昆虫翅膀而得名。",
        "它多由丝带、绸带或布料制成，可用于礼品包装、贺卡点缀、服装配饰与发饰造型。",
        "在礼仪场合，男士佩戴的领结也属于这类结饰，常与正装、宴会及婚礼造型搭配。",
        "制作时通常先绕成环再交叉收紧，最后调整两翼的弧度与松紧，使外形匀称美观。",
        "不同材质会带来不同效果：缎面丝带光泽柔和，棉麻织带更显质朴，宽窄与配色也影响整体风格。",
        "除了服饰与包装，蝴蝶结图案还常出现在童装、家居布艺、节庆布置与视觉设计中。",
        "在流行文化里，它往往象征可爱、精致或节日气氛，因此频繁出现于卡通形象与品牌标识。",
        "学习打结时，人们会先练习最简单的单层样式，再尝试双层、立体或多层叠加的复杂款式。",
        "无论是系在鞋上、包带、礼盒还是领口，这种结饰都能以较小成本提升整体造型的完成度。",
        "正因为结构清晰、视觉识别度高，它成为日常生活中最常见的手工装饰元素之一。",
      ].join(""),
    },
    {
      id: "baike-en",
      path: "/test/baike-en",
      title: "Wiki Guess (EN)",
      type: "baike-en",
      wikiTitle: "Wikipedia",
      wikiDetail: [
        "Wikipedia is a free online encyclopedia written and edited by volunteers around the world.",
        "It is hosted by the Wikimedia Foundation, a nonprofit organization, and built through open collaboration.",
        "People can create, revise, translate, and discuss articles in many languages, while other editors review changes and improve the text over time.",
        "The project collects information on history, science, culture, technology, geography, politics, people, places, art, medicine, sports, and many other subjects.",
        "Readers often use Wikipedia as a starting point for learning because articles summarize a topic, explain important ideas, link to related pages, and cite published sources for further reading.",
        "A typical article may include an introduction, background, sections, dates, names, images, tables, references, categories, and links to other articles.",
        "Editors improve pages by adding sources, fixing errors, checking neutrality, organizing sections, removing spam, translating content, and updating information when reliable sources become available.",
        "Wikipedia also has community rules, discussion pages, revision histories, watchlists, bots, and moderation tools that help contributors debate changes and protect articles from vandalism.",
        "Because anyone can edit many pages, readers are encouraged to check references, compare sources, and treat the encyclopedia as a guide rather than a final authority.",
        "Its strength comes from repeated editing, shared knowledge, public records of changes, and a large community that keeps improving articles after they are published.",
      ].join(" "),
    },
    {
      id: "baike-en0605",
      path: "/test/baike-en0605",
      title: "Wiki Guess (EN 6-5)",
      type: "baike-en",
      wikiTitle: "FIFA World Cup",
      wikiDetail: [
        "The FIFA World Cup is the most prestigious international football tournament, held every four years and organized by the Federation Internationale de Football Association.",
        "National teams from every continent compete in long qualifying campaigns before the final tournament brings together the strongest squads on the global stage.",
        "The first World Cup was held in Uruguay in 1930, and the tournament has since grown into one of the largest sporting events on Earth.",
        "Host nations build new stadiums, upgrade transport networks, and welcome millions of visitors who follow their teams across cities and fan zones.",
        "Each edition features a group stage, knockout rounds, and a final match that crowns a world champion after weeks of intense competition.",
        "Legendary players such as Pele, Diego Maradona, and Lionel Messi have defined eras with goals, assists, and performances that fans still discuss decades later.",
        "Television broadcasts, streaming platforms, and social media carry the action to billions of viewers, turning ordinary matches into shared global moments.",
        "Supporters travel with flags, songs, and national colors, filling stadiums with noise while players chase glory for their countries rather than club contracts.",
        "Golden Boot awards, clean sheets, red cards, extra time, and penalty shootouts all become part of the stories that define each tournament.",
        "Beyond sport, the World Cup shapes culture, politics, and business, influencing tourism, advertising, national pride, and the way people talk about football for years afterward.",
      ].join(" "),
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
      coverRef: "mei-warrior",
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
      { quizId: "baike0605", coverRef: "witch" },
      { quizId: "baike-en", coverRef: "witch" },
      { quizId: "baike-en0605", coverRef: "witch" },
      { quizId: "sentence", coverRef: "witch" },
      { quizId: "sentence0519", coverRef: "witch" },
      { quizId: "segment0515", coverRef: "witch" },
    ],
  },
  evaScreen: {
    rows: [{ quizId: "eva", coverRef: "eva" }],
  },
};
