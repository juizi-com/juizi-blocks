declare const __SERVER__: boolean;
declare const __CLIENT__: boolean;

declare module '*.svg' {
  const svg: { attributes: Record<string, string>; content: string };
  export default svg;
}

declare module '@plone/volto/constants/Languages.cjs' {
  /** Volto's interface languages: { code: name in that language }. */
  const languages: Record<string, string>;
  export default languages;
}
