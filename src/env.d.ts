/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly PUBLIC_SITE_INDEXABLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
