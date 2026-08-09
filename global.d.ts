declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const content: { readonly [key: string]: string };
  export default content;
}

declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export type ResolvingMetadata = Promise<unknown>;
  export type ResolvingViewport = Promise<unknown>;
}

declare module "next/types.js" {
  export type ResolvingMetadata = Promise<unknown>;
  export type ResolvingViewport = Promise<unknown>;
}
