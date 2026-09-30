declare const __SERVER__: boolean;
declare const __CLIENT__: boolean;

declare module '*.svg' {
  const svg: { attributes: Record<string, string>; content: string };
  export default svg;
}
