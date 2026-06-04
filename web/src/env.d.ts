interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly PUBLIC_ZHIPU_API_KEY?: string;
  readonly PUBLIC_ZHIPU_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const src: string;
  export default src;
}
