import winkNLP, { type ItsFunction } from "wink-nlp";
import model from "wink-eng-lite-web-model";

type Nlp = ReturnType<typeof winkNLP>;

let nlp: Nlp | null = null;
const lemmaCache = new Map<string, string>();

function getNlp(): Nlp {
  if (!nlp) nlp = winkNLP(model, ["pos"]);
  return nlp;
}

export function englishLemma(word: string): string {
  const raw = word.trim();
  if (!raw) return "";
  const cacheKey = raw.toLowerCase();
  const cached = lemmaCache.get(cacheKey);
  if (cached) return cached;

  const instance = getNlp();
  const its = instance.its;
  const lemmaIts = its.lemma as unknown as ItsFunction<string>;
  const doc = instance.readDoc(cacheKey);
  const lemmas = doc
    .tokens()
    .filter((t) => t.out(its.type) === "word")
    .out(lemmaIts) as string[];

  let lemma = cacheKey;
  if (lemmas.length === 1) {
    lemma = lemmas[0]!.toLowerCase();
  } else if (lemmas.length > 1) {
    lemma = lemmas.map((l) => l.toLowerCase()).join("");
  }

  lemmaCache.set(cacheKey, lemma);
  return lemma;
}
