const base =
  typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";

export const defaultCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-witch.png";

export const evaCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "eva-witch.png";

export const meiWarriorCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-warrior.png";

export const meiSegmentCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-segment.png";

export const meiWikiCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-wiki.jpg";
