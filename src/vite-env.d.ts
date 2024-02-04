/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<
    NonNullable<unknown>,
    NonNullable<unknown>,
    any
  >;
  export default component;
}

declare module "./assets/json/time.json" {
  type data = Record<string, { P: number; S: number; D: number; R: number }>;
  export default data;
}
