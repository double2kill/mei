interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly PUBLIC_ZHIPU_API_KEY?: string;
  readonly PUBLIC_ZHIPU_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "wink-nlp" {
  type WinkNlp = {
    its: {
      type: string;
      lemma: string;
    };
    readDoc: (text: string) => {
      tokens: () => {
        filter: (fn: (t: { out: (key: string) => string }) => boolean) => {
          out: (key: string) => string[];
        };
      };
    };
  };
  function winkNLP(
    model: unknown,
    pipe?: string[],
  ): WinkNlp;
  export default winkNLP;
}

declare module "wink-eng-lite-web-model" {
  const model: unknown;
  export default model;
}

declare module "*.png" {
  const src: string;
  export default src;
}
